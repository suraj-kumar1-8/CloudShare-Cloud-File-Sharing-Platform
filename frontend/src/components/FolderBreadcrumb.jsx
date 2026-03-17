import { Link }  from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { cn }    from '../lib/utils';

/**
 * FolderBreadcrumb
 * Renders a clickable navigation trail: Home > Folder A > Folder B
 * Props:
 *   crumbs – array of { _id, name } built by the backend, NOT including "Home"
 */
export default function FolderBreadcrumb({ crumbs = [] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Breadcrumb">
      {/* Home / root */}
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={crumb._id} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-muted-foreground/60" />
            {isLast ? (
              // Current folder – not a link
              <span className="font-medium text-foreground">{crumb.name}</span>
            ) : (
              <Link
                to={`/folders/${crumb._id}`}
                className={cn(
                  'text-muted-foreground transition-colors hover:text-foreground'
                )}
              >
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
