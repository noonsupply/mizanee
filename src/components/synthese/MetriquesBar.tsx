"use client";

import type { RefObject } from "react";
import { SoldeEpargneWidget, type SoldeEpargneWidgetHandle } from "@/components/synthese/SoldeEpargneWidget";
import { formatEur } from "@/lib/calculs";
import type { SyntheseData } from "@/types/synthese";
import { cn } from "@/components/ui/utils";

export interface MetriquesBarProps {
  data: SyntheseData;
  soldeEpargneMontant: number;
  soldeEpargneUpdatedAt: Date | null;
  soldeEpargneNeedsSetup: boolean;
  onUpdateSoldeEpargne: (montant: number) => Promise<void>;
  soldeEpargneWidgetRef?: RefObject<SoldeEpargneWidgetHandle | null>;
}

export function MetriquesBar({
  data,
  soldeEpargneMontant,
  soldeEpargneUpdatedAt,
  soldeEpargneNeedsSetup,
  onUpdateSoldeEpargne,
  soldeEpargneWidgetRef,
}: MetriquesBarProps) {
  const badgeEpargne =
    data.statutEpargne === "avance"
      ? { label: `En avance +${formatEur(data.ecartEpargne)}`, className: "bg-emerald-100 text-emerald-900 border-emerald-200" }
      : data.statutEpargne === "retard"
        ? { label: `Retard ${formatEur(Math.abs(data.ecartEpargne))}`, className: "bg-rose-100 text-rose-900 border-rose-200" }
        : { label: "À jour", className: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="m-rev">
        <h2 id="m-rev" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Revenus
        </h2>
        <p className="mt-2 text-2xl font-bold text-emerald-700">{formatEur(data.revenus)}</p>
        <p className="mt-1 text-xs text-slate-500">{data.libelleSecondaireRevenus}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="m-ch">
        <h2 id="m-ch" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Charges
        </h2>
        <p
          className={cn(
            "mt-2 text-2xl font-bold",
            data.chargesTonSurcote ? "text-amber-700" : "text-slate-900",
          )}
        >
          {formatEur(data.charges)}
        </p>
        <p className="mt-1 text-xs text-slate-500">{data.libelleSecondaireCharges}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="m-rav">
        <h2 id="m-rav" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reste à vivre
        </h2>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatEur(data.resteAVivre)}</p>
        <p className="mt-1 text-xs text-slate-500">{data.pourcentageRavSurRevenus}% des revenus</p>
      </section>

      <div className="met">
        <SoldeEpargneWidget
          ref={soldeEpargneWidgetRef}
          montant={soldeEpargneMontant}
          updatedAt={soldeEpargneUpdatedAt}
          onUpdate={onUpdateSoldeEpargne}
          needsSetup={soldeEpargneNeedsSetup}
        />
        <p className="mt-2 text-center text-xs text-slate-500">
          Attendu : <span className="font-semibold text-slate-700">{formatEur(data.soldeEpargneAttendu)}</span>
        </p>
        <p className="mt-2 flex justify-center">
          <span
            role="status"
            className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", badgeEpargne.className)}
          >
            {badgeEpargne.label}
          </span>
        </p>
      </div>
    </div>
  );
}
