import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const TotalVisitsCard = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_stats")
        .select("total_visits")
        .eq("id", "global")
        .single();
      if (data) setCount(Number(data.total_visits));
    })();
  }, []);

  const padded = String(count).padStart(5, "0");
  const digits = padded.split("");

  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm p-5 flex items-center justify-between">
      <h3 className="text-base font-semibold text-foreground">Visite Totali</h3>
      <div className="flex gap-1.5">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-9 h-11 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-lg shadow-sm"
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};
