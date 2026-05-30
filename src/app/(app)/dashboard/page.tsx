"use client";

import { useRef, type RefObject } from "react";
import { useDate } from "@/hooks/useDate";
import { useSynthese } from "@/hooks/useSynthese";
import { foyerNeedsSoldeEpargne } from "@/hooks/useFoyer";
import { useMembres } from "@/hooks/useMembres";
import { AlerteBanner } from "@/components/synthese/AlerteBanner";
import { MetriquesBar } from "@/components/synthese/MetriquesBar";
import { RepartitionDonut } from "@/components/synthese/RepartitionDonut";
import { ContributionMembres } from "@/components/synthese/ContributionMembres";
import { EcheancesWidget } from "@/components/synthese/EcheancesWidget";
import { ProjectionChart } from "@/components/synthese/ProjectionChart";
import type { SoldeEpargneWidgetHandle } from "@/components/synthese/SoldeEpargneWidget";
import { Button } from "@/components/ui/button";

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function scrollToSoldeEpargneAndEdit(ref: RefObject<SoldeEpargneWidgetHandle | null>) {
  document.getElementById("solde-epargne-widget")?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => ref.current?.openEdit(), 400);
}

export default function DashboardPage() {
  const soldeEpargneRef = useRef<SoldeEpargneWidgetHandle>(null);
  const {
    synthese,
    foyer,
    soldeEpargneUpdatedAt,
    updateSoldeEpargne,
    applySoldeEpargne,
    terminerProjet,
    isLoading,
    error,
    refresh,
  } = useSynthese();
  const { membres } = useMembres();

  const onTerminerProjet = async (id: string) => {
    const nouveauSolde = await terminerProjet(id);
    if (typeof nouveauSolde === "number") {
      applySoldeEpargne(nouveauSolde);
    }
  };

  const { dateLabel } = useDate();

  const actifs = membres.filter((m) => m.actif);
  const prenom = actifs[0]?.prenom ?? "toi";
  const needsSoldeSetup = foyerNeedsSoldeEpargne(foyer);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !synthese) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-rose-600">{error?.message ?? "Impossible de charger la synthèse"}</p>
        <Button type="button" variant="outline" onClick={() => refresh()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bonjour {prenom}</h1>
          <p className="mt-1 capitalize text-slate-500">{dateLabel}</p>
        </div>
        <div className="flex -space-x-2" aria-label="Membres du foyer">
          {actifs.map((m) => (
            <div
              key={m.id}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: m.couleur }}
              title={m.prenom}
            >
              {m.prenom.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
      </header>

      <AlerteBanner alerte={synthese.alerteMois} />

      {needsSoldeSetup && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          💡 Renseignez votre solde épargne pour activer la projection complète —{" "}
          <button
            type="button"
            onClick={() => scrollToSoldeEpargneAndEdit(soldeEpargneRef)}
            className="font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-800"
          >
            Mettre à jour
          </button>
        </div>
      )}

      <MetriquesBar
        data={synthese}
        soldeEpargneMontant={foyer.soldeEpargne.montant}
        soldeEpargneUpdatedAt={soldeEpargneUpdatedAt}
        soldeEpargneNeedsSetup={needsSoldeSetup}
        onUpdateSoldeEpargne={updateSoldeEpargne}
        soldeEpargneWidgetRef={soldeEpargneRef}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RepartitionDonut repartition={synthese.repartitionBudget} />
        <ContributionMembres
          membres={synthese.membres}
          commun={synthese.commun}
          totalChargesCommunes={synthese.totalChargesCommunes}
        />
      </div>

      <EcheancesWidget echeances={synthese.echeances} onTerminerProjet={onTerminerProjet} />
      <ProjectionChart projection={synthese.projection} />
    </div>
  );
}
