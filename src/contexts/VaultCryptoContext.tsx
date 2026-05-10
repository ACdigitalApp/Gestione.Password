import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { deriveVaultKey } from "@/lib/vaultCrypto";

type VaultCryptoContextType = {
  key: CryptoKey | null;
  isUnlocked: boolean;
  unlock: (masterKey: string) => Promise<void>;
  lock: () => void;
};

const VaultCryptoContext = createContext<VaultCryptoContextType>({
  key: null,
  isUnlocked: false,
  unlock: async () => {},
  lock: () => {},
});

export const useVaultCrypto = () => useContext(VaultCryptoContext);

export const VaultCryptoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const keyRef = useRef<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const lock = useCallback(() => {
    keyRef.current = null;
    setIsUnlocked(false);
  }, []);

  // Drop key whenever the user changes (logout / switch user).
  useEffect(() => {
    lock();
  }, [user?.id, lock]);

  const unlock = useCallback(async (masterKey: string) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("profiles")
      .select("vault_salt")
      .eq("user_id", user.id)
      .single();
    if (error || !data?.vault_salt) {
      throw new Error("Impossibile recuperare il salt del vault.");
    }
    const k = await deriveVaultKey(masterKey, data.vault_salt);
    keyRef.current = k;
    setIsUnlocked(true);
  }, [user]);

  return (
    <VaultCryptoContext.Provider
      value={{ key: keyRef.current, isUnlocked, unlock, lock }}
    >
      {children}
    </VaultCryptoContext.Provider>
  );
};
