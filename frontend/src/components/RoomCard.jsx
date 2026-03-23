import { Clock, Files, Trash2, ExternalLink } from 'lucide-react';
import { Link }          from 'react-router-dom';
import { cn }            from '../lib/utils';
import { CardContent } from './ui/card';
import { Button }        from './ui/button';
import { Badge }         from './ui/badge';
import { motion }        from 'framer-motion';
import GlassCard         from './GlassCard';

/**
 * RoomCard — displays a single room in the Rooms list.
 * Props:
 *   room      – room object from the API
 *   onDelete  – async (roomId) => void
 */
export default function RoomCard({ room, onDelete }) {
  const now       = new Date();
  const expiry    = new Date(room.expiryTime);
  const isExpired = now > expiry;

  const timeLeft = () => {
    if (isExpired) return 'Expired';
    const diffMs = expiry - now;
    const diffH  = Math.floor(diffMs / 3_600_000);
    const diffM  = Math.floor((diffMs % 3_600_000) / 60_000);
    if (diffH >= 24) return `${Math.floor(diffH / 24)}d left`;
    if (diffH >   0) return `${diffH}h ${diffM}m left`;
    return `${diffM}m left`;
  };

  return (
    <motion.div whileHover={!isExpired ? { y: -4, scale: 1.02 } : {}}>
    <GlassCard
      hover={false}
      className={cn('transition-shadow hover:shadow-lg', isExpired && 'opacity-60 grayscale')}
    >
      <CardContent className="flex items-start gap-4 p-4">
        {/* Room icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
          🗂️
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold leading-tight"
            title={room.roomName}
          >
            {room.roomName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground font-mono">
            ID: {room.roomId}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                'text-xs flex items-center gap-1 border-white/10 bg-white/5 text-white/80',
                isExpired
                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border-primary/25 bg-primary/10 text-primary/90'
              )}
            >
              <Clock size={10} />
              {timeLeft()}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1 border-white/10 bg-white/5 text-white/80">
              <Files size={10} />
              {room.fileCount ?? room.files?.length ?? 0} file(s)
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="icon" title="Open room" disabled={isExpired}>
            <Link to={`/rooms/${room.roomId}`}>
              <ExternalLink size={15} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete room"
            onClick={() => onDelete(room.roomId)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </CardContent>
    </GlassCard>
    </motion.div>
  );
}
