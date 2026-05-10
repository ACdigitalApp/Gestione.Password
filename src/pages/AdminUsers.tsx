import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { StatBox } from "@/components/admin/StatBox";
import { TotalVisitsCard } from "@/components/admin/TotalVisitsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  plan: string;
  status: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
};

type Revenue = { app_key: string; app_name: string; amount: number; currency: string };

const REQUIRED_REVENUE_APPS: { app_key: string; app_name: string }[] = [
  { app_key: "gestione-scadenze", app_name: "Gestione Scadenze" },
  { app_key: "gestione-password", app_name: "Gestione Password" },
  { app_key: "librifree", app_name: "LibriFree" },
  { app_key: "speak-translate", app_name: "Speak & Translate Live" },
  { app_key: "djsengine", app_name: "DJSEngine" },
  { app_key: "rosario-settimanale", app_name: "Rosario Settimanale" },
];

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("it-IT") : "—");

const AdminUsers = () => {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-list-users");
      if (error) toast.error(error.message);
      else setUsers((data as any)?.users ?? []);

      const { data: rev } = await supabase.from("app_revenues").select("*").order("app_name");
      const dbRows = (rev as Revenue[]) ?? [];
      console.log("APP_REVENUES_DB_KEYS", dbRows.map((r) => r.app_key));
      console.log("APP_REVENUES_DB_NAMES", dbRows.map((r) => r.app_name));
      const dbMap = new Map(dbRows.map((r) => [r.app_key, r]));
      const merged: Revenue[] = REQUIRED_REVENUE_APPS.map((req) => {
        const found = dbMap.get(req.app_key);
        return {
          app_key: req.app_key,
          app_name: req.app_name,
          amount: Number(found?.amount ?? 0),
          currency: found?.currency ?? "EUR",
        };
      });
      console.log("APP_REVENUES_RENDERED_KEYS", merged.map((r) => r.app_key));
      console.log("APP_REVENUES_RENDERED_NAMES", merged.map((r) => r.app_name));
      setRevenues(merged);
      setLoading(false);
    })();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const blocked = users.filter((u) => u.status === "blocked").length;
    const free = users.filter((u) => u.plan === "free").length;
    const premium = users.filter((u) => u.plan === "premium").length;
    const admins = users.filter((u) => u.roles.includes("admin")).length;
    return { total, active, blocked, free, premium, admins };
  }, [users]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento…</div>;
  }
  if (!session) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin · Gestione Utenti</h1>
            <p className="text-sm text-muted-foreground">Pannello di amministrazione</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Vault
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox label="Totale Utenti" value={stats.total} />
          <StatBox label="Attivi" value={stats.active} />
          <StatBox label="Bloccati" value={stats.blocked} />
          <StatBox label="Free" value={stats.free} />
          <StatBox label="Premium" value={stats.premium} />
          <StatBox label="Admin" value={stats.admins} />
        </div>

        {/* Visite totali */}
        <TotalVisitsCard />

        {/* Incassi */}
        <div className="bg-card rounded-xl border border-border/40 shadow-sm p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">Incassi Tutte le App</h3>
          <p className="text-xs text-muted-foreground mb-4">Versione incassi: AC6</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {revenues.map((r) => (
              <div key={r.app_key} className="rounded-lg border border-border/40 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{r.app_name}</span>
                <span className="text-lg font-bold text-foreground">
                  € {Number(r.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/40">
            <h3 className="text-base font-semibold text-foreground">Utenti registrati</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Piano</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Registrato</TableHead>
                  <TableHead>Ultimo accesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Caricamento…</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Nessun utente</TableCell></TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                      <TableCell>{u.whatsapp ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.roles.includes("admin") ? "default" : "secondary"}>
                          {u.roles.includes("admin") ? "admin" : "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.plan === "premium" ? "default" : "outline"}>{u.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "blocked" ? "destructive" : "secondary"}>{u.status}</Badge>
                      </TableCell>
                      <TableCell>{fmt(u.created_at)}</TableCell>
                      <TableCell>{fmt(u.last_sign_in_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
