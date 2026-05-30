"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type TooltipItem,
} from "chart.js";
import type { MembreRevenu } from "@/data/membres";
import { formatEur } from "@/lib/calculs";
import { MOIS_CLES } from "@/lib/calculs-revenus";
import { montantChargePourMois } from "@/lib/calculs-charges";
import { COMMUN_MEMBRE, isCommunMembreId } from "@/lib/commun-membre";
import type { ChargeFoyer } from "@/types/charges";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function moisLabelsCourants(): string[] {
  const year = new Date().getFullYear();
  return MOIS_CLES.map((k) => {
    const d = new Date(year, Number(k) - 1, 1);
    return d.toLocaleDateString("fr-FR", { month: "short" });
  });
}

export interface ChargesStackedChartProps {
  charges: ChargeFoyer[];
  membres: MembreRevenu[];
  title?: string;
}

export function ChargesStackedChart({
  charges,
  membres,
  title = "Impact mensuel des charges (12 mois)",
}: ChargesStackedChartProps) {
  const actives = useMemo(() => charges.filter((c) => c.actif), [charges]);

  const segments = useMemo(
    () => [
      { key: COMMUN_MEMBRE.id, label: COMMUN_MEMBRE.label, couleur: COMMUN_MEMBRE.couleur, commun: true },
      ...membres.map((m) => ({ key: m.id, label: m.prenom, couleur: m.couleur, commun: false })),
    ],
    [membres],
  );

  const data: ChartData<"bar"> = useMemo(() => {
    const labels = moisLabelsCourants();
    const datasets = segments.map((seg) => {
      const chargesSeg = actives.filter((c) =>
        seg.commun ? isCommunMembreId(c.membreId) : c.membreId === seg.key,
      );
      return {
        label: seg.label,
        data: MOIS_CLES.map((m) => chargesSeg.reduce((acc, c) => acc + montantChargePourMois(c, m), 0)),
        backgroundColor: seg.couleur,
        borderWidth: 0,
        borderRadius: 2,
        stack: "charges",
      };
    });

    return {
      labels,
      datasets,
    };
  }, [actives, segments]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: { size: 14, weight: "bold" as const },
        color: "#334155",
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const v = ctx.parsed.y;
            return ` ${ctx.dataset.label ?? ""}: ${formatEur(Number(v ?? 0))}`;
          },
          footer: (items: TooltipItem<"bar">[]) => {
            const sum = items.reduce((s, i) => s + Number(i.parsed.y ?? 0), 0);
            return `Total: ${formatEur(sum)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: {
          callback: (v: string | number) => formatEur(Number(v)),
          font: { size: 10 },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-50 w-full sm:h-70">
        {actives.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-slate-500">
            Ajoutez des charges pour voir le graphique empilé.
          </p>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
      {actives.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {segments.map((seg) => (
            <span key={seg.key} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: seg.couleur }}
                aria-hidden
              />
              <span className="text-slate-500">{seg.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
