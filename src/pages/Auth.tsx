import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import padlockIcon from "@/assets/padlock-icon.png";

const Auth = () => {
  const { session, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D0F]">
        <p className="text-slate-400 text-sm">Caricamento...</p>
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success("Controlla la tua email per confermare la registrazione.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#090D0F]">
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            alt="Logo"
            className="w-20 h-20 rounded-2xl drop-shadow-[0_4px_16px_rgba(99,102,241,0.35)] animate-pulse"
            src={padlockIcon}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">
          {isLogin ? "Accedi" : "Registrati"}
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          {isLogin
            ? "Inserisci le tue credenziali per sbloccare il vault."
            : "Crea un account per proteggere le tue password."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 md:text-sm bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-12"
              placeholder="tua@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 md:text-sm bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 h-12 pr-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLogin ? (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                {submitting ? "Accesso..." : "Accedi"}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {submitting ? "Registrazione..." : "Registrati"}
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        {isLogin && (
          <div className="mt-4 text-center">
            <button className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Non ricordi la Password?
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
          >
            {isLogin ? "Prima volta? Registrati" : "Hai già un account? Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
