import { useState, useEffect }   from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, Folder, ArrowLeft } from 'lucide-react';
import toast           from 'react-hot-toast';
import * as filesAPI   from '../api/files';
import * as foldersAPI from '../api/folders';
import { formatBytes } from '../lib/utils';
import DropzoneUpload  from '../components/DropzoneUpload';
import { Button }      from '../components/ui/button';
import { Progress }    from '../components/ui/progress';
import {
  Card, CardContent,
} from '../components/ui/card';

// Upload status enum
const STATUS = { IDLE: 'idle', UPLOADING: 'uploading', SUCCESS: 'success', ERROR: 'error' };

export default function UploadFile() {
  const [searchParams]          = useSearchParams();
  const folderId                = searchParams.get('folderId') || null;
  const [folderName, setFolderName] = useState(null);

  const [queue,    setQueue]    = useState([]); // { id, file, progress, status, uploaded, error }

  // Fetch folder name when a folderId is present in the URL
  useEffect(() => {
    if (!folderId) { setFolderName(null); return; }
    foldersAPI.getFolder(folderId)
      .then(({ data }) => setFolderName(data.folder?.name || 'Folder'))
      .catch(() => setFolderName('Folder'));
  }, [folderId]);

  const handleFilesSelected = (files) => {
    if (!files?.length) return;
    const now = Date.now();
    const items = files.map((f, idx) => ({
      id: `${now}-${idx}-${f.name}`,
      file: f,
      progress: 0,
      status: STATUS.IDLE,
      uploaded: null,
      error: '',
    }));
    setQueue((prev) => [...prev, ...items]);
  };

  const uploadItem = async (itemId) => {
    const item = queue.find((q) => q.id === itemId);
    if (!item || item.status === STATUS.UPLOADING) return;

    setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, status: STATUS.UPLOADING, progress: 0, error: '' } : q)));

    try {
      const { data } = await filesAPI.uploadFile(
        item.file,
        (p) => setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, progress: p } : q))),
        folderId,
      );
      setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, status: STATUS.SUCCESS, uploaded: data.file, progress: 100 } : q)));
      toast.success(`"${item.file.name}" uploaded successfully!`);
    } catch (err) {
      const message = err.message || 'Upload failed';
      setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, status: STATUS.ERROR, error: message } : q)));
      toast.error(message);
    }
  };

  const handleUploadAll = async () => {
    for (const item of queue) {
      if (item.status === STATUS.IDLE || item.status === STATUS.ERROR) {
        // eslint-disable-next-line no-await-in-loop
        await uploadItem(item.id);
      }
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload a file</h2>
        <p className="mt-1 text-muted-foreground">
          Drag and drop or browse to upload. Max size: 50 MB.
        </p>
      </div>

      {/* Folder context banner */}
      {folderId && (
        <Card className="border-primary/20 bg-white/5">
          <CardContent className="flex items-center gap-3 p-3 text-white/85">
            <Folder size={18} className="shrink-0 text-primary" />
            <span className="text-sm flex-1">
              Uploading into: <strong>{folderName ?? '…'}</strong>
            </span>
            <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white">
              <Link to={`/folders/${folderId}`}>
                <ArrowLeft size={14} className="mr-1" />
                Back to folder
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Drop zone */}
      <DropzoneUpload
        onFilesSelected={handleFilesSelected}
        disabled={queue.some((q) => q.status === STATUS.UPLOADING)}
      />

      {/* Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {queue.length} file{queue.length !== 1 ? 's' : ''} in queue
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadAll}
                disabled={queue.every((q) => q.status === STATUS.SUCCESS) || queue.some((q) => q.status === STATUS.UPLOADING)}
              >
                Upload all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearQueue}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <Card key={item.id} className="border-white/10 bg-white/5">
                <CardContent className="flex items-center gap-4 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/60">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {item.status === STATUS.IDLE && <span>Waiting to upload</span>}
                      {item.status === STATUS.UPLOADING && <span>Uploading…</span>}
                      {item.status === STATUS.SUCCESS && <span className="text-emerald-500">Uploaded</span>}
                      {item.status === STATUS.ERROR && <span className="text-destructive">{item.error}</span>}
                    </div>
                    {(item.status === STATUS.UPLOADING || item.progress > 0) && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="mt-1 h-1.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.status === STATUS.SUCCESS && item.uploaded && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { navigator.clipboard.writeText(item.uploaded.fileUrl); toast.success('Link copied!'); }}
                      >
                        <CheckCircle2 size={16} />
                      </Button>
                    )}
                    {item.status !== STATUS.SUCCESS && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => uploadItem(item.id)}
                        disabled={item.status === STATUS.UPLOADING}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
