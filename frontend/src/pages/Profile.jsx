import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera, Shield, Files, HardDrive, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword, uploadAvatar } from '../api/profile';
import { formatBytes, timeAgo } from '../lib/utils';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user: authUser, setUser } = useAuth();
  const fileRef = useRef(null);

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving,  setSaving]        = useState(false);
  const [pwSaving, setPwSaving]     = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.user.name, email: data.user.email });
      })
      .catch((err) => toast.error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      setProfile((prev) => ({ ...prev, user: { ...prev.user, ...data.user } }));
      if (setUser) setUser((prev) => ({ ...prev, ...data.user }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.next.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Password changed!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error('Avatar must be under 3 MB');
    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarLoading(true);
    try {
      const { data } = await uploadAvatar(fd);
      setProfile((prev) => ({ ...prev, user: { ...prev.user, avatarUrl: data.avatarUrl } }));
      if (setUser) setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const u = profile?.user;
  const initials = u?.name?.slice(0, 2).toUpperCase() || '??';

  const stats = [
    { label: 'Files', value: profile?.totalFiles ?? 0,      icon: Files,      color: 'text-violet-500' },
    { label: 'Storage', value: formatBytes(u?.storageUsed ?? 0), icon: HardDrive, color: 'text-emerald-500' },
    { label: 'Member since', value: timeAgo(u?.createdAt),  icon: Calendar,   color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* ── Header card ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 shadow-[0_0_12px_2px_var(--tw-shadow-color)] shadow-primary/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: '0 0 16px 4px var(--tw-shadow-color)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold cursor-pointer select-none border-4 border-primary shadow-[0_0_16px_4px_var(--tw-shadow-color)] shadow-primary/40 animate-glow"
              onClick={() => fileRef.current?.click()}
            >
              {u?.avatarUrl
                ? <img src={u.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : initials
              }
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/80 animate-glow"
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              title="Change avatar"
            >
              <Camera size={12} />
            </motion.button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-bold text-shadow-glow">{u?.name}</h2>
            <p className="text-sm text-muted-foreground">{u?.email}</p>
          </motion.div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            {stats.map(({ label, value, icon: Icon, color }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
                whileHover={{ scale: 1.07, boxShadow: '0 0 12px 2px var(--tw-shadow-color)' }}
                className="flex flex-col items-center rounded-xl bg-muted/50 px-4 py-2 text-center min-w-[80px] border-2 border-primary/20 shadow-[0_0_8px_2px_var(--tw-shadow-color)] shadow-primary/10 animate-glow"
              >
                <Icon size={16} className={color + ' drop-shadow-glow'} />
                <p className="mt-1 font-bold text-sm text-shadow-glow">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Edit profile ──────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <User size={16} className="text-indigo-500" />
            </div>
            <h3 className="font-semibold">Edit Profile</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </div>

        {/* ── Change password ──────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
              <Lock size={16} className="text-rose-500" />
            </div>
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={pwForm.next}
                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirm new password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={pwSaving} variant="destructive" className="w-full">
              {pwSaving ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>

      {/* ── Security note ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 flex items-start gap-3 border border-amber-500/20">
        <Shield size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Account security</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your data is encrypted at rest. We never share your information with third parties.
            Use a strong password and keep your email updated.
          </p>
        </div>
      </div>
    </div>
  );
}
