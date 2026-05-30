"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formatEur } from "@/lib/calculs";
import type { Echeance } from "@/types/synthese";
import { cn } from "@/components/ui/utils";

export interface EcheancesWidgetProps {
  echeances: Echeance[];
  onTerminerProjet?: (projetId: string) => void;
}

function estProjetEligible(e: Echeance): boolean {
  return e.type === "projet" && !!e.projetId && (e.moisRestants ?? Infinity) <= 1;
}

function pointCouleur(e: Echeance): string {
  if (e.statut === "retard") return "bg-rose-500";
  if (e.statut === "serre") return "bg-amber-500";
  if (e.statut === "ok") return "bg-emerald-500";
  return "bg-sky-500";
}

function badgeDelaiClass(teinte: Echeance["teinteDelai"]): string {
  if (teinte === "rouge") return "bg-rose-100 text-rose-900 border-rose-200";
  if (teinte === "ambre") return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-sky-100 text-sky-900 border-sky-200";
}

function badgeStatutLabel(s: Echeance["statut"]): string {
  if (s === "ok") return "faisable";
  if (s === "serre") return "serré";
  if (s === "retard") return "retard";
  return "info";
}

export function EcheancesWidget({ echeances, onTerminerProjet }: EcheancesWidgetProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  return (
    <div className="mz-card p-5">
      <h2 className="text-sm font-semibold text-[var(--mz-ink)]">Échéances à venir</h2>
      <p className="mt-0.5 text-xs text-[var(--mz-ink-muted)]">Abonnements, projets et renouvellements les plus urgents</p>
      <ul className="mt-4 divide-y divide-[#E0E8E4]">
        {echeances.map((e) => (
          <li key={e.id} className="flex gap-3 py-3 first:pt-0">
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", pointCouleur(e))} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900">{e.label}</span>
                <span
                  role="status"
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                >
                  {e.type}
                </span>
              </div>
              {e.detail ? <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", badgeDelaiClass(e.teinteDelai))}
                  role="status"
                  aria-label={`Échéance ${e.delaiLibelle}`}
                >
                  {e.delaiLibelle}
                </span>
                <span
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                  role="status"
                >
                  {badgeStatutLabel(e.statut)}
                </span>
              </div>
              {onTerminerProjet && estProjetEligible(e) ? (
                <div className="mt-2">
                  {confirmId === e.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500">Déduire {formatEur(e.montant)} du solde ?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onTerminerProjet(e.projetId!);
                          setConfirmId(null);
                        }}
                        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(e.id)}
                      aria-label={`Solder le projet ${e.label}`}
                      className="inline-flex items-center gap-1 rounded-md border border-[#639922] bg-[#EAF3DE] px-2.5 py-1 text-xs font-medium text-[#27500A] hover:bg-[#dfeccd]"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> Solder le projet
                    </button>
                  )}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-slate-900">{formatEur(e.montant)}</p>
              <p className="text-xs text-slate-500">{e.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
