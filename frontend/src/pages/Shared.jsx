import { useEffect, useState } from 'react';
import { Share2, Copy, Link, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import * as filesAPI from '../api/files';
import { timeAgo, formatBytes, formatExpiry, isExpired } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Badge }  from '../components/ui/badge';
import { motion } from 'framer-motion';

export default function Shared() {
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesAPI.getFiles()
      .then(({ data }) => {
        const shared = (data.files || []).filter((f) => f.shareToken && !isExpired(f.shareExpiry));
        setFiles(shared);
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-10 w-40 rounded-xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shared Files</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {files.length} active share link{files.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Share2 size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-lg">No active share links</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            When you create share links for your files, they will appear here.
          </p>
        </div>
      ) : (
        <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          {files.map((file) => {
            const expired = isExpired(file.shareExpiry);
            const name    = file.originalName || file.fileName;
            const shareUrl = `${window.location.origin}/share/${file.shareToken}`;

            return (
              <motion.div key={file._id} className="glass rounded-2xl p-4 flex items-center gap-4 shadow-sm border-white/20 dark:border-white/10 transition-shadow hover:shadow-md" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.01, x: 2 }}>
                {/* Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Link size={18} className="text-primary" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(file.fileSize)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} />
                      {file.shareExpiry
                        ? expired ? 'Expired' : `Expires ${formatExpiry(file.shareExpiry)}`
                        : 'No expiry'}
                    </span>
                    {file.downloadCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{file.downloadCount} download{file.downloadCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <Badge variant={expired ? 'destructive' : 'secondary'} className="flex-shrink-0 text-xs">
                  {expired ? 'Expired' : 'Active'}
                </Badge>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyLink(file.shareToken)}
                    title="Copy link"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Open link"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
