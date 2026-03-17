import { useEffect, useState }      from 'react';
import { X, Download, ExternalLink, Sparkles } from 'lucide-react';
import { formatBytes }               from '../lib/utils';
import { Button }                    from './ui/button';
import { getFileSummary, chatWithFile }           from '../api/files';

/**
 * PreviewModal — renders an in-browser preview of a file.
 *
 * Supported types:
 *   • image/*   → <img> with object-fit contain
 *   • video/*   → <video> with controls
 *   • audio/*   → <audio> with controls
 *   • *\/pdf    → <iframe>
 *   • everything else → "preview unavailable" prompt
 *
 * Props:
 *   isOpen     – boolean
 *   onClose    – () => void
 *   file       – file metadata object  { originalName, fileType, fileUrl, fileSize }
 *   onDownload – async () => void  called when the user clicks "Download"
 */
export default function PreviewModal({ isOpen, onClose, file, onDownload }) {
  if (!isOpen || !file) return null;

  const { originalName, fileType = '', fileUrl, fileSize } = file;
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isPdf   = fileType === 'application/pdf' || fileType.endsWith('/pdf');
  const isDocumentLike = isPdf
    || fileType.startsWith('text/')
    || fileType.includes('word')
    || fileType.includes('officedocument');

  const [summaryState, setSummaryState] = useState({
    loading:  false,
    error:    null,
    summary:  file.summary  || null,
    keywords: Array.isArray(file.keywords) ? file.keywords : [],
  });

  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const [chatError,   setChatError]     = useState(null);
  const [chatAnswer,  setChatAnswer]    = useState('');

  // Fetch AI summary/keywords when opening a supported document type.
  useEffect(() => {
    if (!isOpen || !file || !file._id || !isDocumentLike) return;

    const hasCachedSummary = !!file.summary || (Array.isArray(file.keywords) && file.keywords.length > 0);
    if (hasCachedSummary) {
      setSummaryState({
        loading:  false,
        error:    null,
        summary:  file.summary || null,
        keywords: Array.isArray(file.keywords) ? file.keywords : [],
      });
      return;
    }

    let cancelled = false;
    setSummaryState((prev) => ({ ...prev, loading: true, error: null }));

    getFileSummary(file._id)
      .then(({ data }) => {
        if (cancelled) return;
        setSummaryState({
          loading:  false,
          error:    null,
          summary:  data.summary || null,
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || 'Failed to load AI summary';
        setSummaryState({ loading: false, error: message, summary: null, keywords: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, file, isDocumentLike]);

  // Click outside closes the modal
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !file?._id) return;
    setChatLoading(true);
    setChatError(null);
    setChatAnswer('');
    try {
      const { data } = await chatWithFile(file._id, chatQuestion.trim());
      setChatAnswer(data.answer || '');
    } catch (err) {
      setChatError(err.message || 'Failed to ask AI about this file');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="flex w-full max-w-4xl flex-col rounded-2xl bg-background shadow-2xl overflow-hidden max-h-[90vh]">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate font-semibold text-sm" title={originalName}>{originalName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(fileSize)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Open in new tab"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <ExternalLink size={16} />
            </Button>
            {onDownload && (
              <Button variant="ghost" size="icon" title="Download" onClick={onDownload}>
                <Download size={16} />
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Close" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* ── Preview area ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 items-center justify-center overflow-auto bg-muted/30 p-4">
          {isImage && (
            <img
              src={fileUrl}
              alt={originalName}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow"
            />
          )}

          {isVideo && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={fileUrl}
              controls
              className="max-h-[70vh] max-w-full rounded-lg shadow"
            />
          )}

          {isAudio && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-5xl">
                🎵
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio src={fileUrl} controls className="w-80" />
            </div>
          )}

          {isPdf && (
            <iframe
              src={fileUrl}
              title={originalName}
              className="h-[70vh] w-full rounded-lg border-0 shadow"
            />
          )}

          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="text-5xl">📄</span>
              <p className="font-medium">Preview not available for this file type</p>
              <p className="text-sm text-muted-foreground">
                {fileType || 'Unknown type'} — open directly or download to view.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink size={14} className="mr-2" />
                Open file
              </Button>
            </div>
          )}
        </div>

        {/* ── AI summary panel for documents ─────────────────────────────────── */}
        {isDocumentLike && (
          <div className="border-t px-5 py-3 bg-background/80 text-sm space-y-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  AI summary
                </span>
              </div>
              {summaryState.loading && (
                <span className="text-xs text-muted-foreground">Analyzing…</span>
              )}
            </div>

            {summaryState.error && (
              <p className="text-xs text-destructive">{summaryState.error}</p>
            )}

            {!summaryState.error && summaryState.summary && (
              <>
                <p className="mb-2 whitespace-pre-line text-sm text-foreground">
                  {summaryState.summary}
                </p>
                {summaryState.keywords && summaryState.keywords.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {summaryState.keywords.slice(0, 10).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {!summaryState.loading && !summaryState.error && !summaryState.summary && (
              <p className="text-xs text-muted-foreground">
                No AI summary available yet for this document.
              </p>
            )}

            {/* ── Q&A with this document ───────────────────────────────────── */}
            <form onSubmit={handleAsk} className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a question about this document…"
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={chatLoading}
                />
                <Button type="submit" size="sm" disabled={chatLoading || !chatQuestion.trim()}>
                  {chatLoading ? 'Asking…' : 'Ask'}
                </Button>
              </div>
              {chatError && (
                <p className="text-xs text-destructive">{chatError}</p>
              )}
              {chatAnswer && !chatError && (
                <p className="mt-1 whitespace-pre-line text-xs text-foreground/90">
                  {chatAnswer}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
