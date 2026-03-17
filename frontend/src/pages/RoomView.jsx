import { useEffect, useState, useCallback } from 'react';
import { useParams, Link }                  from 'react-router-dom';
import { useDropzone }                      from 'react-dropzone';
import { io }                               from 'socket.io-client';
import {
  UploadCloud, Copy, Clock, File, Image, Film, FileText, Music, ArrowLeft,
  Trash2, Eye, Download,
} from 'lucide-react';
import toast                from 'react-hot-toast';
import * as roomsAPI        from '../api/rooms';
import { formatBytes, timeAgo } from '../lib/utils';
import { Button }           from '../components/ui/button';
import { Progress }         from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge }            from '../components/ui/badge';
import { cn }               from '../lib/utils';

function MimeIcon({ mimeType, size = 20 }) {
  if (!mimeType)                    return <File size={size} className="text-blue-500" />;
  if (mimeType.startsWith('image')) return <Image size={size} className="text-purple-500" />;
  if (mimeType.startsWith('video')) return <Film  size={size} className="text-pink-500"  />;
  if (mimeType.startsWith('audio')) return <Music size={size} className="text-yellow-500"/>;
  if (mimeType.includes('pdf'))     return <FileText size={size} className="text-red-500"/>;
  return <File size={size} className="text-blue-500" />;
}

