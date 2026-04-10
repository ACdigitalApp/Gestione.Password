import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "last_visit_counted";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const VisitCounter = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      const lastCounted = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      const shouldIncrement = !lastCounted || now - Number(lastCounted) > ONE_DAY_MS;

      if (shouldIncrement) {
        const { data } = await supabase.rpc("increment_visits");
        if (data != null) {
          setCount(Number(data));
          localStorage.setItem(STORAGE_KEY, String(now));
          return;
        }
      }

      // Just fetch current count
      const { data } = await supabase
        .from("site_stats")
        .select("total_visits")
        .eq("id", "global")
        .single();
      if (data) setCount(data.total_visits);
    };
    run();
  }, []);

  if (count === null) return null;

  return (
    <p className="text-[11px] text-primary mt-1">
      Over {count} visits
    </p>
  );
};
