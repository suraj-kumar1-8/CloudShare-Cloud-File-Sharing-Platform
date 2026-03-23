import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef }    from 'react';
import { motion }                         from 'framer-motion';
import { Bell, Sun, Moon, Search, X, CloudLightning } from 'lucide-react';
import { useAuth }                        from '../context/AuthContext';
import { useTheme }                       from '../contexts/ThemeContext';
import { getNotifications, markAllRead }  from '../api/notifications';
import { cn, timeAgo }                    from '../lib/utils';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload',
  '/my-files':  'My Files',
  '/rooms':     'Rooms',
  '/shared':    'Shared Files',
  '/analytics': 'Analytics',
  '/profile':   'Profile',
  '/settings':  'Settings',
};

const NOTIF_ICONS = {
  file_uploaded:     '📁',
  file_shared:       '🔗',
  file_downloaded:   '⬇️',
  room_invite:       '🚪',
  download_complete: '✅',
  file_expiring:     '⏰',
};

export default function Navbar({ variant = 'app' }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (variant === 'marketing') {
    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-xl',
          scrolled
            ? 'bg-slate-950/55 border-white/10 shadow-[0_10px_40px_-26px_rgba(0,0,0,0.9)]'
            : 'bg-slate-950/35 border-white/5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-[0_0_22px_hsl(var(--primary)/0.22)]">
              <CloudLightning size={22} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-white">CloudShare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#top" className="text-white/80 hover:text-white transition-colors duration-300">Product</a>
            <a href="#features" className="text-white/80 hover:text-white transition-colors duration-300">Features</a>
            <Link to="/pricing" className="text-white/80 hover:text-white transition-colors duration-300">Pricing</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-2xl text-white/85 border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_18px_rgba(255,255,255,0.08)]"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.35)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const { pathname }      = useLocation();
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const { theme, toggle } = useTheme();

  const [search, setSearch]     = useState('');
  const [notifs,  setNotifs]    = useState([]);
  const [unread,  setUnread]    = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef                 = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    getNotifications()
      .then(({ data }) => { setNotifs(data.notifications); setUnread(data.unread); })
      .catch(() => {});
  }, []);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead().catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/my-files?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 md:px-6 shrink-0 backdrop-blur-xl',
        'bg-glass shadow-[0_10px_40px_-26px_rgba(0,0,0,0.9)]',
        scrolled ? 'border-white/10' : 'border-white/5'
      )}
    >
      {/* Page title */}
      <h1 className="hidden text-lg font-semibold md:block mr-2 shrink-0 text-shadow-glow">
        {TITLES[pathname] ?? 'CloudShare'}
      </h1>

      {/* Global search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none drop-shadow-glow" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files…"
            className="h-9 w-full rounded-lg border border-primary/30 bg-muted/50 pl-9 pr-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary drop-shadow-glow">
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow"
        >
          {theme === 'dark'
            ? <Sun  size={17} className="text-yellow-400 drop-shadow-glow" />
            : <Moon size={17} className="text-primary/70 drop-shadow-glow" />
          }
        </button>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen(o => !o); if (!bellOpen && unread > 0) handleMarkAllRead(); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow"
          >
            <Bell size={17} className="text-primary/70 drop-shadow-glow" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-primary/30 bg-glass shadow-2xl overflow-hidden backdrop-blur-lg"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-sm font-semibold text-shadow-glow">Notifications</span>
                {notifs.length > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifs.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
                )}
                {notifs.map(n => (
                  <div key={n._id} className={cn('flex items-start gap-3 px-4 py-3 transition-colors', !n.read && 'bg-primary/5')}> 
                    <span className="text-lg shrink-0 mt-0.5 drop-shadow-glow">{NOTIF_ICONS[n.type] ?? '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-shadow-glow">{n.title}</p>
                      {n.message && <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-pulse" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow">
          {user?.avatarUrl
            ? <img src={`http://localhost:5001${user.avatarUrl}`} alt="" className="h-7 w-7 rounded-full object-cover border-2 border-primary shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-glow" />
            : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold border-2 border-primary shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-glow">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )
          }
          <span className="hidden text-sm font-medium md:block max-w-[100px] truncate text-shadow-glow">{user?.name}</span>
        </Link>
      </div>
    </header>
  );
}

