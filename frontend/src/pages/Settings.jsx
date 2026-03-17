import { useState } from 'react';
import { Moon, Sun, Bell, Trash2, Shield, Palette, LogOut, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth }  from '../context/AuthContext';
import { Button }   from '../components/ui/button';

function SectionCard({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
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
      <SectionCard icon={Palette} iconColor="bg-violet-500" title="Appearance">
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
              ${!isDark ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Sun size={14} /> Light
          </button>
          <button
            onClick={() => isDark && toggleTheme()}
            className={`flex-1 rounded-xl border py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${isDark ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Moon size={14} /> Dark
          </button>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} iconColor="bg-amber-500" title="Notifications">
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
      <SectionCard icon={Shield} iconColor="bg-emerald-500" title="Security">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Extra layer of account security</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Coming soon</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <div>
              <p className="font-medium">Active sessions</p>
              <p className="text-xs text-muted-foreground">Manage devices with access to your account</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Coming soon</span>
          </div>
        </div>
      </SectionCard>

      {/* Sign out */}
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <LogOut size={15} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">Sign out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border border-destructive/30">
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
            className="w-full rounded-xl border border-destructive/40 bg-background px-3 py-2 text-sm outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20"
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
      </div>
    </div>
  );
}
