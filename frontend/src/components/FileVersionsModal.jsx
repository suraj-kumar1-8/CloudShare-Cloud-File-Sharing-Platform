import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Download, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFileVersions, getFileVersionDownloadUrl } from '../api/files';
import { formatBytes, timeAgo } from '../lib/utils';
import { Button } from './ui/button';

export default function FileVersionsModal({ isOpen, onClose, file }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isOpen || !file?._id) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    getFileVersions(file._id)
      .then(({ data }) => {
        if (cancelled) return;
        setData(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err.response?.data?.message || 'Failed to load versions';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, file?._id]);

  const handleDownloadVersion = async (versionNumber) => {
    try {
      const { data: res } = await getFileVersionDownloadUrl(file._id, versionNumber);
      if (res?.url) {
        window.open(res.url, '_blank');
      } else {
        toast.error('No download URL returned');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get version download URL');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 px-5 py-4 text-slate-50 shadow-xl"
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <Layers size={18} />
              </span>
              <div>
                <h2 className="text-sm font-semibold leading-tight">File version history</h2>
                <p className="text-xs text-slate-400">
                  {file?.originalName || file?.fileName}
                </p>
              </div>
            </div>

            {loading && (
              <div className="py-8 text-center text-xs text-slate-400">Loading versions…</div>
            )}

            {!loading && error && (
              <div className="py-4 text-center text-xs text-red-400">{error}</div>
            )}

            {!loading && !error && data && (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        Current v{data.current.versionNumber}
                      </span>
                      <span className="truncate text-slate-100">
                        {data.current.originalName}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {data.current.fileSizeHuman || formatBytes(data.current.fileSize || 0)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock size={11} className="opacity-70" />
                    <span>Uploaded {timeAgo(data.current.createdAt)}</span>
                  </div>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {data.versions.length === 0 && (
                    <p className="py-6 text-center text-[11px] text-slate-500">
                      No previous versions yet. Upload a new version to start the history.
                    </p>
                  )}

                  {data.versions.map((v) => (
                    <div
                      key={v.versionNumber}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                            v{v.versionNumber}
                          </span>
                          <span className="truncate text-slate-100">
                            {v.originalName}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{v.fileSizeHuman || formatBytes(v.fileSize || 0)}</span>
                          <span>·</span>
                          <span>Uploaded {timeAgo(v.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 h-7 w-7 rounded-full text-slate-200 hover:bg-slate-700/80 hover:text-white"
                        onClick={() => handleDownloadVersion(v.versionNumber)}
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
