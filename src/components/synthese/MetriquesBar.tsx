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

function MetricTile({
  id,
  label,
  value,
  sub,
  valueClassName,
}: {
  id: string;
  label: string;
  value: string;
  sub: string;
  valueClassName?: string;
}) {
  return (
    <section className="mz-card flex flex-col p-5" aria-labelledby={id}>
      <h2 id={id} className="mz-metric-label">
        {label}
      </h2>
      <p className={cn("mz-metric-value mt-2", valueClassName)}>{value}</p>
      <p className="mt-1.5 text-xs text-[var(--mz-ink-muted)]">{sub}</p>
    </section>
  );
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
      ? { label: `En avance +${formatEur(data.ecartEpargne)}`, className: "badge-success" }
      : data.statutEpargne === "retard"
        ? { label: `Retard ${formatEur(Math.abs(data.ecartEpargne))}`, className: "badge-danger" }
        : { label: "À jour", className: "badge-info" };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        id="m-rev"
        label="Revenus"
        value={formatEur(data.revenus)}
        sub={data.libelleSecondaireRevenus}
        valueClassName="mz-metric-positive"
      />
      <MetricTile
        id="m-ch"
        label="Charges"
        value={formatEur(data.charges)}
        sub={data.libelleSecondaireCharges}
        valueClassName={data.chargesTonSurcote ? "text-[#B45309]" : undefined}
      />
      <MetricTile
        id="m-rav"
        label="Reste à vivre"
        value={formatEur(data.resteAVivre)}
        sub={`${data.pourcentageRavSurRevenus}% des revenus`}
      />
      <section className="mz-card mz-card-accent flex flex-col p-5" aria-labelledby="m-ep">
        <SoldeEpargneWidget
          ref={soldeEpargneWidgetRef}
          montant={soldeEpargneMontant}
          updatedAt={soldeEpargneUpdatedAt}
          onUpdate={onUpdateSoldeEpargne}
          needsSetup={soldeEpargneNeedsSetup}
          embedded
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E0E8E4] pt-3">
          <p className="text-xs text-[var(--mz-ink-muted)]">
            Attendu : <span className="font-semibold text-[var(--mz-ink-soft)]">{formatEur(data.soldeEpargneAttendu)}</span>
          </p>
          <span
            role="status"
            className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeEpargne.className)}
          >
            {badgeEpargne.label}
          </span>
        </div>
      </section>
    </div>
  );
}
