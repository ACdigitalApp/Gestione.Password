import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

const CATEGORIES = [
  { value: "web", label: "Web" },
  { value: "social", label: "Social" },
  { value: "banking", label: "Banking" },
  { value: "email", label: "Email" },
  { value: "lavoro", label: "Lavoro" },
  { value: "altro", label: "Altro" },
];

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url?: string;
    notes?: string;
    category: string;
    extra_info?: string;
  }) => void;
  editingPassword?: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url: string | null;
    notes: string | null;
    category: string;
    extra_info: string | null;
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
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("web");
  const [extraInfo, setExtraInfo] = useState("");

  useEffect(() => {
    if (editingPassword) {
      setSiteName(editingPassword.site_name);
      setUsername(editingPassword.username);
      setPassword(editingPassword.password_encrypted);
      setUrl(editingPassword.url || "");
      setNotes(editingPassword.notes || "");
      setCategory(editingPassword.category || "web");
      setExtraInfo(editingPassword.extra_info || "");
    } else {
      setSiteName("");
      setUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
      setCategory("web");
      setExtraInfo("");
    }
    setShowPassword(false);
  }, [editingPassword, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      site_name: siteName,
      username,
      password_encrypted: password,
      url: url || undefined,
      notes: notes || undefined,
      category,
      extra_info: extraInfo || undefined,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#15151a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-slate-100">
            {editingPassword ? "Modifica Password" : "Nuova Password"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Nome Sito</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
                placeholder="es. GitHub"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Username / Email</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
                placeholder="utente@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 h-11 appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#15151a] text-slate-100">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Info extra</label>
              <input
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-11"
                placeholder="es. CODICE DI ATTIVAZIONE..."
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Note</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 resize-none"
                rows={2}
              />
            </div>
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
