import { useState, useRef, useEffect } from 'react';
import {
  FileText, Image, Film, Music, File, Trash2, Download, Share2, Clock, Eye, Mail,
  History, Link, AlertTriangle, Pencil, Check, X, Layers, Upload,
} from 'lucide-react';
import toast              from 'react-hot-toast';
import { cn, formatBytes, timeAgo, fileTypeColor, formatExpiry, isExpired } from '../lib/utils';
import { Badge }          from './ui/badge';
import { Button }         from './ui/button';
import GlassCard          from './GlassCard';
import { motion } from 'framer-motion';
import ShareLinkModal       from './ShareLinkModal';
import PreviewModal         from './PreviewModal';
import ShareEmailModal      from './ShareEmailModal';
import FileActivityModal    from './FileActivityModal';
import { shareOnce, renameFile, uploadFileVersion } from '../api/files';
import Tilt from 'react-parallax-tilt';
import FileVersionsModal    from './FileVersionsModal';
import ConfirmDialog        from './ConfirmDialog';

// ── Icon per mime type ────────────────────────────────────────────────────────
function FileIcon({ mimeType, size = 32 }) {
  if (!mimeType)                    return <File size={size} />;
  if (mimeType.startsWith('image')) return <Image size={size} className="text-purple-500" />;
  if (mimeType.startsWith('video')) return <Film  size={size} className="text-pink-500"   />;
  if (mimeType.startsWith('audio')) return <Music size={size} className="text-yellow-500" />;
  if (mimeType.includes('pdf'))     return <FileText size={size} className="text-red-500" />;
  return <File size={size} className="text-blue-500" />;
}

/**
 * FileCard — displays metadata for one uploaded file.
 * Props:
 *   file        – file metadata object from the API
 *   onDelete    – async callback(id) to delete the file
 *   onDownload  – async callback(id) to get the download URL
 */
