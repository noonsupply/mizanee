"use client";

import { useCallback, useMemo, useState } from "react";
import { AllocationBanner } from "@/components/epargne/AllocationBanner";
import { EpargneMetrics } from "@/components/epargne/EpargneMetrics";
import { PlanActionCard } from "@/components/epargne/PlanActionCard";
import { ProjetTable } from "@/components/epargne/ProjetTable";
import { ProjetTimeline } from "@/components/epargne/ProjetTimeline";
import { SoldeCumuleChart } from "@/components/epargne/SoldeCumuleChart";
import { Button } from "@/components/ui/button";
import { useFoyer } from "@/hooks/useFoyer";
import { useProjets } from "@/hooks/useProjets";
import { resteAVivre } from "@/lib/calculs";
import { allouerSolde, enrichirProjet, projeterSolde } from "@/lib/calculs-projets";
import { EPARGNE_MENSUELLE } from "@/lib/epargne-constants";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { Projet } from "@/types/projets";
import styles from "./page.module.css";

export default function EpargnePage() {
  const { foyer, isLoading: foyerLoading, error: foyerError, refresh: refreshFoyer } = useFoyer();
  const {
    projets,
    isLoading: projetsLoading,
    error: projetsError,
    refresh: refreshProjets,
    addProjet,
    updateProjet,
    removeProjet,
    reorderProjets,
  } = useProjets();

  const [dateOverrides, setDateOverrides] = useState<Record<string, string>>({});

  const projetsEffectifs = useMemo(
    () =>
      projets.map((p) => {
        const override = dateOverrides[p.id];
        return override ? { ...p, date: override } : p;
      }),
    [projets, dateOverrides],
  );

  const resteDisponible = useMemo(() => resteAVivre(EPARGNE_MENSUELLE), []);

  const soldeReel = foyer?.soldeEpargne?.montant ?? 0;

  const projetsCalcules = useMemo(
    () => projetsEffectifs.map((p) => enrichirProjet(p, resteDisponible)),
    [projetsEffectifs, resteDisponible],
  );

  const projetsAlloues = useMemo(
    () => allouerSolde(projetsCalcules, soldeReel),
    [projetsCalcules, soldeReel],
  );

  const stats = useMemo(
    () => ({
      projetsFinances: projetsAlloues.filter((p) => p.statutAllocation === "finance").length,
      projetUrgent: projetsAlloues.find((p) => p.urgence === "urgent"),
      totalObjectifs: projetsEffectifs.reduce((s, p) => s + p.montant, 0),
    }),
    [projetsAlloues, projetsEffectifs],
  );

  const pointsSolde = useMemo(
    () => projeterSolde(projetsEffectifs, soldeReel, EPARGNE_MENSUELLE, 24),
    [projetsEffectifs, soldeReel],
  );

  const debouncedDatePatch = useDebouncedCallback((id: string, dateYm: string) => {
    void updateProjet(id, { date: dateYm });
  }, 500);

  const onDateChange = useCallback(
    (id: string, dateYm: string) => {
      setDateOverrides((prev) => ({ ...prev, [id]: dateYm }));
      debouncedDatePatch(id, dateYm);
    },
    [debouncedDatePatch],
  );

  const onReorder = useCallback(
    (next: Projet[]) => {
      void reorderProjets(next);
    },
    [reorderProjets],
  );

  const onRemove = useCallback(
    (id: string) => {
      void removeProjet(id);
    },
    [removeProjet],
  );

  const onAdd = useCallback(
    (projet: Projet) => {
      return addProjet(projet);
    },
    [addProjet],
  );

  const isLoading = projetsLoading || foyerLoading;
  const error = projetsError ?? foyerError;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-rose-600">{error.message}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void refreshProjets();
            void refreshFoyer();
          }}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <EpargneMetrics
        soldeDisponible={soldeReel}
        projetsFinances={stats.projetsFinances}
        totalProjets={projetsAlloues.length}
        projetUrgent={stats.projetUrgent}
        totalObjectifs={stats.totalObjectifs}
      />

      {soldeReel > 0 ? (
        <AllocationBanner projetsAlloues={projetsAlloues} soldeDisponible={soldeReel} />
      ) : (
        <div className={styles.alertBanner}>
          Renseignez votre solde épargne depuis la{" "}
          <a href="/dashboard" className={styles.alertLink}>
            synthèse
          </a>{" "}
          pour activer l&apos;allocation intelligente.
        </div>
      )}

      <ProjetTable
        projets={projetsAlloues}
        isLoading={isLoading}
        onDateChange={onDateChange}
        onRemove={onRemove}
        onReorder={onReorder}
        onAdd={onAdd}
      />

      <div className={styles.bottomGrid}>
        <ProjetTimeline projets={projetsAlloues} />
        <SoldeCumuleChart points={pointsSolde} />
      </div>

      <PlanActionCard projetsAlloues={projetsAlloues} />
    </div>
  );
}
