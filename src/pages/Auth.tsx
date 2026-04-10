import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { InstallPWA } from "@/components/InstallPWA";
import padlockIcon from "@/assets/padlock-icon.png";

const Auth = () => {
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Caricamento...</p>
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Email di recupero inviata! Controlla la tua casella di posta.");
      setSubmitting(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Credenziali non valide. Registrati se non hai un account.");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success("Registrazione completata! Puoi accedere.");
    }

    setSubmitting(false);
  };

  const title = mode === "login" ? "Accedi" : mode === "signup" ? "Registrati" : "Recupera Password";
  const subtitle = mode === "login"
    ? "Inserisci le tue credenziali per sbloccare il vault."
    : mode === "signup"
    ? "Crea un account per proteggere le tue password."
    : "Inserisci la tua email per ricevere il link di recupero.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[420px] bg-card backdrop-blur-2xl border border-border rounded-3xl p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            alt="Logo"
            className="w-20 h-20 rounded-2xl drop-shadow-[0_4px_16px_rgba(99,102,241,0.35)] animate-pulse"
            src={padlockIcon}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">{subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary md:text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12"
              placeholder="tua@email.com"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary md:text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {mode === "login" && (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                {submitting ? "Accesso..." : "Accedi"}
              </>
            )}
            {mode === "signup" && (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {submitting ? "Registrazione..." : "Registrati"}
              </>
            )}
            {mode === "forgot" && (submitting ? "Invio..." : "Invia link di recupero")}
          </button>
        </form>

        {/* Forgot password link */}
        {mode === "login" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setMode("forgot")}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Non ricordi la Password?
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setMode("login")}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna al login
            </button>
          </div>
        )}

        {mode !== "forgot" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
            >
              {mode === "login" ? "Prima volta? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>
        )}

        {/* Install PWA */}
        <div className="mt-4 text-center">
          <InstallPWA />
        </div>
      </div>
    </div>
  );
};

export default Auth;