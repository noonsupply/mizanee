"use client";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface ChargesBarChartProps {
  labels: string[];
  values: number[];
  title?: string;
  horizontal?: boolean;
}

export function ChargesBarChart({ labels, values, title, horizontal }: ChargesBarChartProps) {
  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Charges (€)",
        data: values,
        backgroundColor: ["#6366f1", "#f43f5e", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const v = horizontal ? ctx.parsed.x : ctx.parsed.y;
            return ` ${formatEur(Number(v ?? 0))}`;
          },
        },
      },
    },
    scales: horizontal
      ? {
          x: {
            ticks: { callback: (v: string | number) => formatEur(Number(v)) },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          y: { grid: { display: false } },
        }
      : {
          y: {
            ticks: { callback: (v: string | number) => formatEur(Number(v)) },
            grid: { color: "rgba(0,0,0,0.05)" },
          },
          x: { grid: { display: false } },
        },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {title && <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>}
      <Bar data={data} options={options} />
    </div>
  );
}
