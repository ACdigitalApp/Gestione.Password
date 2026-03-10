import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    toast.success(`${label} copiato`);
  };

  return (
    <div className="border-b-2 border-border p-4 hover:bg-muted/50 transition-colors duration-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-semibold truncate">
              {entry.site_name}
            </h3>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{entry.username}</span>
            <button
              onClick={() => copyToClipboard(entry.username, "Username")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs">
              {showPassword ? entry.password_encrypted : "••••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-3 w-3" strokeWidth={1.5} />
              ) : (
                <Eye className="h-3 w-3" strokeWidth={1.5} />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(entry.password_encrypted, "Password")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>

          {entry.notes && (
            <p className="mt-1.5 text-xs text-muted-foreground truncate">{entry.notes}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(entry)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(entry.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};
