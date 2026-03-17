import { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Trash2, Pencil, FolderOpen, Files } from 'lucide-react';
import toast           from 'react-hot-toast';
import { cn }          from '../lib/utils';
import { Button }      from './ui/button';
import { Card, CardContent } from './ui/card';

/**
 * FolderCard – displays a folder with child/file counts.
 * Props:
 *   folder     – folder object from the API
 *   onDelete   – async callback(id)
 *   onRename   – async callback(id, newName)
 */
export default function FolderCard({ folder, onDelete, onRename }) {
  const navigate          = useNavigate();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => navigate(`/folders/${folder._id}`);

  const handleDelete = async (e) => {
    e.stopPropagation();
    const msg = folder.childCount || folder.fileCount
      ? `Delete "${folder.name}" and all its contents?`
      : `Delete folder "${folder.name}"?`;
    if (!window.confirm(msg)) return;
    setLoading(true);
    try {
      await onDelete(folder._id);
      toast.success('Folder deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete folder');
      setLoading(false);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newName.trim() || newName.trim() === folder.name) {
      setEditing(false);
      return;
    }
    try {
      await onRename(folder._id, newName.trim());
      toast.success('Folder renamed');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to rename');
    }
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-shadow hover:shadow-md select-none',
        loading && 'opacity-50 pointer-events-none'
      )}
      onClick={handleOpen}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {/* Folder icon */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50">
          <Folder size={22} className="text-yellow-500" />
        </div>

        {/* Name + counts */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={handleRenameSubmit}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => setEditing(false)}
                className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </form>
          ) : (
            <p className="truncate font-medium leading-tight">{folder.name}</p>
          )}
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            {folder.childCount > 0 && (
              <span className="flex items-center gap-1">
                <FolderOpen size={11} />
                {folder.childCount} folder{folder.childCount !== 1 ? 's' : ''}
              </span>
            )}
            {folder.fileCount > 0 && (
              <span className="flex items-center gap-1">
                <Files size={11} />
                {folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}
              </span>
            )}
            {!folder.childCount && !folder.fileCount && (
              <span>Empty</span>
            )}
          </div>
        </div>

        {/* Actions – show on hover */}
        <div
          className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            title="Rename"
            onClick={(e) => { e.stopPropagation(); setEditing(true); setNewName(folder.name); }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
