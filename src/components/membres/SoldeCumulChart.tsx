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
} from "chart.js";
import type { VirementSoldeHistorique } from "@/types/virements";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export interface MembresSoldeCumulChartProps {
  historique: VirementSoldeHistorique[];
  couleur: string;
}

export function SoldeCumulChart({ historique, couleur }: MembresSoldeCumulChartProps) {
  const last = historique[historique.length - 1]?.soldeCumule ?? 0;
  const lineColor = last >= 0 ? couleur : "rgb(225, 29, 72)";

  const data = useMemo(
    () => ({
      labels: historique.map((h) => {
        const [, m] = h.mois.split("-");
        const mois = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
        return mois[Number(m) - 1] ?? h.mois;
      }),
      datasets: [
        {
          data: historique.map((h) => h.soldeCumule),
          borderColor: lineColor,
          backgroundColor: `${lineColor}22`,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 2,
        },
      ],
    }),
    [historique, lineColor],
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    }),
    [],
  );

  return (
    <div style={{ height: 60 }} role="img" aria-label="Historique du solde cumulé sur 6 mois">
      <Line data={data} options={options} />
    </div>
  );
}
