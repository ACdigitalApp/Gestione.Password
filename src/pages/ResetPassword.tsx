import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import padlockIcon from "@/assets/padlock-icon.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    if (password.length < 6) {
      toast.error("La password deve avere almeno 6 caratteri");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password aggiornata con successo!");
      navigate("/");
    }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D0F]">
        <p className="text-slate-400 text-sm">Link non valido o scaduto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#090D0F]">
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl">
        <div className="flex justify-center mb-6">
          <img alt="Logo" className="w-20 h-20 rounded-2xl" src={padlockIcon} />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">Nuova Password</h1>
        <p className="text-sm text-slate-400 text-center mb-8">Inserisci la tua nuova password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Nuova Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 md:text-sm bg-white/[0.05] border-white/10 text-slate-100 h-12 pr-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-medium text-xs uppercase tracking-wider text-slate-400">Conferma Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 md:text-sm bg-white/[0.05] border-white/10 text-slate-100 h-12"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base shadow-lg transition-all disabled:opacity-50"
          >
            <KeyRound className="w-5 h-5" />
            {submitting ? "Aggiornamento..." : "Aggiorna Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
