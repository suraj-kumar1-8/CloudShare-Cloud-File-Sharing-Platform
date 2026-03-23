import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate }               from 'react-router-dom';
import { motion, AnimatePresence }          from 'framer-motion';
import Tilt                                from 'react-parallax-tilt';
import {
  Files, Upload, HardDrive, Clock, FolderPlus, Folder,
  TrendingUp, Share2, BarChart2, ArrowRight, Plus, Users,
  Activity, File as FileIco, Boxes,
} from 'lucide-react';
import toast                               from 'react-hot-toast';
import { getDashboard }                    from '../api/dashboard';
import * as filesAPI                       from '../api/files';
import * as foldersAPI                     from '../api/folders';
import { formatBytes, timeAgo }            from '../lib/utils';
import { Button }                          from '../components/ui/button';
import { Badge }                           from '../components/ui/badge';
import FileCard                            from '../components/FileCard';
import FolderCard                          from '../components/FolderCard';
import CreateFolderModal                   from '../components/CreateFolderModal';
import StorageBar                          from '../components/StorageBar';
import Hero3D                              from '../components/Hero3D';
import { useAuth }                         from '../context/AuthContext';
import GlassCard                            from '../components/GlassCard';

// ── Activity Feed Item ────────────────────────────────────────────────────────
function ActivityItem({ item }) {
  const isFolder = item._type === 'folder';
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      onClick={isFolder ? () => navigate(`/folders/${item._id}`) : undefined}
      className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5 ${isFolder ? 'cursor-pointer' : ''}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isFolder ? 'bg-amber-500/15' : 'bg-indigo-500/15'}`}>
        {isFolder ? <Folder size={18} className="text-amber-400" /> : <FileIco size={18} className="text-indigo-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{isFolder ? item.name : (item.originalName || item.fileName)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{isFolder ? 'Folder created' : formatBytes(item.fileSize)} · {timeAgo(item.createdAt)}</p>
      </div>
      <Badge variant="outline" className={`shrink-0 text-xs ${isFolder ? 'border-amber-400/30 text-amber-400' : 'border-indigo-400/30 text-indigo-400'}`}>
        {isFolder ? 'Folder' : 'File'}
      </Badge>
    </motion.div>
  );
}

// ── Room Preview Card ─────────────────────────────────────────────────────────
function RoomPreviewCard({ room }) {
  const now = new Date();
  const expiryDt = new Date(room.expiryTime);
  const isExpired = now > expiryDt;
  const timeLeft = () => {
    if (isExpired) return 'Expired';
    const diffMs = expiryDt - now;
    const h = Math.floor(diffMs / 3_600_000);
    if (h >= 24) return `${Math.floor(h / 24)}d left`;
    if (h > 0) return `${h}h left`;
    return `${Math.floor((diffMs % 3_600_000) / 60_000)}m left`;
  };
  return (
    <Link to={`/rooms/${room.roomId}`} className={`block rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:bg-white/8 hover:border-white/15 ${isExpired ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-lg">🗂️</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{room.roomName}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={isExpired ? 'text-red-400' : 'text-emerald-400'}><Clock size={10} className="mr-0.5 inline" />{timeLeft()}</span>
            <span>·</span>
            <span>{room.fileCount ?? 0} file{room.fileCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user }                   = useAuth();
  const navigate                   = useNavigate();
  const [data,    setData]         = useState(null);
  const [loading, setLoading]      = useState(true);
  const [modalOpen, setModalOpen]  = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await getDashboard();
      setData(res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    await filesAPI.deleteFile(id);
    setData((prev) => prev ? ({
      ...prev,
      recentFiles: prev.recentFiles.filter((f) => f._id !== id),
      stats: { ...prev.stats, totalFiles: Math.max(0, prev.stats.totalFiles - 1) },
    }) : prev);
  };

  const handleDownload = async (id) => {
    const { data: res } = await filesAPI.getDownloadUrl(id);
    return res.url;
  };

  const handleCreateFolder = async (name) => {
    const { data: res } = await foldersAPI.createFolder({ name, parentFolder: null });
    setData((prev) => prev ? ({
      ...prev,
      recentFolders: [{ ...res.folder, childCount: 0, fileCount: 0 }, ...prev.recentFolders].slice(0, 5),
      stats: { ...prev.stats, totalFolders: (prev.stats.totalFolders ?? 0) + 1 },
    }) : prev);
    toast.success('Folder created!');
  };

  const handleDeleteFolder = async (folderId) => {
    await foldersAPI.deleteFolder(folderId);
    setData((prev) => prev ? ({
      ...prev,
      recentFolders: prev.recentFolders.filter((f) => f._id !== folderId),
      stats: { ...prev.stats, totalFolders: Math.max(0, prev.stats.totalFolders - 1) },
    }) : prev);
  };

  const handleRenameFolder = async (folderId, newName) => {
    const { data: res } = await foldersAPI.renameFolder(folderId, newName);
    setData((prev) => prev ? ({
      ...prev,
      recentFolders: prev.recentFolders.map((f) => f._id === folderId ? { ...f, name: res.folder.name } : f),
    }) : prev);
  };

  const stats         = data?.stats         ?? {};
  const recentFiles   = data?.recentFiles   ?? [];
  const recentFolders = data?.recentFolders ?? [];
  const recentRooms   = data?.recentRooms   ?? [];

  // Unified activity feed: files + folders sorted newest first
  const activityFeed = [
    ...recentFiles.map((f)   => ({ ...f, _type: 'file'   })),
    ...recentFolders.map((f) => ({ ...f, _type: 'folder' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const STAT_CARDS = [
    { key: 'files',   label: 'Total Files',  icon: Files,     grad: 'from-violet-500 to-indigo-500', bg: 'bg-violet-500/10', value: stats.totalFiles   ?? 0 },
    { key: 'folders', label: 'Folders',       icon: Folder,    grad: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10',  value: stats.totalFolders ?? 0 },
    { key: 'rooms',   label: 'Rooms',         icon: Boxes,     grad: 'from-violet-500 to-pink-500',   bg: 'bg-violet-500/10', value: stats.totalRooms   ?? 0 },
    { key: 'storage', label: 'Storage Used',  icon: HardDrive, grad: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-500/10',value: stats.storageUsedHuman ?? '0 B' },
  ];

  const statValues = {
    files:   stats.totalFiles        ?? 0,
    folders: stats.totalFolders      ?? 0,
    rooms:   stats.totalRooms        ?? 0,
    storage: stats.storageUsedHuman  ?? '0 B',
  };

  const handleFolderImport = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const paths    = files.map((f) => f.webkitRelativePath || f.name);
    const rootName = (paths[0] || '').split('/')[0] || 'Imported folder';

    try {
      await toast.promise(
        filesAPI.importFolder(files, paths, rootName),
        {
          loading: 'Importing folder…',
          success: 'Folder imported successfully',
          error:   'Failed to import folder',
        },
      );
      fetchData();
    } catch (err) {
      // toast.promise already showed an error; nothing else to do
    }
  };

  const openFolderPicker = () => {
    const input = document.getElementById('dashboard-folder-import');
    if (input) input.click();
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* ── 3D Hero Section ───────────────────────────────────────────── */}
      <Hero3D />
      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-white shadow-[0_18px_60px_-40px_rgba(0,0,0,0.85)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 via-purple-500/20 to-sky-500/20" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 right-20 h-36 w-36 rounded-full bg-white/10 blur-xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">Welcome back</p>
            <h2 className="text-3xl font-bold">{user?.name?.split(' ')[0]} 👋</h2>
            <p className="mt-1 text-sm text-white/80">Here's what's happening with your files today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
              <Link to="/upload"><Upload size={14} className="mr-1.5" />Upload</Link>
            </Button>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 border backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
              onClick={() => setModalOpen(true)}
            >
              <FolderPlus size={14} className="mr-1.5" />Create folder
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick actions / Import ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Button asChild variant="outline" className="h-20 justify-start gap-3">
          <Link to="/upload">
            <Upload size={18} />
            <div className="text-left">
              <p className="text-sm font-semibold">Upload file</p>
              <p className="text-xs text-muted-foreground">Send a new file to the cloud</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 justify-start gap-3">
          <Link to="/upload">
            <FileIco size={18} />
            <div className="text-left">
              <p className="text-sm font-semibold">Import from device</p>
              <p className="text-xs text-muted-foreground">Drag &amp; drop or browse files</p>
            </div>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-20 justify-start gap-3"
          onClick={() => setModalOpen(true)}
        >
          <FolderPlus size={18} />
          <div className="text-left">
            <p className="text-sm font-semibold">Create folder</p>
            <p className="text-xs text-muted-foreground">Organise files into folders</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-20 justify-start gap-3"
          type="button"
          onClick={openFolderPicker}
        >
          <Folder size={18} />
          <div className="text-left">
            <p className="text-sm font-semibold">Import folder</p>
            <p className="text-xs text-muted-foreground">Upload an entire folder</p>
          </div>
        </Button>
      </div>

      {/* Hidden input for folder import (desktop browsers) */}
      <input
        id="dashboard-folder-import"
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFolderImport}
      />

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, grad, bg }, i) => (
          <Tilt
            key={key}
            glareEnable={true}
            glareMaxOpacity={0.35}
            scale={1.03}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.04 }}
              className="w-full"
            >
              <GlassCard className={`rounded-2xl p-5 ${bg}`}>
              <motion.div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grad} animate-pulse-glow`}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Icon size={20} className="text-white drop-shadow-md" />
              </motion.div>
              <TrendingUp size={14} className="text-muted-foreground/40 mt-1" />
              <p className="mt-4 text-2xl font-bold">
                {loading ? (
                  <motion.span
                    className="skeleton inline-block h-7 w-20 rounded bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                ) : statValues[key]}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
              </GlassCard>
            </motion.div>
          </Tilt>
        ))}
      </div>

      {/* ── Storage bar ────────────────────────────────────────────────── */}
      <GlassCard className="rounded-2xl p-5" hover={false}>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-sm flex items-center gap-1.5">
            <HardDrive size={15} className="text-primary" /> Storage Overview
          </span>
          <Link to="/settings" className="text-xs text-primary hover:underline">Manage</Link>
        </div>
        <StorageBar />
      </GlassCard>

      {/* ── Folders ────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent folders</h3>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            <FolderPlus size={14} className="mr-1.5" />New folder
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="skeleton h-20 rounded-2xl bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            ))}
          </div>
        )}

        {!loading && recentFolders.length === 0 && (
          <GlassCard className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 text-center" hover={false}>
            <Folder size={36} className="text-muted-foreground/40" />
            <p className="text-sm font-medium">No folders yet</p>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              Create your first folder
            </Button>
          </GlassCard>
        )}

        {!loading && recentFolders.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentFolders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onDelete={handleDeleteFolder}
                onRename={handleRenameFolder}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent files ───────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent files</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-files" className="flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="skeleton h-32 rounded-2xl bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            ))}
          </div>
        )}

        {!loading && recentFiles.length === 0 && (
          <GlassCard className="rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center" hover={false}>
            <Files size={48} className="text-muted-foreground/40" />
            <p className="font-medium">No files uploaded yet</p>
            <p className="text-sm text-muted-foreground">Upload your first file to get started</p>
            <Button asChild className="mt-2">
              <Link to="/upload">Upload a file</Link>
            </Button>
          </GlassCard>
        )}

        {!loading && recentFiles.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recentFiles.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent activity + My rooms ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activity: mixed files & folders */}
        <GlassCard className="rounded-2xl p-5" hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Activity size={16} />
              Recent activity
            </h3>
          </div>
          {activityFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no recent files or folders yet.
            </p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {activityFeed.map((item) => (
                  <ActivityItem key={`${item._type}-${item._id}`} item={item} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>

        {/* My rooms */}
        <GlassCard className="rounded-2xl p-5" hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Users size={16} />
              My rooms
            </h3>
            <Button asChild variant="outline" size="sm">
              <Link to="/rooms" className="flex items-center gap-1 text-xs">
                Manage rooms
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
          {recentRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't created any rooms yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentRooms.map((room) => (
                <RoomPreviewCard key={room._id} room={room} />
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Quick CTA */}
      {!loading && recentFiles.length > 0 && (
        <GlassCard className="rounded-2xl overflow-hidden" hover={false}>
          <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Share2 size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Share your files</p>
                <p className="text-sm text-muted-foreground">View and manage your shared links</p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/shared">View shared <ArrowRight size={13} className="ml-1" /></Link>
            </Button>
          </div>
        </GlassCard>
      )}

      <CreateFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleCreateFolder}
      />
    </motion.div>
  );
}

