type Props = { label: string; value: number | string };

export const StatBox = ({ label, value }: Props) => (
  <div className="bg-card rounded-xl border border-border/40 shadow-sm p-4 flex flex-col gap-1">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    <span className="text-2xl font-bold text-foreground">{value}</span>
  </div>
);
