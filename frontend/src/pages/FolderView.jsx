import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate }     from 'react-router-dom';
import { FolderPlus, Upload, Loader2 }      from 'lucide-react';
import toast              from 'react-hot-toast';
import * as foldersAPI    from '../api/folders';
import * as filesAPI      from '../api/files';
import FolderCard         from '../components/FolderCard';
import FileCard           from '../components/FileCard';
import FolderBreadcrumb   from '../components/FolderBreadcrumb';
import CreateFolderModal  from '../components/CreateFolderModal';
import { Button }         from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function FolderView() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [data,    setData]    = useState(null);   // { folder, breadcrumb, children, files }
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFolder = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await foldersAPI.getFolder(id);
      setData(res);
    } catch (err) {
      toast.error(err.message || 'Failed to load folder');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchFolder(); }, [fetchFolder]);

  // ── Create sub-folder ──────────────────────────────────────────────────────
  const handleCreateFolder = async (name) => {
    const { data: res } = await foldersAPI.createFolder({ name, parentFolder: id });
    // Append the new folder (counts will be 0) and sort alphabetically
    setData((prev) => ({
      ...prev,
      children: [...prev.children, { ...res.folder, childCount: 0, fileCount: 0 }]
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
    toast.success('Folder created!');
  };

  // ── Delete sub-folder ──────────────────────────────────────────────────────
  const handleDeleteFolder = async (folderId) => {
    await foldersAPI.deleteFolder(folderId);
    setData((prev) => ({
      ...prev,
      children: prev.children.filter((f) => f._id !== folderId),
    }));
  };

  // ── Rename sub-folder ──────────────────────────────────────────────────────
  const handleRenameFolder = async (folderId, newName) => {
    const { data: res } = await foldersAPI.renameFolder(folderId, newName);
    setData((prev) => ({
      ...prev,
      children: prev.children
        .map((f) => f._id === folderId ? { ...f, name: res.folder.name } : f)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  };

  // ── Delete file inside this folder ────────────────────────────────────────
  const handleDeleteFile = async (fileId) => {
    await filesAPI.deleteFile(fileId);
    setData((prev) => ({ ...prev, files: prev.files.filter((f) => f._id !== fileId) }));
  };

  const handleDownload = async (fileId) => {
    const { data: res } = await filesAPI.getDownloadUrl(fileId);
    return res.url;
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { folder, breadcrumb, children, files } = data;
  const isEmpty = children.length === 0 && files.length === 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <FolderBreadcrumb crumbs={breadcrumb} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold truncate">{folder.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            <FolderPlus size={15} className="mr-1.5" />
            New folder
          </Button>
          {/* Upload into THIS folder */}
          <Button size="sm" asChild>
            <Link to={`/upload?folderId=${folder._id}`}>
              <Upload size={15} className="mr-1.5" />
              Upload here
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="text-5xl">📂</div>
            <p className="font-medium text-lg">This folder is empty</p>
            <p className="text-sm text-muted-foreground">
              Create a sub-folder or upload files here.
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                New folder
              </Button>
              <Button asChild>
                <Link to={`/upload?folderId=${folder._id}`}>Upload file</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-folders */}
      {children.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Folders ({children.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {children.map((f) => (
              <FolderCard
                key={f._id}
                folder={f}
                onDelete={handleDeleteFolder}
                onRename={handleRenameFolder}
              />
            ))}
          </div>
        </section>
      )}

      {/* Files inside this folder */}
      {files.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Files ({files.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                onDelete={handleDeleteFile}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </section>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleCreateFolder}
        parentName={folder.name}
      />
    </div>
  );
}
