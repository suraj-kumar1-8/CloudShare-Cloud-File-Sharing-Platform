import { useEffect, useState } from 'react';
import { PlusCircle, Inbox }  from 'lucide-react';
import toast                  from 'react-hot-toast';
import * as roomsAPI          from '../api/rooms';
import { Button }             from '../components/ui/button';
import { CardContent }        from '../components/ui/card';
import { Input }              from '../components/ui/input';
import { Label }              from '../components/ui/label';
import RoomCard               from '../components/RoomCard';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard              from '../components/GlassCard';
import GradientButton         from '../components/GradientButton';

const EXPIRY_OPTIONS = [
  { label: '1 hour',   value: '1h'  },
  { label: '24 hours', value: '24h' },
  { label: '7 days',   value: '7d'  },
  { label: '30 days',  value: '30d' },
];

export default function Rooms() {
  const [rooms,      setRooms]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName,   setRoomName]   = useState('');
  const [expiresIn,  setExpiresIn]  = useState('24h');
  const [creating,   setCreating]   = useState(false);

  const fetchRooms = async () => {
    try {
      const { data } = await roomsAPI.listRooms();
      setRooms(data.rooms);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async () => {
    if (!roomName.trim()) { toast.error('Room name is required'); return; }
    setCreating(true);
    try {
      const { data } = await roomsAPI.createRoom(roomName.trim(), expiresIn);
      setRooms((prev) => [{ ...data.room, fileCount: 0 }, ...prev]);
      setRoomName('');
      setShowCreate(false);
      toast.success('Room created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Delete this room and all its files?')) return;
    try {
      await roomsAPI.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      toast.success('Room deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sharing Rooms</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create temporary rooms to share files with others. Rooms auto-delete on expiry.
          </p>
        </div>
        <GradientButton onClick={() => setShowCreate(!showCreate)}>
          <PlusCircle size={16} className="mr-2" />
          New Room
        </GradientButton>
      </div>

      {/* Create form */}
      <AnimatePresence>
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          className="overflow-hidden"
        >
        <GlassCard hover={false} className="mb-4">
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold">Create a new room</h3>

            <div className="space-y-1.5">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                placeholder="e.g. Project Assets Q1 2026"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Room expires in</Label>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExpiresIn(value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      expiresIn === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <GradientButton onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating…' : 'Create Room'}
              </GradientButton>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </GlassCard>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Room list */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <GlassCard hover={false}>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Inbox size={48} className="text-muted-foreground/30" />
            <p className="font-medium">No rooms yet</p>
            <p className="text-sm text-muted-foreground">
              Create a room to share a collection of files with a single link.
            </p>
            <GradientButton onClick={() => setShowCreate(true)}>
              <PlusCircle size={15} className="mr-2" />
              Create your first room
            </GradientButton>
          </CardContent>
        </GlassCard>
      )}

      {!loading && rooms.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {rooms.map((room) => (
            <motion.div
              key={room.roomId}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <RoomCard room={room} onDelete={handleDelete} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
