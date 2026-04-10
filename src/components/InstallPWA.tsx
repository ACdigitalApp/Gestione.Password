import { useState, useEffect } from "react";
import { Download, X, Share, Plus as PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { VisitCounter } from "./VisitCounter";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback: show generic instructions for browsers that don't support beforeinstallprompt
      toast.info("Per installare l'app: apri il menu del browser (⋮) e seleziona 'Installa app' o 'Aggiungi alla schermata Home'.");
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <div className="flex flex-col items-center">
        <button
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 h-8 rounded-md px-3 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 font-medium transition-colors"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Scarica App
        </button>
        <span className="text-[10px] italic text-muted-foreground">by AC Digital App</span>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
          <div className="relative w-full max-w-sm bg-[#1a1a2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Installa su iPhone / iPad
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">1</span>
                </div>
                <p className="text-sm text-slate-300">
                  Tocca il pulsante <Share className="inline w-4 h-4 text-indigo-400 mx-0.5" /> <strong>Condividi</strong> nella barra di Safari
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">2</span>
                </div>
                <p className="text-sm text-slate-300">
                  Scorri e tocca <PlusIcon className="inline w-4 h-4 text-indigo-400 mx-0.5" /> <strong>Aggiungi alla schermata Home</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">3</span>
                </div>
                <p className="text-sm text-slate-300">
                  Tocca <strong>Aggiungi</strong> per confermare
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
