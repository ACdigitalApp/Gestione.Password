import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useVaultCrypto } from "@/contexts/VaultCryptoContext";
import { encryptPassword, decryptPassword, isEncryptedPayload } from "@/lib/vaultCrypto";
import { UnlockVault } from "@/components/UnlockVault";
import { supabase } from "@/integrations/supabase/client";
import { PasswordDialog } from "@/components/PasswordDialog";
import { PasswordRow } from "@/components/PasswordRow";
import { InstallPWA } from "@/components/InstallPWA";
import { toast } from "sonner";
import {
  Plus, Search, LogOut, Download, Upload, Printer,
  Users, Globe, CreditCard, Mail, Briefcase, FolderOpen,
  LayoutGrid, Key,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import padlockIcon from "@/assets/padlock-icon.png";

type Password = Tables<"passwords">;

const CATEGORIES = [
  { value: "tutte", label: "Tutte", icon: LayoutGrid },
  { value: "web", label: "Web", icon: Globe },
  { value: "social", label: "Social", icon: Users },
  { value: "banking", label: "Banking", icon: CreditCard },
  { value: "email", label: "Email", icon: Mail },
  { value: "lavoro", label: "Lavoro", icon: Briefcase },
  { value: "altro", label: "Altro", icon: FolderOpen },
];

type SortOption = "a-z" | "z-a" | "recent";

const Index = () => {
  const { session, user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isUnlocked, key, lock } = useVaultCrypto();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState("tutte");
  const [sortBy, setSortBy] = useState<SortOption>("a-z");

  useEffect(() => {
    if (user && isUnlocked && key) fetchPasswords();
    if (!isUnlocked) setPasswords([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUnlocked]);

  const fetchPasswords = async () => {
    if (!key || !user) return;
    setFetching(true);
    const { data, error } = await supabase
      .from("passwords")
      .select("*")
      .order("site_name", { ascending: true });

    if (error) {
      toast.error(error.message);
      setFetching(false);
      return;
    }

    const rows = data ?? [];
    const decrypted: Password[] = [];
    const legacyToMigrate: Password[] = [];

    for (const row of rows) {
      if (isEncryptedPayload(row.password_encrypted)) {
        try {
          const plain = await decryptPassword(row.password_encrypted, key);
          decrypted.push({ ...row, password_encrypted: plain });
        } catch {
          decrypted.push({ ...row, password_encrypted: "" });
        }
      } else {
        // Legacy plain-text record belonging to this user.
        decrypted.push({ ...row });
        legacyToMigrate.push(row);
      }
    }

    setPasswords(decrypted);
    setFetching(false);

    if (legacyToMigrate.length > 0) {
      let migrated = 0;
      for (const row of legacyToMigrate) {
        try {
          const envelope = await encryptPassword(row.password_encrypted, key);
          const { error: upErr } = await supabase
            .from("passwords")
            .update({ password_encrypted: envelope })
            .eq("id", row.id);
          if (!upErr) migrated++;
        } catch {
          // leave record intact on failure
        }
      }
      if (migrated > 0) toast.success("Vault aggiornato alla protezione avanzata.");
    }
  };

  const handleSave = async (data: {
    site_name: string;
    username: string;
    password_encrypted: string;
    url?: string;
    notes?: string;
    category: string;
    extra_info?: string;
  }) => {
    if (!key || !user) {
      toast.error("Vault bloccato");
      return;
    }
    const envelope = await encryptPassword(data.password_encrypted, key);
    const payload = { ...data, password_encrypted: envelope };
    if (editingPassword) {
      const { error } = await supabase
        .from("passwords")
        .update(payload)
        .eq("id", editingPassword.id);
      if (error) toast.error(error.message);
      else { toast.success("Password aggiornata"); fetchPasswords(); }
    } else {
      const { error } = await supabase
        .from("passwords")
        .insert({ ...payload, user_id: user.id });
      if (error) toast.error(error.message);
      else { toast.success("Password salvata"); fetchPasswords(); }
    }
    setEditingPassword(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("passwords").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Password eliminata"); fetchPasswords(); }
  };

  const handleEdit = (entry: Password) => {
    setEditingPassword(entry);
    setDialogOpen(true);
  };

  // Backup: export as JSON (compatible with original format)
  const handleBackup = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      total: passwords.length,
      passwords: passwords.map((p) => ({
        title: p.site_name,
        username: p.username,
        password: p.password_encrypted,
        url: p.url || "",
        category: p.category,
        notes: p.notes || "",
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_password_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup scaricato");
  };

  // Restore: import from JSON
  const handleRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        // Support both formats: array directly or { passwords: [...] }
        const imported: Array<Record<string, string>> = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.passwords)
          ? parsed.passwords
          : [];

        if (imported.length === 0) {
          toast.error("Nessuna password trovata nel file");
          return;
        }

        let count = 0;
        let errors = 0;
        for (const item of imported) {
          const siteName = item.site_name || item.title || "";
          const username = item.username || "";
          const passwordVal = item.password_encrypted || item.password || "";

          if (!siteName || !passwordVal) continue;

          if (!key) {
            toast.error("Vault bloccato");
            errors++;
            continue;
          }
          const envelope = await encryptPassword(passwordVal, key);
          const { error } = await supabase.from("passwords").insert({
            site_name: siteName,
            username: username,
            password_encrypted: envelope,
            url: item.url || null,
            notes: item.notes || null,
            category: item.category || "web",
            extra_info: item.extra_info || null,
            user_id: user!.id,
          });
          if (error) {
            console.error("Errore importazione:", siteName, error.message);
            errors++;
          } else {
            count++;
          }
        }
        if (errors > 0) {
          toast.warning(`${count} importate, ${errors} errori`);
        } else {
          toast.success(`${count} password importate`);
        }
        fetchPasswords();
      } catch (err) {
        console.error("Errore parsing file:", err);
        toast.error("File non valido");
      }
    };
    input.click();
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { tutte: passwords.length };
    CATEGORIES.forEach((c) => {
      if (c.value !== "tutte") {
        counts[c.value] = passwords.filter((p) => p.category === c.value).length;
      }
    });
    return counts;
  }, [passwords]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let result = passwords;

    if (activeCategory !== "tutte") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.site_name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q)
      );
    }

    if (sortBy === "a-z") {
      result = [...result].sort((a, b) => a.site_name.localeCompare(b.site_name));
    } else if (sortBy === "z-a") {
      result = [...result].sort((a, b) => b.site_name.localeCompare(a.site_name));
    } else {
      result = [...result].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return result;
  }, [passwords, activeCategory, search, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Caricamento...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (!isUnlocked) return <UnlockVault />;

  const handleSignOut = async () => {
    lock();
    await signOut();
  };

  const handleLockVault = () => {
    lock();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2.5">
            <img src={padlockIcon} alt="Logo" className="w-7 h-7 rounded-lg" />
            <h1 className="text-base font-bold text-foreground hidden sm:block">Gestione Password</h1>
          </div>

          <div className="flex items-center gap-1">
            {/* Aggiungi */}
            <button
              onClick={() => { setEditingPassword(null); setDialogOpen(true); }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi
            </button>

            {/* Scarica App */}
            <div className="hidden sm:flex items-center">
              <InstallPWA />
            </div>

            {/* Backup */}
            <button
              onClick={handleBackup}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
              title="Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Ripristina */}
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
              title="Ripristina"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ripristina</span>
            </button>

            {/* Stampa */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
              title="Stampa"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Stampa</span>
            </button>

            {/* Admin */}
            {isAdmin && (
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
                title="Admin"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* User email */}
            <span className="text-xs text-muted-foreground px-2 hidden lg:block">{user?.email}</span>

            {/* Blocca Vault */}
            <button
              onClick={handleLockVault}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
              title="Blocca Vault"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Blocca</span>
            </button>

            {/* Esci */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
              title="Esci"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-44 flex-col bg-card border-r border-border/20 py-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            const count = categoryCounts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className={`text-xs ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Le tue password</span>
              <span className="text-xs text-muted-foreground">{filtered.length} voci</span>
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca password..."
                className="w-48 lg:w-64 rounded-lg border px-3 pl-9 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border px-3 text-sm bg-secondary border-border text-foreground h-9 appearance-none pr-8"
            >
              <option value="a-z" className="bg-card">A-Z</option>
              <option value="z-a" className="bg-card">Z-A</option>
              <option value="recent" className="bg-card">Recenti</option>
            </select>
          </div>

          {/* Mobile category tabs */}
          <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-b border-border/20">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label} ({categoryCounts[cat.value] ?? 0})
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {fetching ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                  <Key className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {search ? "Nessun risultato trovato" : "Nessuna password salvata"}
                </p>
                {!search && (
                  <p className="text-xs text-muted-foreground">
                    Clicca "Aggiungi" per iniziare
                  </p>
                )}
              </div>
            ) : (
              <div>
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
      </div>

      <PasswordDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingPassword(null); }}
        onSave={handleSave}
        editingPassword={editingPassword}
      />
    </div>
  );
};

export default Index;
