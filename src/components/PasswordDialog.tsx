import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

type Password = Tables<"passwords">;

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url?: string;
    notes?: string;
  }) => void;
  editingPassword?: Password | null;
}

export const PasswordDialog = ({
  open,
  onOpenChange,
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-border bg-card p-0 max-w-md">
        <DialogHeader className="bg-secondary p-5">
          <DialogTitle className="font-mono text-sm uppercase tracking-wider text-secondary-foreground">
            {editingPassword ? "MODIFICA PASSWORD" : "NUOVA PASSWORD"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider">Sito</Label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="font-mono text-sm border-2 border-border focus:border-primary"
              placeholder="es. GitHub"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider">Username / Email</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono text-sm border-2 border-border focus:border-primary"
              placeholder="utente@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-mono text-sm border-2 border-border focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider">URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm border-2 border-border focus:border-primary"
              placeholder="https://github.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-xs uppercase tracking-wider">Note</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-mono text-sm border-2 border-border focus:border-primary resize-none"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-mono text-sm uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 h-10"
          >
            {editingPassword ? "AGGIORNA" : "SALVA"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
