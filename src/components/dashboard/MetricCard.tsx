import { cn } from "@/components/ui/utils";

export type MetricTone = "indigo" | "rose" | "emerald" | "amber" | "slate";

const tones: Record<MetricTone, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: MetricTone;
  className?: string;
}

export function MetricCard({ label, value, sub, tone = "slate", className }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border p-5", tones[tone], className)}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}
