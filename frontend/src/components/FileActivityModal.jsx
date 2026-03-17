import { useEffect, useState } from 'react';
import { X, Upload, Download, Share2, Trash2, Mail, Eye, LinkIcon, RotateCcw } from 'lucide-react';
import { getFileActivity } from '../api/files';
import { timeAgo }         from '../lib/utils';
import { Button }          from './ui/button';
import { cn }              from '../lib/utils';

const ACTION_CONFIG = {
  uploaded:       { icon: Upload,    label: 'Uploaded',          color: 'text-blue-600',   bg: 'bg-blue-50'   },
  downloaded:     { icon: Download,  label: 'Downloaded',        color: 'text-green-600',  bg: 'bg-green-50'  },
  shared:         { icon: Share2,    label: 'Share link created', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  share_revoked:  { icon: RotateCcw, label: 'Share revoked',     color: 'text-orange-600', bg: 'bg-orange-50' },
  share_emailed:  { icon: Mail,      label: 'Shared via email',  color: 'text-purple-600', bg: 'bg-purple-50' },
  deleted:        { icon: Trash2,    label: 'Deleted',           color: 'text-red-600',    bg: 'bg-red-50'    },
  previewed:      { icon: Eye,       label: 'Previewed',         color: 'text-teal-600',   bg: 'bg-teal-50'   },
};

function ActivityEntry({ log }) {
  const cfg = ACTION_CONFIG[log.actionType] ?? {
    icon: LinkIcon, label: log.actionType, color: 'text-gray-600', bg: 'bg-gray-50',
  };
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.bg)}>
          <Icon size={14} className={cfg.color} />
        </div>
        <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: 12 }} />
      </div>

      {/* Content */}
      <div className="pb-4 pt-1 min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{cfg.label}</p>
        {log.performedBy && (
          <p className="text-xs text-muted-foreground mt-0.5">
            by {log.performedBy.name || log.performedBy.email || 'user'}
          </p>
        )}
        {log.meta?.recipientEmail && (
          <p className="text-xs text-muted-foreground">to {log.meta.recipientEmail}</p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-0.5">{timeAgo(log.createdAt)}</p>
      </div>
    </div>
  );
}

/**
 * FileActivityModal — displays the activity timeline for a single file.
 * Props:
 *   isOpen    – boolean
 *   onClose   – () => void
 *   file      – { _id, originalName }
 */
export default function FileActivityModal({ isOpen, onClose, file }) {
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!isOpen || !file?._id) return;
    setLoading(true);
    getFileActivity(file._id)
      .then(({ data }) => setActivity(data.activity))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [isOpen, file?._id]);

  if (!isOpen || !file) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="flex w-full max-w-sm flex-col rounded-2xl bg-background shadow-2xl max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="font-semibold">Activity</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={file.originalName}>
              {file.originalName}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex h-24 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!loading && activity.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
          )}

          {!loading && activity.length > 0 && (
            <div>
              {activity.map((log) => (
                <ActivityEntry key={log._id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
