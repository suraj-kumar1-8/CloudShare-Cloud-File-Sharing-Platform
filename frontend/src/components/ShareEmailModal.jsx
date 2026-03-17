import { useState }  from 'react';
import { Mail, X, Send, Clock, ExternalLink } from 'lucide-react';
import toast          from 'react-hot-toast';
import { shareByEmail } from '../api/user';
import { Button }     from './ui/button';
import { Input }      from './ui/input';
import { Label }      from './ui/label';

const EXPIRY_OPTIONS = [
  { label: 'No expiry',  value: 0 },
  { label: '1 hour',     value: 1 },
  { label: '24 hours',   value: 24 },
  { label: '7 days',     value: 168 },
];

/**
 * ShareEmailModal — lets the file owner send a share link directly to an
 * email address without leaving the app.
 *
 * Props:
 *   isOpen   – boolean
 *   onClose  – () => void
 *   file     – { _id, originalName }
 */
export default function ShareEmailModal({ isOpen, onClose, file }) {
  const [email,     setEmail]     = useState('');
  const [message,   setMessage]   = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [sending,   setSending]   = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // Ethereal test URL (dev only)

  if (!isOpen || !file) return null;

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setExpiresIn(24);
    setSending(false);
    setPreviewUrl(null);
    onClose();
  };

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error('Please enter a recipient email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const { data } = await shareByEmail(file._id, email.trim(), expiresIn, message.trim());
      toast.success('Email sent successfully!');
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
      else handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Success state — show preview link (dev / Ethereal only)
  if (previewUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleBackdrop}
      >
        <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 text-3xl">✅</div>
          <h3 className="font-semibold text-lg">Email sent!</h3>
          <p className="text-sm text-muted-foreground">
            A share link for <strong>{file.originalName}</strong> was sent to{' '}
            <strong>{email}</strong>.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Dev mode — no real SMTP configured. View the message on Ethereal:
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink size={14} className="mr-2" />
            Open email preview
          </Button>
          <Button className="w-full" onClick={handleClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md rounded-2xl bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Mail size={18} className="text-blue-600" />
            Share via Email
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <p className="text-sm text-muted-foreground truncate">
            Sharing: <span className="font-medium text-foreground">{file.originalName}</span>
          </p>

          {/* Recipient */}
          <div className="space-y-1.5">
            <Label htmlFor="se-email">Recipient email *</Label>
            <Input
              id="se-email"
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          {/* Expiry */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Clock size={13} />
              Link expires in
            </Label>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExpiresIn(value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    expiresIn === value
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional message */}
          <div className="space-y-1.5">
            <Label htmlFor="se-message">Personal message (optional)</Label>
            <textarea
              id="se-message"
              rows={3}
              placeholder="Add a note to the recipient…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !email.trim()}>
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending…
              </span>
            ) : (
              <>
                <Send size={14} className="mr-1.5" />
                Send email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
