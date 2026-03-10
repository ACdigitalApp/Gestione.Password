import { useState } from "react";
import { Eye, EyeOff, Copy, Pencil, Trash2, ExternalLink, Key } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Password = Tables<"passwords">;

const CATEGORY_COLORS: Record<string, string> = {
  web: "bg-blue-500/20 text-blue-400",
  social: "bg-purple-500/20 text-purple-400",
  banking: "bg-green-500/20 text-green-400",
  email: "bg-yellow-500/20 text-yellow-400",
  lavoro: "bg-orange-500/20 text-orange-400",
  altro: "bg-slate-500/20 text-slate-400",
};

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  "bg-cyan-500", "bg-violet-500", "bg-teal-500", "bg-pink-500",
  "bg-blue-500", "bg-red-500",
];

function getInitials(name: string): string {
  return name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface PasswordRowProps {
  entry: Password;
  onEdit: (entry: Password) => void;
  onDelete: (id: string) => void;
}

export const PasswordRow = ({ entry, onEdit, onDelete }: PasswordRowProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiato negli appunti`);
  };

  const initials = getInitials(entry.site_name);
  const avatarColor = getAvatarColor(entry.site_name);
  const catClass = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.altro;

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-100 group border-b border-white/[0.04]">
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center flex-shrink-0`}>
        <span className="text-sm font-bold text-white">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-100 truncate">
            {entry.site_name}
          </h3>
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{entry.username}</p>
      </div>

      {/* Password */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 font-mono tracking-wider">
          {showPassword ? entry.password_encrypted : "••••••••"}
        </span>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-600 hover:text-slate-300 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Category badge */}
      <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${catClass} flex-shrink-0`}>
        {entry.category}
      </span>

      {/* Extra info or timestamp */}
      {entry.extra_info ? (
        <span className="text-xs text-slate-500 truncate max-w-[150px] hidden lg:block">
          {entry.extra_info}
        </span>
      ) : (
        <span className="text-xs text-slate-600 truncate max-w-[150px] hidden lg:block">
          aggiornata al {new Date(entry.updated_at).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}...
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => copyToClipboard(entry.password_encrypted, "Password")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-white/[0.06] transition-all"
          title="Copia password"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => copyToClipboard(entry.username, "Username")}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-white/[0.06] transition-all"
          title="Copia username"
        >
          <Key className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(entry)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          title="Modifica"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.06] transition-all"
          title="Elimina"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