export default function FileCard({ file, onDelete, onDownload }) {
  const [deleting,    setDeleting]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareOpen,   setShareOpen]  = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emailOpen,   setEmailOpen]  = useState(false);

  // Local copy of share state so the card updates after modal actions
  const [activityOpen, setActivityOpen] = useState(false);
  const [oneTimeLoading, setOneTimeLoading] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionUploading, setVersionUploading] = useState(false);
  const [versionProgress, setVersionProgress] = useState(0);

  const [shareInfo, setShareInfo] = useState({
    shareToken:  file.shareToken  ?? null,
    shareExpiry: file.shareExpiry ?? null,
    hasShareLink: file.hasShareLink ?? !!file.shareToken,
  });

  // Local download counter (incremented optimistically after each download)
  const [dlCount, setDlCount] = useState(file.downloadCount ?? 0);
  const [lastDl,  setLastDl]  = useState(file.lastDownloadedAt ?? null);

  // Inline rename state
  const [renaming,     setRenaming]     = useState(false);
  const [renameValue,  setRenameValue]  = useState(file.originalName || file.fileName);
  const [displayName,  setDisplayName]  = useState(file.originalName || file.fileName);
  const [renameSaving, setRenameSaving] = useState(false);
  const renameInputRef = useRef(null);
  const versionFileInputRef = useRef(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  const handleShareUpdated = (patch) => {
    setShareInfo((prev) => ({ ...prev, ...patch }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(file._id);
      toast.success('File deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete file');
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await onDownload(file._id);
      window.open(url, '_blank');
      // Optimistically update local counters so the UI refreshes without a re-fetch
      setDlCount((c) => c + 1);
      setLastDl(new Date().toISOString());
    } catch (err) {
      toast.error(err.message || 'Failed to generate download link');
    } finally {
      setDownloading(false);
    }
  };

  const handleRenameCommit = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === displayName) { setRenaming(false); return; }
    setRenameSaving(true);
    try {
      await renameFile(file._id, trimmed);
      setDisplayName(trimmed);
      toast.success('File renamed');
    } catch (err) {
      toast.error(err.message || 'Rename failed');
      setRenameValue(displayName);
    } finally {
      setRenaming(false);
      setRenameSaving(false);
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter')  handleRenameCommit();
    if (e.key === 'Escape') { setRenaming(false); setRenameValue(displayName); }
  };

  const expiryLabel = formatExpiry(shareInfo.shareExpiry);
  const expired      = isExpired(shareInfo.shareExpiry);

  // File-level expiry (not share link expiry)
  const fileExpired  = file.expiryDate ? new Date(file.expiryDate) <= new Date() : false;
  const fileExpiryLabel = (() => {
    if (!file.expiryDate) return null;
    if (fileExpired) return 'File expired';
    const diff = new Date(file.expiryDate) - Date.now();
    const h = Math.floor(diff / 3_600_000);
    if (h < 24)  return `File expires in ${h}h`;
    return `File expires in ${Math.floor(h / 24)}d`;
  })();

  const handleShareOnce = async () => {
    setOneTimeLoading(true);
    try {
      const { data } = await shareOnce(file._id);
      const link = `${window.location.origin}/share/${data.shareToken}`;
      await navigator.clipboard.writeText(link);
      toast.success('One-time link copied to clipboard!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create one-time link');
    } finally {
      setOneTimeLoading(false);
    }
  };

  const handleUploadVersionClick = () => {
    if (versionUploading) return;
    versionFileInputRef.current?.click();
  };

  const handleVersionFileChange = async (e) => {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    setVersionUploading(true);
    setVersionProgress(0);
    try {
      await uploadFileVersion(file._id, selected, setVersionProgress);
      toast.success('New version uploaded. It will appear shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload new version');
    } finally {
      setVersionUploading(false);
      setVersionProgress(0);
      e.target.value = '';
    }
  };

  return (
    <>
    <input
      ref={versionFileInputRef}
      type="file"
      className="hidden"
      onChange={handleVersionFileChange}
    />
    <Tilt glareEnable={true} glareMaxOpacity={0.45} scale={1.04} tiltMaxAngleX={12} tiltMaxAngleY={12} className="w-full">
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <GlassCard className="group">
          <div className="flex items-start gap-4 p-4">
            {/* File type icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
              <FileIcon mimeType={file.fileType} />
            </div>

            {/* Metadata */}
            <div className="min-w-0 flex-1">
              {renaming ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRenameCommit}
                    className="min-w-0 flex-1 rounded border border-primary bg-background px-2 py-0.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={renameSaving}
                  />
                  <button onClick={handleRenameCommit} disabled={renameSaving} className="text-green-500 hover:text-green-600">
                    <Check size={14} />
                  </button>
                  <button onClick={() => { setRenaming(false); setRenameValue(displayName); }} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p
                  title={displayName}
                  className="truncate font-medium leading-tight"
                >
                  {displayName}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatBytes(file.fileSize)}</span>
                <span>·</span>
                <span>{timeAgo(file.createdAt)}</span>
                {dlCount > 0 && (
                  <>
                    <span>·</span>
                    <span title={lastDl ? `Last downloaded ${timeAgo(lastDl)}` : undefined}>
                      ↓ {dlCount} {dlCount === 1 ? 'download' : 'downloads'}
                      {lastDl ? ` · ${timeAgo(lastDl)}` : ''}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge
                  className={cn('text-xs', fileTypeColor(file.fileType))}
                  variant="outline"
                >
                  {file.fileType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
                </Badge>
                {shareInfo.hasShareLink && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs flex items-center gap-1',
                      expired
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-green-300 bg-green-50 text-green-700'
                    )}
                  >
                    <Clock size={10} />
                    {expired ? 'Link expired' : (expiryLabel ?? 'Shared')}
                  </Badge>
                )}
                {fileExpiryLabel && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs flex items-center gap-1',
                      fileExpired
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-amber-300 bg-amber-50 text-amber-700'
                    )}
                  >
                    <AlertTriangle size={10} />
                    {fileExpiryLabel}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {[
                { icon: Pencil, title: 'Rename file', onClick: () => { setRenaming(true); setRenameValue(displayName); } },
                { icon: Upload, title: versionUploading ? `Uploading… ${versionProgress}%` : 'Upload new version', onClick: handleUploadVersionClick, disabled: versionUploading },
                { icon: Layers, title: 'Version history', onClick: () => setVersionsOpen(true) },
                { icon: History, title: 'Activity timeline', onClick: () => setActivityOpen(true) },
                { icon: Link, title: 'One-time download link (copies to clipboard)', onClick: handleShareOnce, disabled: oneTimeLoading },
                { icon: Eye, title: 'Preview file', onClick: () => setPreviewOpen(true) },
                { icon: Mail, title: 'Share via email', onClick: () => setEmailOpen(true) },
                { icon: Share2, title: 'Share file', onClick: () => setShareOpen(true), className: shareInfo.hasShareLink && !expired ? 'text-green-600' : '' },
                { icon: Download, title: 'Download', onClick: handleDownload, disabled: downloading },
                { icon: Trash2, title: 'Delete', onClick: () => setConfirmDeleteOpen(true), disabled: deleting, className: 'text-destructive hover:bg-destructive/10 hover:text-destructive' },
              ].map(({ icon: Icon, ...props }, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.15, boxShadow: '0 0 12px #06b6d4' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    {...props}
                  >
                    <Icon size={16} />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Tilt>

    {/* Share Link Modal */}
    <ShareLinkModal
      isOpen={shareOpen}
      onClose={() => setShareOpen(false)}
      file={{ ...file, ...shareInfo }}
      onShareUpdated={handleShareUpdated}
    />

    {/* Preview Modal */}
    <PreviewModal
      isOpen={previewOpen}
      onClose={() => setPreviewOpen(false)}
      file={file}
      onDownload={handleDownload}
    />

    {/* Share via Email Modal */}
    <ShareEmailModal
      isOpen={emailOpen}
      onClose={() => setEmailOpen(false)}
      file={file}
    />

    {/* File Activity Timeline */}
    <FileActivityModal
      isOpen={activityOpen}
      onClose={() => setActivityOpen(false)}
      file={file}
    />

    {/* File Version History */}
    <FileVersionsModal
      isOpen={versionsOpen}
      onClose={() => setVersionsOpen(false)}
      file={file}
    />

    {/* Delete confirmation */}
    <ConfirmDialog
      open={confirmDeleteOpen}
      title="Delete this file?"
      description="This will permanently remove the file and any related share links. This action cannot be undone."
      confirmLabel="Delete file"
      cancelLabel="Cancel"
      onCancel={() => setConfirmDeleteOpen(false)}
      onConfirm={async () => {
        setConfirmDeleteOpen(false);
        await handleDelete();
      }}
    />
    </>
  );
}
