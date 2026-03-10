import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url?: string;
    notes?: string;
  }) => void;
  editingPassword?: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url: string | null;
    notes: string | null;
  } | null;
}

export const PasswordDialog = ({
  open,
  onClose,
  onSave,
  editingPassword,
}: PasswordDialogProps) => {
  const [siteName, setSiteName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingPassword) {
      setSiteName(editingPassword.site_name);
      setUsername(editingPassword.username);
      setPassword(editingPassword.password_encrypted);
      setUrl(editingPassword.url || "");
      setNotes(editingPassword.notes || "");
    } else {
      setSiteName("");
      setUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
    }
  }, [editingPassword, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      site_name: siteName,
      username,
      password_encrypted: password,
      url: url || undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-slate-100">
            {editingPassword ? "Modifica Password" : "Nuova Password"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Nome Sito
            </label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
              placeholder="es. GitHub"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Username / Email
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
              placeholder="utente@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
              placeholder="https://github.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 resize-none"
              rows={2}
              placeholder="Note opzionali..."
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-md bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            {editingPassword ? "Aggiorna" : "Salva"}
          </button>
        </form>
      </div>
    </div>
  );
};