export default function RoomView() {
  const { roomId }           = useParams();
  const [room,    setRoom]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [stats, setStats] = useState(null);

  // Upload queue: [{ id, file, status: 'waiting'|'uploading'|'done'|'error', progress, error }]
  const [queue, setQueue] = useState([]);

  const fetchRoom = async () => {
    try {
      const { data } = await roomsAPI.getRoom(roomId);
      setRoom(data.room);
    } catch (err) {
      if (err.response?.status === 410) setExpired(true);
      else toast.error(err.response?.data?.message || 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoom(); }, [roomId]);

  // Fetch submissions for teacher dashboard (will fail with 401/404 for non-teachers)
  const fetchSubmissions = useCallback(async () => {
    try {
      const { data } = await roomsAPI.getSubmissions(roomId);
      setSubmissions(data.submissions || []);
      setStats(data.stats || null);
    } catch (err) {
      // Non-owner / unauthenticated viewers will hit 401/404 – silently ignore
      setSubmissions([]);
      setStats(null);
    } finally {
      setLoadingSubs(false);
    }
  }, [roomId]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // ── Realtime updates via Socket.io ────────────────────────────────────────
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '/api';
    const url = base.startsWith('http') ? base.replace(/\/api$/, '') : window.location.origin;

    const socket = io(url, { withCredentials: true });
    socket.emit('room:join', roomId);

    socket.on('room:newSubmission', (payload) => {
      if (!payload || !payload.submission) return;
      setSubmissions((prev) => [payload.submission, ...prev]);
      if (payload.stats) {
        setStats(payload.stats);
      }
      toast.success('New file uploaded');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // ── Upload queue logic ─────────────────────────────────────────────────────
  const setItemState = (id, patch) =>
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const uploadItem = async (item) => {
    setItemState(item.id, { status: 'uploading', progress: 0 });
    try {
      await roomsAPI.submitAssignment(
        roomId,
        studentName,
        item.file,
        (pct) => setItemState(item.id, { progress: pct }),
      );
      setItemState(item.id, { status: 'done', progress: 100 });
      toast.success(`${item.file.name} uploaded`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      setItemState(item.id, { status: 'error', error: msg });
      toast.error(msg);
    }
  };

  // Sequentially process the queue (one at a time to stay simple)
  useEffect(() => {
    const waiting = queue.find((i) => i.status === 'waiting');
    const uploading = queue.find((i) => i.status === 'uploading');
    if (waiting && !uploading) uploadItem(waiting);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const enqueueFiles = useCallback((files) => {
    if (!studentName.trim()) {
      toast.error('Please enter your name before uploading.');
      return;
    }
    const fileArray = Array.from(files || []);
    if (!fileArray.length) return;
    const newItems = fileArray.map((file) => ({
      id:       `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status:   'waiting',
      progress: 0,
      error:    null,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, [studentName]);

  const onDrop = useCallback((acceptedFiles) => {
    enqueueFiles(acceptedFiles);
  }, [enqueueFiles]);

  // Deadline / expiry helpers used for both UI and upload disabling.
  const now            = new Date();
  const expiryDt       = room?.expiryTime ? new Date(room.expiryTime) : null;
  const isExpiredByTime = expiryDt ? now > expiryDt : false;
  const isExpired      = expired || isExpiredByTime;
  const deadlineDt  = room?.deadline ? new Date(room.deadline) : null;
  const hasDeadline = !!deadlineDt;
  const deadlinePassed = hasDeadline && now > deadlineDt;
  const deadlineDisabled = hasDeadline && deadlinePassed && !(room && room.allowLateSubmissions);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
    disabled: expired || deadlineDisabled,
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${roomId}`);
    toast.success('Room link copied!');
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="text-5xl">⌛</span>
        <h2 className="text-2xl font-bold">Room Expired</h2>
        <p className="text-muted-foreground">This room and all its files have been automatically deleted.</p>
        <Button asChild variant="outline"><Link to="/rooms">← Back to rooms</Link></Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="text-5xl">❓</span>
        <h2 className="text-2xl font-bold">Room not found</h2>
        <Button asChild variant="outline"><Link to="/rooms">← Back to rooms</Link></Button>
      </div>
    );
  }

  const deadlineLabel = () => {
    if (hasDeadline) {
      if (deadlinePassed) return 'Deadline passed';
      const diffMs = deadlineDt - now;
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      return `Deadline in ${h}h ${m}m`;
    }
    if (isExpired) return 'Expired';
    if (!expiryDt) return '';
    const diffMs = expiryDt - now;
    const h = Math.floor(diffMs / 3_600_000);
    const m = Math.floor((diffMs % 3_600_000) / 60_000);
    return `${h}h ${m}m left`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link to="/rooms"><ArrowLeft size={14} className="mr-1" /> All rooms</Link>
      </Button>

      {/* Room header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{room.roomName}</h1>
          <p className="text-sm text-muted-foreground">
            Room ID:{' '}
            <span className="font-mono text-xs align-middle">{room.roomId}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 rounded-full border-gray-700 bg-background/60 px-3 py-1 text-xs',
              (isExpired || deadlinePassed) ? 'text-red-400' : 'text-indigo-300',
            )}
          >
            <Clock size={12} />
            {deadlineLabel()}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-gray-700 bg-background/60 px-3 text-xs font-medium"
            onClick={copyLink}
          >
            <Copy size={13} className="mr-1.5" />
            Copy link
          </Button>
        </div>
      </div>

      {/* Room overview */}
      <Card className="border border-gray-800 bg-card/60 shadow-md">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold tracking-wide">Room overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activity</p>
              <p className="text-sm">
                <span className="font-semibold">{room.files?.length ?? 0}</span> file(s) in room
              </p>
              <p className="text-sm">
                <span className="font-semibold">{submissions.length}</span> submission(s) received
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">How to upload</p>
              <ol className="list-decimal space-y-0.5 pl-4 text-xs text-muted-foreground">
                <li>Enter your name.</li>
                <li>Upload your file.</li>
                <li>Wait for upload to finish.</li>
              </ol>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner instructions</p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                <li>Share the room link.</li>
                <li>View submissions below.</li>
                <li>Download or delete submissions.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sender name + upload area */}
      {!isExpired && (
        <Card className="border border-gray-800 bg-card/60 shadow-md max-w-3xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide">Send files to this room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs font-medium text-muted-foreground sm:w-40" htmlFor="student-name">
                Your name
              </label>
              <input
                id="student-name"
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                placeholder="e.g. Alex Johnson"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'flex min-h-[200px] max-w-xl mx-auto cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-background/40 text-center transition-colors',
                isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/70 hover:bg-accent/20',
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud size={48} className={cn('mb-3', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
              <p className="text-sm font-medium">Drag &amp; drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse (max 50 MB per file)</p>
            </div>

            {/* Extra import options: folder (desktop) and ZIP (any device) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div>
                <p>Need to send a whole folder?</p>
                <p className="text-[11px] opacity-80">On desktop you can pick a folder directly; on phone, zip it first.</p>
              </div>
              <div className="flex gap-2">
                <>
                  <input
                    id="room-folder-input"
                    type="file"
                    multiple
                    webkitdirectory=""
                    directory=""
                    className="hidden"
                    onChange={(e) => {
                      enqueueFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="room-folder-input"
                    className="cursor-pointer rounded-full border border-gray-700 bg-background/60 px-3 py-1 text-[11px] font-medium hover:border-primary/70 hover:text-primary"
                  >
                    Import folder
                  </label>
                </>
                <>
                  <input
                    id="room-zip-input"
                    type="file"
                    multiple
                    accept=".zip,application/zip,application/x-zip-compressed"
                    className="hidden"
                    onChange={(e) => {
                      enqueueFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="room-zip-input"
                    className="cursor-pointer rounded-full border border-gray-700 bg-background/60 px-3 py-1 text-[11px] font-medium hover:border-primary/70 hover:text-primary"
                  >
                    Upload ZIP
                  </label>
                </>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload queue */}
      {queue.length > 0 && (
        <Card className="border border-gray-800 bg-card/60 shadow-md">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Upload queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {queue.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-xs font-medium">{item.file.name}</span>
                  <span className={cn(
                    'ml-2 shrink-0 text-xs font-medium',
                    item.status === 'done'     && 'text-green-500',
                    item.status === 'error'    && 'text-destructive',
                    item.status === 'uploading'&& 'text-primary',
                    item.status === 'waiting'  && 'text-muted-foreground',
                  )}>
                    {item.status === 'done'      && '✓ Done'}
                    {item.status === 'error'     && `✗ ${item.error}`}
                    {item.status === 'uploading' && `${item.progress}%`}
                    {item.status === 'waiting'   && 'Waiting…'}
                  </span>
                </div>
                {(item.status === 'uploading' || item.status === 'done') && (
                  <Progress value={item.progress} className="h-1.5" />
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setQueue((prev) => prev.filter((i) => i.status !== 'done'))}
            >
              Clear completed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Files in room */}
      <Card className="border border-gray-800 bg-card/60 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Files in this room ({room.files?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {(!room.files || room.files.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No files yet. {!isExpired && 'Upload some above!'}
            </p>
          )}

          <div className="mt-2 space-y-2">
            {room.files?.map((f, idx) => (
              <Card key={f.fileId ?? idx} className="overflow-hidden border border-gray-800 bg-background/60">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/60">
                    <MimeIcon mimeType={f.fileType} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                            <span className="font-medium">{f.uploadedBy?.name || 'Unknown user'}</span>
                            {' · '}
                            {formatBytes(f.fileSize)}
                            {' · '}
                            {timeAgo(f.uploadedAt)}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <a href={f.fileUrl} target="_blank" rel="noreferrer">Download</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submissions analytics + table */}
      {!loadingSubs && (
        <Card className="border border-gray-800 bg-card/60 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Submissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats && (
              <div className="grid gap-4 border-b border-border/80 bg-muted/5 px-4 py-3 text-xs sm:grid-cols-3 sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Total submissions</p>
                  <p className="font-semibold">{stats.totalSubmissions ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unique students</p>
                  <p className="font-semibold">{stats.uniqueStudents ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latest upload</p>
                  <p className="font-semibold">
                    {stats.latestSubmission ? timeAgo(stats.latestSubmission) : '—'}
                  </p>
                </div>
              </div>
            )}

            {submissions.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No submissions yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-b-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">File</th>
                      <th className="px-3 py-2">Submitted</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => {
                      const submittedAt = new Date(s.uploadedAt);
                      const isLate = hasDeadline && submittedAt > deadlineDt;
                      return (
                        <tr key={s._id} className="border-t border-border/80">
                          <td className="px-3 py-2 align-middle">
                            <span className="font-medium">{s.studentName}</span>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <span className="inline-block max-w-[220px] truncate text-xs sm:text-sm align-middle">
                              {s.fileName}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-middle text-xs text-muted-foreground">
                            {timeAgo(s.uploadedAt)}
                          </td>
                          <td className="px-3 py-2 align-middle text-xs">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5',
                                isLate ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400',
                              )}
                            >
                              {isLate ? 'Late' : 'On time'}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <div className="flex justify-end gap-1">
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Preview"
                              >
                                <a href={s.fileUrl} target="_blank" rel="noreferrer">
                                  <Eye size={16} />
                                </a>
                              </Button>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Download"
                              >
                                <a href={s.fileUrl} target="_blank" rel="noreferrer" download>
                                  <Download size={16} />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Delete submission"
                                onClick={async () => {
                                  if (!window.confirm('Delete this submission?')) return;
                                  try {
                                    await roomsAPI.deleteSubmission(roomId, s._id);
                                    setSubmissions((prev) => prev.filter((x) => x._id !== s._id));
                                    setStats((prev) => (prev ? {
                                      ...prev,
                                      totalSubmissions: Math.max(0, (prev.totalSubmissions || 1) - 1),
                                    } : prev));
                                    toast.success('Submission deleted');
                                  } catch (err) {
                                    toast.error(err.response?.data?.message || 'Failed to delete submission');
                                  }
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
