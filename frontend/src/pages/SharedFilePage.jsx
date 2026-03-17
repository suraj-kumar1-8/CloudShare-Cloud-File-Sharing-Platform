import { useEffect, useRef, useState } from 'react';
import { useParams, Link }              from 'react-router-dom';
import {
  Cloud, FileText, Image, Film, Music, File as FileIcon,
  Download, Lock, Eye, EyeOff, Clock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import * as filesAPI      from '../api/files';
import { formatBytes, formatExpiry } from '../lib/utils';
import { Button }         from '../components/ui/button';
import { Input }          from '../components/ui/input';
import { Label }          from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

// ── File type icon (reused from FileCard) ─────────────────────────────────────
function TypeIcon({ mimeType, size = 40 }) {
  if (!mimeType)                    return <FileIcon  size={size} className="text-blue-500" />;
  if (mimeType.startsWith('image')) return <Image     size={size} className="text-purple-500" />;
  if (mimeType.startsWith('video')) return <Film      size={size} className="text-pink-500"   />;
  if (mimeType.startsWith('audio')) return <Music     size={size} className="text-yellow-500" />;
  if (mimeType.includes('pdf'))     return <FileText  size={size} className="text-red-500"    />;
  return <FileIcon size={size} className="text-blue-500" />;
}

// ── States ────────────────────────────────────────────────────────────────────
const STATE = {
  LOADING:       'loading',     // fetching file info
  NEEDS_PASSWORD:'password',    // password form visible
  READY:         'ready',       // non-protected, show Download button
  DOWNLOADING:   'downloading', // POST in progress
  SUCCESS:       'success',     // download URL obtained
  ERROR:         'error',       // expired / not found / server error
};

export default function SharedFilePage() {
  const { token }                 = useParams();
  const [state,      setState]    = useState(STATE.LOADING);
  const [fileInfo,   setFileInfo] = useState(null);   // from /info endpoint
  const [downloadUrl,setDownloadUrl] = useState(null);
  const [password,   setPassword] = useState('');
  const [showPw,     setShowPw]   = useState(false);
  const [pwError,    setPwError]  = useState('');
  const [errorMsg,   setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pwInputRef = useRef(null);

  // ── Step 1: fetch public file info on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await filesAPI.getShareInfo(token);
        setFileInfo(data);
        setState(data.isPasswordProtected ? STATE.NEEDS_PASSWORD : STATE.READY);
        if (data.isPasswordProtected) {
          setTimeout(() => pwInputRef.current?.focus(), 50);
        }
      } catch (err) {
        const status = err.response?.status;
        const msg    = err.response?.data?.message || err.message || 'Something went wrong';
        setErrorMsg(msg);
        setState(STATE.ERROR);
        // For expired links, keep the message from the server
        if (status === 410) setErrorMsg(err.response.data.message);
      }
    })();
  }, [token]);

  // ── Step 2: exchange token (+ password) for a download URL ─────────────────
  const handleDownload = async (e) => {
    e?.preventDefault();
    setPwError('');

    if (fileInfo?.isPasswordProtected && !password) {
      setPwError('Please enter the password.');
      pwInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setState(STATE.DOWNLOADING);
    try {
      const { data } = await filesAPI.downloadSharedFile(token, password || undefined);
      setDownloadUrl(data.url);
      setState(STATE.SUCCESS);
      // Auto-open the file
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        // Wrong password — go back to password form
        setPwError(err.response?.data?.message || 'Incorrect password. Please try again.');
        setState(STATE.NEEDS_PASSWORD);
        setPassword('');
        setTimeout(() => pwInputRef.current?.focus(), 50);
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Download failed');
        setState(STATE.ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Layout shell ────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow">
              <Cloud size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CloudShare</span>
          </Link>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {state === STATE.LOADING && (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading file info…</p>
            </CardContent>
          </Card>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {state === STATE.ERROR && (
          <Card className="border-red-200 shadow-lg">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle size={48} className="text-red-400" />
              <p className="font-semibold text-red-700">Link unavailable</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/">Go to CloudShare</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── File info card (shown for password + ready + downloading + success) */}
        {fileInfo && state !== STATE.LOADING && state !== STATE.ERROR && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <TypeIcon mimeType={fileInfo.fileType} />
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate text-base" title={fileInfo.originalName}>
                    {fileInfo.originalName}
                  </CardTitle>
                  <CardDescription className="mt-0.5 flex items-center gap-2 text-xs">
                    <span>{formatBytes(fileInfo.fileSize)}</span>
                    {fileInfo.shareExpiry && (
                      <>
                        <span>·</span>
                        <Clock size={11} />
                        <span>{formatExpiry(fileInfo.shareExpiry)}</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>

              {/* Protection badge */}
              {fileInfo.isPasswordProtected && (
                <div className="flex items-center gap-1.5 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800">
                  <Lock size={12} />
                  <span>This file is password protected</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* ── Password form ────────────────────────────────────────── */}
              {(state === STATE.NEEDS_PASSWORD || state === STATE.DOWNLOADING) && (
                <form onSubmit={handleDownload} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dl-password">Password</Label>
                    <div className="relative">
                      <Input
                        ref={pwInputRef}
                        id="dl-password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
                        placeholder="Enter download password"
                        className={pwError ? 'border-destructive pr-10' : 'pr-10'}
                        autoComplete="current-password"
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwError && (
                      <p className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle size={12} />
                        {pwError}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    <Lock size={15} className="mr-2" />
                    {submitting ? 'Verifying…' : 'Unlock & Download'}
                  </Button>
                </form>
              )}

              {/* ── Non-protected: simple download button ────────────────── */}
              {state === STATE.READY && (
                <Button className="w-full" onClick={handleDownload}>
                  <Download size={15} className="mr-2" />
                  Download file
                </Button>
              )}

              {/* ── Downloading spinner ───────────────────────────────────── */}
              {state === STATE.DOWNLOADING && !fileInfo.isPasswordProtected && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Preparing download…
                </div>
              )}

              {/* ── Success ──────────────────────────────────────────────── */}
              {state === STATE.SUCCESS && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    <CheckCircle2 size={16} />
                    <span>Your download has started!</span>
                  </div>
                  {downloadUrl && (
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download size={14} className="mr-2" />
                        Download again
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Powered by{' '}
          <Link to="/" className="font-medium text-primary hover:underline">CloudShare</Link>
        </p>
      </div>
    </div>
  );
}
