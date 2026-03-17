import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel?.();
          }}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950/95 p-5 text-slate-50 shadow-xl"
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            >
              <X size={14} />
            </button>

            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold leading-tight">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-xs text-slate-400">{description}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="px-3"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onConfirm}
                className="px-3"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
