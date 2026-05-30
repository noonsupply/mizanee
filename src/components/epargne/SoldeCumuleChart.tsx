"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { formatEur } from "@/lib/calculs";
import type { PointSolde } from "@/types/projets";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const LINE = "#0F6E56";
const FILL = "rgba(15, 110, 86, 0.14)";
const POINT_NORMAL = "#0F6E56";
const POINT_DEC = "#E24B4A";

export interface SoldeCumuleChartProps {
  points: PointSolde[];
}

export function SoldeCumuleChart({ points }: SoldeCumuleChartProps) {
  const data = useMemo(
    () => ({
      labels: points.map((p) => p.mois),
      datasets: [
        {
          label: "Solde cumulé",
          data: points.map((p) => p.solde),
          borderColor: LINE,
          backgroundColor: FILL,
          borderWidth: 2,
          fill: true,
          tension: 0.32,
          pointBackgroundColor: points.map((p) => (p.decaissement > 0 ? POINT_DEC : POINT_NORMAL)),
          pointBorderColor: points.map((p) => (p.decaissement > 0 ? POINT_DEC : LINE)),
          pointRadius: points.map((p) => (p.decaissement > 0 ? 5 : 2)),
          pointHoverRadius: points.map((p) => (p.decaissement > 0 ? 6 : 3)),
        },
      ],
    }),
    [points],
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: TooltipItem<"line">[]) => {
              const i = items[0]?.dataIndex ?? 0;
              return points[i]?.mois ?? "";
            },
            label: (ctx: TooltipItem<"line">) => {
              const i = ctx.dataIndex;
              const pt = points[i];
              return pt ? formatEur(pt.solde) : "";
            },
            afterBody: (items: TooltipItem<"line">[]) => {
              const i = items[0]?.dataIndex ?? 0;
              const pt = points[i];
              if (!pt || pt.decaissement <= 0) return [];
              const lines = [`Décaissement : ${formatEur(pt.decaissement)}`];
              if (pt.projetsDecaisses.length > 0) {
                lines.push(pt.projetsDecaisses.join(", "));
              }
              return lines;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (v: string | number) => formatEur(Number(v)),
          },
          grid: { color: "rgba(15,23,42,0.06)" },
        },
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 8,
            maxRotation: 45,
            minRotation: 0,
            font: { size: 10 },
          },
          grid: { display: false },
        },
      },
    }),
    [points],
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Solde cumulé (projection)</h2>
      <p className="mb-3 text-xs text-slate-500">Points rouges = mois de décaissement projet.</p>
      <div className="h-[200px] w-full">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-sm" style={{ backgroundColor: LINE }} />
          Solde cumulé
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border-2"
            style={{ borderColor: POINT_DEC, backgroundColor: POINT_DEC }}
          />
          Mois de décaissement
        </span>
      </div>
    </div>
  );
}
