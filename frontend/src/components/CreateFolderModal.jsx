import { useState, useEffect, useRef } from 'react';
import { FolderPlus, X }              from 'lucide-react';
import { Button }  from './ui/button';
import { Input }   from './ui/input';
import { Label }   from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * CreateFolderModal
 * A lightweight modal overlay (no Radix dependency required).
 * Props:
 *   isOpen        – boolean
 *   onClose       – () => void
 *   onConfirm     – async (name: string) => void
 *   parentName    – optional string shown as context ("inside X")
 */
export default function CreateFolderModal({ isOpen, onClose, onConfirm, parentName }) {
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef              = useRef(null);

  // Focus the input every time the modal opens, and reset state
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Folder name cannot be empty'); return; }
    if (trimmed.length > 100) { setError('Name must be at most 100 characters'); return; }

    setError('');
    setLoading(true);
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create folder');
      setLoading(false);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()} // prevent overlay click from closing when clicking card
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus size={18} className="text-primary" />
            <CardTitle className="text-base">New Folder</CardTitle>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X size={16} />
          </button>
        </CardHeader>

        <CardContent>
          {parentName && (
            <p className="mb-3 text-xs text-muted-foreground">
              Inside: <span className="font-medium text-foreground">{parentName}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                ref={inputRef}
                placeholder="e.g. Documents"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                maxLength={100}
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Creating…' : 'Create folder'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
