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
import type { ProjectionMois } from "@/types/synthese";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const LINE = "#378ADD";
const FILL = "rgba(55, 138, 221, 0.12)";
const POINT_TENDU = "#E24B4A";
const POINT_NORMAL = "#378ADD";

export interface ProjectionChartProps {
  projection: ProjectionMois[];
}

export function ProjectionChart({ projection }: ProjectionChartProps) {
  const data = useMemo(
    () => ({
      labels: projection.map((p) => p.mois),
      datasets: [
        {
          label: "Solde net cumulé",
          data: projection.map((p) => p.soldeCumule),
          borderColor: LINE,
          backgroundColor: FILL,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: projection.map((p) => (p.estTendu ? POINT_TENDU : POINT_NORMAL)),
          pointBorderColor: projection.map((p) => (p.estTendu ? POINT_TENDU : LINE)),
          pointRadius: projection.map((p) => (p.estTendu ? 5 : 2)),
          pointHoverRadius: projection.map((p) => (p.estTendu ? 6 : 3)),
        },
      ],
    }),
    [projection],
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
              return projection[i]?.mois ?? "";
            },
            label: (ctx: TooltipItem<"line">) => {
              const i = ctx.dataIndex;
              const pt = projection[i];
              if (!pt) return "";
              const lines = [`Solde cumulé : ${formatEur(pt.soldeCumule)}`, `Mensuel net : ${formatEur(pt.soldeNet)}`];
              return lines;
            },
            afterBody: (items: TooltipItem<"line">[]) => {
              const i = items[0]?.dataIndex ?? 0;
              const pt = projection[i];
              if (!pt?.estTendu || !pt.raisonTension) return [];
              return [pt.raisonTension];
            },
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: (v: string | number) => formatEur(Number(v)) },
          grid: { color: "rgba(15,23,42,0.06)" },
        },
        x: {
          grid: { display: false },
          ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: 10 } },
        },
      },
    }),
    [projection],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">Projection solde net (12 mois)</h2>
      <p className="mt-0.5 text-xs text-slate-500">Points rouges : mois tendus (net sous 85 % de la moyenne)</p>
      <div className="mt-3 h-[260px] w-full" role="img" aria-label="Courbe de projection du solde net cumulé sur 12 mois">
        <Line data={data} options={options} />
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-6 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-6 rounded-sm" style={{ backgroundColor: LINE }} />
          Solde cumulé
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POINT_TENDU }} />
          Mois tendu
        </span>
      </div>
    </div>
  );
}
