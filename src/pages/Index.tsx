import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordDialog } from "@/components/PasswordDialog";
import { PasswordRow } from "@/components/PasswordRow";
import { toast } from "sonner";
import { Plus, Search, LogOut, Key } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Password = Tables<"passwords">;

const Index = () => {
  const { session, user, loading, signOut } = useAuth();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) fetchPasswords();
  }, [user]);

  const fetchPasswords = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("passwords")
      .select("*")
      .order("site_name", { ascending: true });

    if (error) toast.error(error.message);
    else setPasswords(data || []);
    setFetching(false);
  };

  const handleSave = async (data: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url?: string;
    notes?: string;
  }) => {
    if (editingPassword) {
      const { error } = await supabase
        .from("passwords")
        .update(data)
        .eq("id", editingPassword.id);

      if (error) toast.error(error.message);
      else {
        toast.success("Password aggiornata");
        fetchPasswords();
      }
    } else {
      const { error } = await supabase
        .from("passwords")
        .insert({ ...data, user_id: user!.id });

      if (error) toast.error(error.message);
      else {
        toast.success("Password salvata");
        fetchPasswords();
      }
    }
    setEditingPassword(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("passwords").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Password eliminata");
      fetchPasswords();
    }
  };

  const handleEdit = (entry: Password) => {
    setEditingPassword(entry);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-muted-foreground">CARICAMENTO...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  const filtered = passwords.filter(
    (p) =>
      p.site_name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-secondary flex-col border-r-2 border-border">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <h1 className="font-mono text-lg font-bold text-secondary-foreground tracking-tight">
              EMERGENT
            </h1>
          </div>
          <div className="mt-2 h-[2px] w-10 bg-primary" />
        </div>

        <div className="flex-1" />

        <div className="p-5 border-t-2 border-sidebar-border">
          <p className="font-mono text-xs text-secondary-foreground/60 truncate mb-3">
            {user?.email}
          </p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 font-mono text-xs text-secondary-foreground/60 hover:text-primary transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            ESCI
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b-2 border-border bg-secondary">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span className="font-mono text-sm font-bold text-secondary-foreground">EMERGENT</span>
          </div>
          <button
            onClick={signOut}
            className="text-secondary-foreground/60 hover:text-primary transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca..."
                className="pl-10 font-mono text-sm border-2 border-border focus:border-primary"
              />
            </div>
            <Button
              onClick={() => {
                setEditingPassword(null);
                setDialogOpen(true);
              }}
              className="font-mono text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-1.5"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">AGGIUNGI</span>
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {fetching ? (
            <div className="flex items-center justify-center p-12">
              <p className="font-mono text-sm text-muted-foreground">CARICAMENTO...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Key className="h-10 w-10 text-muted-foreground/30 mb-4" strokeWidth={1} />
              <p className="font-mono text-sm text-muted-foreground">
                {search ? "Nessun risultato" : "Nessuna password salvata"}
              </p>
              {!search && (
                <p className="font-mono text-xs text-muted-foreground/60 mt-1">
                  Clicca AGGIUNGI per iniziare
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="px-4 py-2 border-b border-border">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {filtered.length} {filtered.length === 1 ? "voce" : "voci"}
                </span>
              </div>
              {filtered.map((entry) => (
                <PasswordRow
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <PasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editingPassword={editingPassword}
      />
    </div>
  );
};

export default Index;
