import { formatEur } from "@/lib/calculs";
import type { ChargeUI } from "@/types";
import { Badge } from "@/components/ui/badge";

export interface ChargesListProps {
  title: string;
  subtitle?: string;
  charges: ChargeUI[];
  accent?: "slate" | "rose" | "indigo";
  total?: number;
  totalLabel?: string;
}

const headerColors = {
  slate: "bg-slate-700",
  rose: "bg-rose-600",
  indigo: "bg-indigo-600",
};

export function ChargesList({ title, subtitle, charges, accent = "slate", total, totalLabel }: ChargesListProps) {
  const sum = total ?? charges.filter((c) => c.actif).reduce((s, c) => s + c.montant, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className={`${headerColors[accent]} px-5 py-4`}>
        <h3 className="font-bold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>}
      </div>
      <ul className="divide-y divide-slate-100 px-5 py-1">
        {charges.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-700">{c.label}</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {c.categorie}
                </Badge>
                {!c.actif && <Badge variant="secondary">Inactif</Badge>}
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-800">{formatEur(c.montant)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
        <span className="text-sm font-semibold text-slate-600">{totalLabel ?? "Total"}</span>
        <span className="text-base font-bold text-slate-900">{formatEur(sum)}</span>
      </div>
    </div>
  );
}
