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
import { formatEur } from "@/lib/calculs";
import { MOIS_CLES } from "@/lib/calculs-revenus";
import { couleurSegmentCharge, montantChargePourMois } from "@/lib/calculs-charges";
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
  title?: string;
}

export function ChargesStackedChart({ charges, title = "Impact mensuel des charges (12 mois)" }: ChargesStackedChartProps) {
  const actives = useMemo(() => charges.filter((c) => c.actif), [charges]);

  const data: ChartData<"bar"> = useMemo(() => {
    const labels = moisLabelsCourants();
    const datasets = actives.map((ch) => ({
      label: ch.label,
      data: MOIS_CLES.map((m) => montantChargePourMois(ch, m)),
      backgroundColor: couleurSegmentCharge(ch),
      borderWidth: 0,
      borderRadius: 2,
      stack: "charges",
    }));

    return {
      labels,
      datasets,
    };
  }, [actives]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 10, font: { size: 10 }, padding: 8 },
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
      <div className="h-72 w-full min-h-[18rem] sm:h-80">
        {actives.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-slate-500">
            Ajoutez des charges pour voir le graphique empilé.
          </p>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}
