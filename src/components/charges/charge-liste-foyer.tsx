"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { MembreRevenu } from "@/data/membres";
import { couleurPourMembre, labelPourMembre } from "@/lib/commun-membre";
import { calculerTotalAnnuelCharge, calculerTotalFoyerChargesMensuel, libelleTypeCharge } from "@/lib/calculs-charges";
import { formatEur } from "@/lib/calculs";
import type { ChargeFoyer } from "@/types/charges";

export interface ChargeListeFoyerProps {
  charges: ChargeFoyer[];
  membres: MembreRevenu[];
  onRemove: (id: string) => void;
  onEdit?: (charge: ChargeFoyer) => void;
  isMutating?: boolean;
}

export function ChargeListeFoyer({ charges, membres, onRemove, onEdit, isMutating }: ChargeListeFoyerProps) {
  const actives = charges.filter((c) => c.actif);
  const total = calculerTotalFoyerChargesMensuel(actives);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Toutes les charges</h2>
        <p className="text-xs text-slate-500">Nature, moyenne mensuelle et total annuel estimé</p>
      </div>

      <div className="max-h-[min(50vh,22rem)] overflow-y-auto px-4">
        {actives.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Aucune charge enregistrée.</p>
        ) : (
          <ul>
            {actives.map((c) => {
              const annuel = calculerTotalAnnuelCharge(c);
              const couleur = couleurPourMembre(c.membreId, membres);
              return (
                <li
                  key={c.id}
                  className="group flex items-start gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: couleur }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{c.label}</p>
                    <p className="text-xs text-slate-500">
                      {libelleTypeCharge(c.type)} · {labelPourMembre(c.membreId, membres)}
                      {c.verseLe ? ` · Versé le ${c.verseLe}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatEur(c.montantMensuel)}</p>
                    <p className="text-xs text-slate-500">moy. / mois</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-600">{formatEur(annuel)} / an</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        disabled={isMutating}
                        className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label={`Modifier ${c.label}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(c.id)}
                      disabled={isMutating}
                      className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Supprimer ${c.label}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Total foyer (mensuel)</span>
          <span className="text-lg font-bold text-rose-700">{formatEur(total)}</span>
        </div>
      </div>
    </div>
  );
}
