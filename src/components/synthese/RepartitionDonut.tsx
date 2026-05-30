"use client";

import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Tooltip, type ChartData } from "chart.js";
import { formatEur } from "@/lib/calculs";

ChartJS.register(ArcElement, Tooltip);

export interface RepartitionDonutProps {
  repartition: { label: string; montant: number; color: string }[];
}

export function RepartitionDonut({ repartition }: RepartitionDonutProps) {
  const total = useMemo(() => repartition.reduce((s, r) => s + r.montant, 0), [repartition]);

  const data: ChartData<"doughnut"> = useMemo(
    () => ({
      labels: repartition.map((r) => r.label),
      datasets: [
        {
          data: repartition.map((r) => r.montant),
          backgroundColor: repartition.map((r) => r.color),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }),
    [repartition],
  );

  const options = useMemo(
    () => ({
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { label?: string; parsed: number }) =>
              ` ${ctx.label ?? ""}: ${formatEur(typeof ctx.parsed === "number" ? ctx.parsed : 0)}`,
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="mz-card p-5">
      <h2 className="text-sm font-semibold text-[var(--mz-ink)]">Répartition du budget</h2>
      <p className="mt-0.5 text-xs text-[var(--mz-ink-muted)]">Répartition indicative du mois</p>
      <div className="mt-4 flex flex-col items-stretch gap-6 lg:flex-row lg:items-center">
        <div className="mx-auto w-full max-w-[220px] shrink-0" role="img" aria-label="Graphique en anneau : répartition du budget par poste">
          <Doughnut data={data} options={options} />
        </div>
        <ul className="min-w-0 flex-1 space-y-2 text-sm" aria-label="Légende répartition budget">
          {repartition.map((r) => {
            const pct = total > 0 ? Math.round((r.montant / total) * 100) : 0;
            return (
              <li key={r.label} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: r.color }} aria-hidden />
                  <span className="truncate font-medium text-[var(--mz-ink-soft)]">{r.label}</span>
                </span>
                <span className="shrink-0 text-right text-[var(--mz-ink-muted)]">
                  <span className="font-semibold text-[var(--mz-ink)]">{formatEur(r.montant)}</span>
                  <span className="ml-2 text-xs">({pct}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
