"use client";

import { useCallback, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { AllocationBanner } from "@/components/epargne/AllocationBanner";
import { Echeancier } from "@/components/epargne/Echeancier";
import { EpargneMetrics } from "@/components/epargne/EpargneMetrics";
import { ProjetTable } from "@/components/epargne/ProjetTable";
import { ProjetTimeline } from "@/components/epargne/ProjetTimeline";
import { SoldeCumuleChart } from "@/components/epargne/SoldeCumuleChart";
import { Button } from "@/components/ui/button";
import { useFoyer } from "@/hooks/useFoyer";
import { useProjets } from "@/hooks/useProjets";
import { formatEur, resteAVivre } from "@/lib/calculs";
import { allouerSolde, enrichirProjet, projeterSolde } from "@/lib/calculs-projets";
import { EPARGNE_MENSUELLE } from "@/lib/epargne-constants";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { Projet } from "@/types/projets";
import styles from "./page.module.css";

export default function EpargnePage() {
  const {
    foyer,
    isLoading: foyerLoading,
    error: foyerError,
    refresh: refreshFoyer,
    applySoldeEpargne,
  } = useFoyer();
  const {
    projets,
    isLoading: projetsLoading,
    error: projetsError,
    refresh: refreshProjets,
    addProjet,
    updateProjet,
    removeProjet,
    terminerProjet,
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

  const projetsEnCours = useMemo(
    () => projetsCalcules.filter((p) => p.statut === "en_cours"),
    [projetsCalcules],
  );

  const projetsAlloues = useMemo(
    () => allouerSolde(projetsEnCours, soldeReel),
    [projetsEnCours, soldeReel],
  );

  const projetsTermines = useMemo(
    () => projetsCalcules.filter((p) => p.statut === "atteint"),
    [projetsCalcules],
  );

  const stats = useMemo(
    () => ({
      projetsFinances: projetsAlloues.filter((p) => p.statutAllocation === "finance").length,
      projetUrgent: projetsAlloues.find((p) => p.urgence === "urgent"),
      totalObjectifs: projetsEffectifs.reduce((s, p) => s + p.montant, 0),
      epargneTotaleRequise: projetsAlloues.reduce((s, p) => s + p.epargneMensuelleRequise, 0),
    }),
    [projetsAlloues, projetsEffectifs],
  );

  const resteAVivreMensuel = useMemo(() => resteAVivre(0), []);

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

  const onTerminer = useCallback(
    async (id: string) => {
      const nouveauSolde = await terminerProjet(id);
      if (typeof nouveauSolde === "number") {
        applySoldeEpargne(nouveauSolde);
      }
    },
    [terminerProjet, applySoldeEpargne],
  );

  const onUpdateProjet = useCallback(
    (id: string, patch: Partial<Projet> & { date?: string }) => {
      if (patch.date !== undefined) {
        setDateOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
      void updateProjet(id, patch);
    },
    [updateProjet],
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
        onTerminer={onTerminer}
        onUpdate={onUpdateProjet}
      />

      <div className={styles.bottomGrid}>
        <ProjetTimeline projets={projetsAlloues} />
        <SoldeCumuleChart points={pointsSolde} />
      </div>

      <Echeancier
        projets={projetsAlloues}
        soldeInitial={soldeReel}
        resteAVivre={resteAVivreMensuel}
        epargneMensuelleRecommandee={stats.epargneTotaleRequise}
      />

      {projetsTermines.length > 0 ? (
        <details className={styles.termines}>
          <summary className={styles.terminesSummary}>
            {projetsTermines.length} projet{projetsTermines.length > 1 ? "s" : ""} terminé
            {projetsTermines.length > 1 ? "s" : ""}
          </summary>
          <div className={styles.terminesList}>
            {projetsTermines.map((p) => (
              <div key={p.id} className={styles.termineRow}>
                <span className={styles.termineLabel}>
                  <Check className={styles.termineCheck} aria-hidden />
                  {p.label}
                </span>
                <span className={styles.termineMontant}>
                  {formatEur(p.montant)}
                  {p.dateDepense ? ` · ${p.dateDepense}` : ""}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
