"use client";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { formatEur } from "@/lib/calculs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface ImpactChartProps {
  labels: string[];
  avant: number[];
  apres: number[];
  title?: string;
}

export function ImpactChart({ labels, avant, apres, title = "Impact sur l'épargne mensuelle requise" }: ImpactChartProps) {
  const data = {
    labels,
    datasets: [
      { label: "Avant", data: avant, backgroundColor: "#94a3b8", borderRadius: 6 },
      { label: "Après", data: apres, backgroundColor: "#6366f1", borderRadius: 6 },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: title, font: { size: 13 } },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            ` ${ctx.dataset.label ?? ""}: ${formatEur(Number(ctx.parsed.y ?? 0))}`,
        },
      },
    },
    scales: {
      y: {
        ticks: { callback: (v: string | number) => formatEur(Number(v)) },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Bar data={data} options={options} />
    </div>
  );
}
