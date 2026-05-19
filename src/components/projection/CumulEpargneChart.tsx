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
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { formatEur } from "@/lib/calculs";
import type { PointProjection } from "@/lib/calculs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export interface CumulEpargneChartProps {
  points: PointProjection[];
  title?: string;
}

export function CumulEpargneChart({
  points,
  title = "Épargne cumulée (tous projets, hypothèse constante)",
}: CumulEpargneChartProps) {
  const cumul = points.reduce<number[]>((acc, p, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev + p.epargne);
    return acc;
  }, []);

  const data = {
    labels: points.map((p) => p.mois),
    datasets: [
      {
        label: "Épargne cumulée",
        data: cumul,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.12)",
        borderWidth: 2,
        fill: true,
        tension: 0.25,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, font: { size: 13 }, color: "#334155" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) => ` ${formatEur(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: { callback: (v: string | number) => formatEur(Number(v)) },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: { ticks: { font: { size: 11 } }, grid: { display: false } },
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <Line data={data} options={options} />
    </div>
  );
}
