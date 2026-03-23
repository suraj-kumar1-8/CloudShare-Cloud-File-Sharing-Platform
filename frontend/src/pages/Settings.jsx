import { useState } from 'react';
import { Moon, Sun, Bell, Trash2, Shield, Palette, LogOut, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { Button }   from '../components/ui/button';
import GlassCard from '../components/GlassCard';

function SectionCard({ icon: Icon, iconColor, title, children }) {
  return (
    <GlassCard hover={false} className="p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${iconColor || ''}`}>
          <Icon size={16} className="text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </GlassCard>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout }             = useAuth();
  const isDark                 = theme === 'dark';

  const [notifs, setNotifs] = useState({
    uploads:   true,
    downloads: true,
    shares:    true,
    expiry:    true,
  });

  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting]       = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return toast.error('Type DELETE to confirm');
    setDeleting(true);
    // Placeholder — wire to backend /api/profile DELETE in the future
    setTimeout(() => {
      toast.success('Account deleted. Goodbye!');
      logout();
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your preferences and account</p>
      </div>

      {/* Appearance */}
      <SectionCard icon={Palette} iconColor="" title="Appearance">
        <Toggle
          label="Dark mode"
          description="Switch between light and dark interface"
          checked={isDark}
          onChange={toggleTheme}
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`flex-1 rounded-xl border py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${!isDark ? 'border-primary/40 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'}`}
          >
            <Sun size={14} /> Light
          </button>
          <button
            onClick={() => isDark && toggleTheme()}
            className={`flex-1 rounded-xl border py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${isDark ? 'border-primary/40 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'}`}
          >
            <Moon size={14} /> Dark
          </button>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} iconColor="" title="Notifications">
        <div className="divide-y divide-border">
          <Toggle
            label="File uploads"
            description="Notify when a file finishes uploading"
            checked={notifs.uploads}
            onChange={() => { setNotifs((p) => ({ ...p, uploads: !p.uploads })); toast.success('Preference saved'); }}
          />
          <Toggle
            label="File downloads"
            description="Notify when someone downloads your file"
            checked={notifs.downloads}
            onChange={() => { setNotifs((p) => ({ ...p, downloads: !p.downloads })); toast.success('Preference saved'); }}
          />
          <Toggle
            label="Share activity"
            description="Notify when files are shared or links accessed"
            checked={notifs.shares}
            onChange={() => { setNotifs((p) => ({ ...p, shares: !p.shares })); toast.success('Preference saved'); }}
          />
          <Toggle
            label="File expiry warnings"
            description="Remind me before a file's share link expires"
            checked={notifs.expiry}
            onChange={() => { setNotifs((p) => ({ ...p, expiry: !p.expiry })); toast.success('Preference saved'); }}
          />
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard icon={Shield} iconColor="" title="Security">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Extra layer of account security</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60">Coming soon</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="font-medium">Active sessions</p>
              <p className="text-xs text-muted-foreground">Manage devices with access to your account</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60">Coming soon</span>
          </div>
        </div>
      </SectionCard>

      {/* Sign out */}
      <GlassCard hover={false} className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <LogOut size={15} className="text-white/70" />
          </div>
          <div>
            <p className="font-medium text-sm">Sign out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard hover={false} className="p-6 border border-destructive/30">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <h3 className="font-semibold text-destructive">Danger zone</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div className="space-y-3">
          <input
            className="w-full rounded-2xl border border-destructive/40 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none backdrop-blur-xl focus:border-destructive focus:ring-2 focus:ring-destructive/20"
            placeholder='Type "DELETE" to confirm'
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
          />
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            disabled={deleteInput !== 'DELETE' || deleting}
            onClick={handleDeleteAccount}
          >
            <Trash2 size={14} className="mr-1.5" />
            {deleting ? 'Deleting…' : 'Delete my account permanently'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
