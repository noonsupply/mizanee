"use client";

import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { formatEur } from "@/lib/calculs";
import type { PointProjection } from "@/lib/calculs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export interface SoldeLineChartProps {
  points: PointProjection[];
  title?: string;
}

export function SoldeLineChart({ points, title = "Solde cumulé (12 mois)" }: SoldeLineChartProps) {
  const soldes = points.map((p) => p.soldeCumul);
  const min = Math.min(...soldes);

  const data = {
    labels: points.map((p) => p.mois),
    datasets: [
      {
        label: "Solde cumulé (€)",
        data: soldes,
        borderColor: min < 0 ? "#f43f5e" : "#6366f1",
        backgroundColor: min < 0 ? "rgba(244,63,94,0.1)" : "rgba(99,102,241,0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: min < 0 ? "#f43f5e" : "#6366f1",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, font: { size: 14 }, color: "#334155" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) => ` ${formatEur(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v: number | string) => formatEur(Number(v)),
          font: { size: 11 as const },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Line data={data} options={options} />
    </div>
  );
}
