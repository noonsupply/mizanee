"use client";

import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartData } from "chart.js";
import { formatEur } from "@/lib/calculs";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface DonutChartProps {
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
  cutout?: string;
}

const defaultColors = ["#6366f1", "#f43f5e", "#0ea5e9", "#10b981", "#94a3b8", "#f59e0b"];

export function DonutChart({ labels, values, colors = defaultColors, title, cutout = "65%" }: DonutChartProps) {
  const data: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { size: 12 }, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${formatEur(ctx.parsed)}`,
        },
      },
    },
    cutout,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {title && <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>}
      <div className="mx-auto max-w-xs">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
