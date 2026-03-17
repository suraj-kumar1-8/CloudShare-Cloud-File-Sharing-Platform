import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams }        from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Files, Upload, LayoutGrid, List } from 'lucide-react';
import toast                            from 'react-hot-toast';
import * as filesAPI                    from '../api/files';
import FileCard                         from '../components/FileCard';
import { Input }                        from '../components/ui/input';
import { Button }                       from '../components/ui/button';
import { Card, CardContent }            from '../components/ui/card';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest first'  },
  { value: 'oldest',   label: 'Oldest first'  },
  { value: 'name_asc', label: 'Name A–Z'      },
  { value: 'size_asc', label: 'Smallest first' },
  { value: 'size_desc',label: 'Largest first'  },
];

export default function MyFiles() {
  const [searchParams]        = useSearchParams();
  const [files,   setFiles]   = useState([]);
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState(() => searchParams.get('q') || '');
  const [sort,    setSort]    = useState('newest');
  const [view,    setView]    = useState('grid'); // 'grid' | 'list'

  // Sync search box when global search navigates here with ?q=
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await filesAPI.getFiles();
      setFiles(data.files);
    } catch (err) {
      toast.error(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  // Remote semantic/AI-powered search on the backend
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await filesAPI.searchFiles(q);
        if (cancelled) return;
        setSearchResults(data.files || []);
      } catch (err) {
        if (cancelled) return;
        toast.error(err.message || 'Search failed');
        setSearchResults([]);
      }
    })();

    return () => { cancelled = true; };
  }, [search]);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // Prefer backend search results when present; otherwise use full list
    let list = searchResults !== null ? [...searchResults] : [...files];

    // Sort
    switch (sort) {
      case 'oldest':    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'name_asc':  list.sort((a, b) => (a.originalName || a.fileName).localeCompare(b.originalName || b.fileName)); break;
      case 'size_asc':  list.sort((a, b) => a.fileSize - b.fileSize); break;
      case 'size_desc': list.sort((a, b) => b.fileSize - a.fileSize); break;
      default:          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest
    }

    return list;
  }, [files, searchResults, sort]);

  const handleDelete = async (id) => {
    await filesAPI.deleteFile(id);
    setFiles((prev) => prev.filter((f) => f._id !== id));
  };

  const handleDownload = async (id) => {
    const { data } = await filesAPI.getDownloadUrl(id);
    return data.url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-shadow-glow">My Files</h2>
          <p className="mt-1 text-muted-foreground">
            {loading ? '…' : `${files.length} file${files.length !== 1 ? 's' : ''} stored`}
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.07, boxShadow: '0 0 12px 2px var(--tw-shadow-color)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Button asChild className="shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/20 animate-glow">
            <Link to="/upload">
              <Upload size={16} className="mr-2 drop-shadow-glow" />
              Upload new
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Search + sort toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <motion.div className="relative flex-1" whileFocus={{ scale: 1.03, boxShadow: '0 0 8px 2px var(--tw-shadow-color)' }}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 drop-shadow-glow" />
          <Input
            placeholder="Search files…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-primary/30 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow"
          />
        </motion.div>
        <div className="flex items-center gap-3">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.04, boxShadow: '0 0 8px 2px var(--tw-shadow-color)' }}>
            <SlidersHorizontal size={16} className="text-primary/70 drop-shadow-glow" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-md border border-primary/20 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </motion.div>
          <motion.div className="inline-flex items-center rounded-md border border-primary/20 bg-background/80 p-0.5 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow" whileHover={{ scale: 1.05 }}>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${view === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${view === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={14} />
              <span className="hidden sm:inline">List</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <motion.div
            className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/20 animate-glow"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && files.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Files size={48} className="text-primary/40 drop-shadow-glow animate-bounce" />
            <p className="text-lg font-medium text-shadow-glow">No files yet</p>
            <p className="text-sm text-muted-foreground">Start by uploading your first file</p>
            <motion.div whileHover={{ scale: 1.07 }}>
              <Button asChild className="mt-2 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/20 animate-glow">
                <Link to="/upload">Upload a file</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* No search results */}
      {!loading && files.length > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="font-medium text-shadow-glow">No files match &quot;{search}&quot;</p>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="animate-glow">Clear search</Button>
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* File grid / list */}
      {!loading && filtered.length > 0 && (
        <motion.div 
          className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {filtered.map((file) => (
            <motion.div
              key={file._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 8px 2px var(--tw-shadow-color)' }}
              whileTap={{ scale: 0.97 }}
              className="animate-glow"
            >
              <FileCard
                file={file}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
