"use client";

import { formatEur } from "@/lib/calculs";
import type { PointProjection } from "@/lib/calculs";

export interface ProjectionTableProps {
  points: PointProjection[];
  highlightNegativeNet?: boolean;
}

export function ProjectionTable({ points, highlightNegativeNet = true }: ProjectionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="px-4 py-3 text-left font-semibold">Mois</th>
            <th className="px-4 py-3 text-right font-semibold">Entrées</th>
            <th className="px-4 py-3 text-right font-semibold">Charges</th>
            <th className="px-4 py-3 text-right font-semibold">Épargne</th>
            <th className="px-4 py-3 text-right font-semibold">Net</th>
            <th className="px-4 py-3 text-right font-semibold">Solde cumul</th>
          </tr>
        </thead>
        <tbody>
          {points.map((row, i) => (
            <tr
              key={row.mois}
              className={`border-b border-slate-100 ${
                highlightNegativeNet && row.net < 0 ? "bg-rose-50/80" : i % 2 === 0 ? "bg-white" : "bg-slate-50"
              }`}
            >
              <td className="px-4 py-3 font-medium capitalize text-slate-800">{row.mois}</td>
              <td className="px-4 py-3 text-right font-medium text-emerald-700">{formatEur(row.entrees)}</td>
              <td className="px-4 py-3 text-right text-rose-600">{formatEur(row.sorties)}</td>
              <td className="px-4 py-3 text-right text-indigo-600">{formatEur(row.epargne)}</td>
              <td className={`px-4 py-3 text-right font-semibold ${row.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {formatEur(row.net)}
              </td>
              <td
                className={`px-4 py-3 text-right font-bold ${
                  row.soldeCumul >= 0 ? "text-slate-800" : "text-rose-700"
                }`}
              >
                {formatEur(row.soldeCumul)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
