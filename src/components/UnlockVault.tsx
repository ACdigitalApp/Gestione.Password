import { useState } from "react";
import { Lock } from "lucide-react";
import { useVaultCrypto } from "@/contexts/VaultCryptoContext";
import { toast } from "sonner";

export const UnlockVault = () => {
  const { unlock } = useVaultCrypto();
  const [masterKey, setMasterKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey) return;
    setLoading(true);
    try {
      await unlock(masterKey);
      setMasterKey("");
    } catch (err) {
      toast.error((err as Error).message || "Errore sblocco vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border/40 rounded-2xl shadow-sm p-6 space-y-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Sblocca il Vault</h2>
          <p className="text-sm text-muted-foreground">
            Sblocca il vault con la tua chiave principale.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Chiave principale del Vault
          </label>
          <input
            type="password"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
            autoFocus
            required
            className="w-full h-11 rounded-lg border bg-secondary border-border px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="••••••••"
          />
          <p className="text-[11px] text-muted-foreground">
            Non è la password dell'account. È la chiave che protegge le tue password salvate.
            Non viene mai inviata al server.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !masterKey}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sblocco…" : "Sblocca Vault"}
        </button>
      </form>
    </div>
  );
};
