import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Password = Tables<"passwords">;

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

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-slate-100 truncate">
              {entry.site_name}
            </h3>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm text-slate-400">{entry.username}</span>
            <button
              onClick={() => copyToClipboard(entry.username, "Username")}
              className="text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-mono">
              {showPassword ? entry.password_encrypted : "••••••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-600 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(entry.password_encrypted, "Password")}
              className="text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {entry.notes && (
            <p className="mt-2 text-xs text-slate-500 truncate">{entry.notes}</p>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.06] transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
