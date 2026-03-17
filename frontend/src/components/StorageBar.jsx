import { useEffect, useState } from 'react';
import { HardDrive }           from 'lucide-react';
import { getStorage }          from '../api/user';
import { formatBytes }         from '../lib/utils';
import { cn }                  from '../lib/utils';

/**
 * StorageBar — displays the user's current disk-usage as a progress bar.
 * Fetches /api/user/storage on mount. Shows a loading skeleton while waiting.
 */
export default function StorageBar({ className }) {
  const [info,    setInfo]    = useState(null);   // { storageUsed, storageLimit, percentage }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStorage()
      .then(({ data }) => setInfo(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn('rounded-xl border bg-card p-5', className)}>
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!info) return null;

  const { storageUsed, storageLimit, percentage } = info;

  // colour the bar based on how full it is
  const barColor =
    percentage >= 90 ? 'bg-red-500'
    : percentage >= 70 ? 'bg-yellow-500'
    : 'bg-blue-500';

  return (
    <div className={cn('rounded-xl border bg-card p-5 shadow-sm', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <HardDrive size={16} className="text-muted-foreground" />
          Storage Used
        </div>
        <span className="text-xs text-muted-foreground">
          {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
        </span>
      </div>

      {/* Progress track */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {percentage}% used &mdash; {formatBytes(storageLimit - storageUsed)} free
      </p>
    </div>
  );
}
