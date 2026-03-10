import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PasswordDialog } from "@/components/PasswordDialog";
import { PasswordRow } from "@/components/PasswordRow";
import { toast } from "sonner";
import { Plus, Search, LogOut, Shield, Key } from "lucide-react";
import { InstallPWA } from "@/components/InstallPWA";
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
      <div className="min-h-screen flex items-center justify-center bg-[#090D0F]">
        <p className="text-slate-400 text-sm">Caricamento...</p>
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
    <div className="min-h-screen bg-[#090D0F]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#090D0F]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-100">Vault</h1>
          </div>

          <div className="flex items-center gap-3">
            <InstallPWA />
            <span className="text-xs text-slate-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
              title="Esci"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca password..."
              className="w-full rounded-xl border px-3 py-1 pl-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-white/[0.04] border-white/[0.08] text-slate-100 placeholder:text-slate-500 h-11"
            />
          </div>
          <button
            onClick={() => {
              setEditingPassword(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
        </div>

        {/* Password count */}
        {!fetching && filtered.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">
            {filtered.length} {filtered.length === 1 ? "password" : "password"} salvat{filtered.length === 1 ? "a" : "e"}
          </p>
        )}

        {/* List */}
        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-500">Caricamento...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Key className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 mb-1">
              {search ? "Nessun risultato trovato" : "Nessuna password salvata"}
            </p>
            {!search && (
              <p className="text-xs text-slate-600">
                Clicca "Aggiungi" per iniziare
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
      </main>

      <PasswordDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPassword(null);
        }}
        onSave={handleSave}
        editingPassword={editingPassword}
      />
    </div>
  );
};

export default Index;
