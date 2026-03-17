import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Files, Upload, Users, Share2,
  BarChart2, Settings, UserCircle,
  ChevronLeft, ChevronRight, CloudLightning, LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/my-files',  label: 'My Files',   icon: Files           },
  { href: '/upload',    label: 'Upload',      icon: Upload          },
  { href: '/rooms',     label: 'Rooms',       icon: Users           },
  { href: '/shared',    label: 'Shared',      icon: Share2          },
  { href: '/analytics', label: 'Analytics',   icon: BarChart2       },
  { href: '/profile',   label: 'Profile',     icon: UserCircle      },
  { href: '/settings',  label: 'Settings',    icon: Settings        },
];

/**
 * Collapsible sidebar.
 * Props:
 *   collapsed  – boolean
 *   onCollapse – () => void
 */
export default function Sidebar({ collapsed, onCollapse }) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      className="glass border-r border-border/50 shadow-2xl flex flex-col h-full overflow-hidden shrink-0 z-20 relative"
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* ── Brand ──────────────────────────────────────────── */}
      <div className="flex bg-card/10 items-center gap-3 px-3 h-16 border-b border-border/50 shrink-0">
        <motion.div 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 shadow-md shadow-primary/20"
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          <CloudLightning size={20} className="text-white drop-shadow-sm" />
        </motion.div>
        <AnimatePresence>
        {!collapsed && (
          <motion.span 
            className="font-bold text-lg tracking-tight truncate bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
          >
            CloudShare
          </motion.span>
        )}
        </AnimatePresence>
      </div>

      {/* ── Nav items ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out border border-transparent',
                'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100',
                'hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-[0_0_12px_rgba(129,140,248,0.45)]',
                isActive && 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-[0_0_16px_rgba(129,140,248,0.7)] border-indigo-400',
                collapsed && 'justify-center px-2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={cn(
                    'shrink-0 transition-transform duration-200',
                    isActive
                      ? 'text-indigo-400 dark:text-indigo-500'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 group-hover:scale-110'
                  )}
                />
                {!collapsed && (
                  <span className="truncate">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User strip ─────────────────────────────────────── */}
      {!collapsed && user && (
          <div className="border-t border-border px-3 py-3 shrink-0 space-y-2">
            <div className="flex items-center gap-2.5 min-w-0 px-1">
              {user.avatarUrl
                ? <img src={`http://localhost:5001${user.avatarUrl}`} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 border-2 border-primary shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-glow" />
                : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold border-2 border-primary shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/40 animate-glow">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )
              }
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-shadow-glow">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.07, boxShadow: '0 0 12px 2px var(--tw-shadow-color)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/20 animate-glow"
            >
              <LogOut size={14} />
              Sign out
            </motion.button>
          </div>
      )}

      {/* Collapsed sign-out */}
      {collapsed && (
        <button
          onClick={logout}
          title="Sign out"
          className="flex items-center justify-center h-10 border-t border-border hover:bg-accent transition-colors"
        >
          <LogOut size={15} className="text-muted-foreground" />
        </button>
      )}

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <button
        onClick={onCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex items-center justify-center h-10 border-t border-border hover:bg-accent transition-colors shrink-0"
      >
        {collapsed
          ? <ChevronRight size={16} className="text-muted-foreground" />
          : <ChevronLeft  size={16} className="text-muted-foreground" />
        }
      </button>
    </motion.aside>
  );
}
