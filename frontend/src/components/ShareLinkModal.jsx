import { useEffect, useRef, useState } from 'react';
import { Copy, CheckCheck, Link2, Link2Off, Clock, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import * as filesAPI   from '../api/files';
import { formatExpiry, isExpired } from '../lib/utils';
import { Button }      from './ui/button';
import { Input }       from './ui/input';
import { Label }       from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';

// ── Expiry options ─────────────────────────────────────────────────────────────
const EXPIRY_OPTIONS = [
  { label: '1 hour',   value: 1,   desc: 'Link expires in 1 hour' },
  { label: '24 hours', value: 24,  desc: 'Link expires tomorrow' },
  { label: '7 days',   value: 168, desc: 'Link expires in one week' },
  { label: 'No expiry',value: 0,   desc: 'Link never expires' },
];

/**
 * ShareLinkModal — create / view / revoke expiring share links for a file.
 *
 * Props:
 *   isOpen          – boolean
 *   onClose         – () => void
 *   file            – file metadata object (needs _id, originalName, shareToken, shareExpiry)
 *   onShareUpdated  – (patch: { shareToken, shareExpiry, hasShareLink }) => void
 */
export default function ShareLinkModal({ isOpen, onClose, file, onShareUpdated }) {
  const [selected,   setSelected]   = useState(24);      // default: 24 h
  const [generating, setGenerating] = useState(false);
  const [revoking,   setRevoking]   = useState(false);
  const [shareUrl,   setShareUrl]   = useState('');
  const [expiry,     setExpiry]     = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [isProtected,setIsProtected] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const inputRef = useRef(null);

  // When the modal opens, pre-populate with any existing share info from the file prop
  useEffect(() => {
    if (!isOpen) return;
    if (file?.shareToken) {
      const url = `${window.location.origin}/share/${file.shareToken}`;
      setShareUrl(url);
      setExpiry(file.shareExpiry || null);
      setIsProtected(file.isPasswordProtected ?? false);
    } else {
      setShareUrl('');
      setExpiry(null);
      setIsProtected(false);
    }
    setPassword('');
    setShowPw(false);
    setCopied(false);
  }, [isOpen, file]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const expired = isExpired(expiry);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await filesAPI.createShareLink(file._id, selected, password || undefined);
      // Build frontend share URL from the returned token
      const url = `${window.location.origin}/share/${data.token}`;
      setShareUrl(url);
      setExpiry(data.shareExpiry || null);
      setIsProtected(data.isPasswordProtected ?? false);
      setPassword('');
      onShareUpdated?.({
        shareToken:          data.token,
        shareExpiry:         data.shareExpiry,
        hasShareLink:        true,
        isPasswordProtected: data.isPasswordProtected ?? false,
      });
      toast.success('Share link generated!');
      setTimeout(() => inputRef.current?.select(), 50);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await filesAPI.revokeShareLink(file._id);
      setShareUrl('');
      setExpiry(null);
      setIsProtected(false);
      setPassword('');
      onShareUpdated?.({ shareToken: null, shareExpiry: null, hasShareLink: false, isPasswordProtected: false });
      toast.success('Share link revoked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke link');
    } finally {
      setRevoking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const expiryLabel = formatExpiry(expiry);
  const hasActiveLink = !!shareUrl && !expired;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg"><Card className="w-full shadow-2xl glass border-white/20 dark:border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-primary" />
            <CardTitle className="text-base">Share file</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground truncate">{file.originalName}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ── Step 1: Choose expiry ──────────────────────────────────────── */}
          <div>
            <p className="mb-2 text-sm font-medium">Link expiry</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  title={opt.desc}
                  className={[
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    selected === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-accent',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Optional password ─────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Lock size={13} />
              Download password
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for no password"
                className="pr-10 text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with the link must enter this password to download.
            </p>
          </div>

          {/* ── Step 2: Generate button ────────────────────────────────────── */}
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generating}
          >
            <Link2 size={15} className="mr-2" />
            {shareUrl ? 'Regenerate link' : 'Generate share link'}
          </Button>

          {/* ── Active share link display ──────────────────────────────────── */}
          {shareUrl && (
            <div className="space-y-3">
              {/* Password-protected badge */}
              {isProtected && !expired && (
                <div className="flex items-center gap-1.5 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-800">
                  <Lock size={12} />
                  <span>Password protected — recipients must enter the password</span>
                </div>
              )}

              {/* Expiry status badge */}
              {expiry ? (
                <div className={[
                  'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium',
                  expired
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200',
                ].join(' ')}>
                  <Clock size={13} />
                  <span>{expiryLabel}</span>
                  {!expired && (
                    <span className="ml-auto text-muted-foreground">
                      {new Date(expiry).toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                  <Clock size={13} />
                  <span>No expiry — link is valid indefinitely</span>
                </div>
              )}

              {/* URL input + copy button */}
              {!expired && (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    readOnly
                    value={shareUrl}
                    onClick={(e) => e.target.select()}
                    className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    size="icon"
                    variant={copied ? 'default' : 'outline'}
                    onClick={handleCopy}
                    title="Copy link"
                  >
                    {copied
                      ? <CheckCheck size={15} className="text-green-500" />
                      : <Copy size={15} />
                    }
                  </Button>
                </div>
              )}

              {/* Revoke button */}
              <Button
                variant="destructive"
                className="w-full"
                size="sm"
                onClick={() => setConfirmRevokeOpen(true)}
                disabled={revoking}
              >
                <Link2Off size={14} className="mr-2" />
                Revoke link
              </Button>
            </div>
          )}

          {/* ── Close ─────────────────────────────────────────────────────── */}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
      </motion.div>
      <ConfirmDialog
        open={confirmRevokeOpen}
        title="Revoke this share link?"
        description="Recipients will immediately lose access to this file when the link is revoked."
        confirmLabel="Revoke link"
        cancelLabel="Keep link"
        onCancel={() => setConfirmRevokeOpen(false)}
        onConfirm={async () => {
          setConfirmRevokeOpen(false);
          await handleRevoke();
        }}
      />
    </div>
  );
}
