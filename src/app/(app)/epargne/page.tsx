"use client";

import { useCallback, useMemo, useState } from "react";
import { EpargneMetrics } from "@/components/epargne/EpargneMetrics";
import { ProjetTable } from "@/components/epargne/ProjetTable";
import { ProjetTimeline } from "@/components/epargne/ProjetTimeline";
import { SoldeCumuleChart } from "@/components/epargne/SoldeCumuleChart";
import { Button } from "@/components/ui/button";
import { useFoyer } from "@/hooks/useFoyer";
import { useProjets } from "@/hooks/useProjets";
import { resteAVivre } from "@/lib/calculs";
import { calculerEcartEpargne, calculerSoldeAttendu } from "@/lib/calculs-synthese";
import { enrichirProjet, projeterSolde } from "@/lib/calculs-projets";
import { DATE_DEBUT_EPARGNE_ATTENDU, EPARGNE_MENSUELLE } from "@/lib/epargne-constants";
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

  const projetsCalcules = useMemo(
    () => projetsEffectifs.map((p) => enrichirProjet(p, resteDisponible)),
    [projetsEffectifs, resteDisponible],
  );

  const soldeReel = foyer.soldeEpargne.montant;

  const soldeAttendu = useMemo(
    () => calculerSoldeAttendu(projetsEffectifs, DATE_DEBUT_EPARGNE_ATTENDU),
    [projetsEffectifs],
  );

  const { ecart: ecartEpargne, statut: statutEpargne } = useMemo(
    () => calculerEcartEpargne(soldeReel, soldeAttendu),
    [soldeReel, soldeAttendu],
  );

  const pointsSolde = useMemo(
    () => projeterSolde(projetsEffectifs, soldeReel, EPARGNE_MENSUELLE, 24),
    [projetsEffectifs, soldeReel],
  );

  const projetsActifs = useMemo(
    () => projetsEffectifs.filter((p) => p.statut === "en_cours").length,
    [projetsEffectifs],
  );

  const totalObjectifs = useMemo(
    () => projetsEffectifs.filter((p) => p.statut === "en_cours").reduce((s, p) => s + p.montant, 0),
    [projetsEffectifs],
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
        epargneMensuelle={EPARGNE_MENSUELLE}
        projetsActifs={projetsActifs}
        soldeReel={soldeReel}
        soldeAttendu={soldeAttendu}
        ecartEpargne={ecartEpargne}
        statutEpargne={statutEpargne}
        totalObjectifs={totalObjectifs}
      />

      <ProjetTable
        projets={projetsCalcules}
        isLoading={isLoading}
        onDateChange={onDateChange}
        onRemove={onRemove}
        onReorder={onReorder}
        onAdd={onAdd}
      />

      <div className={styles.bottomGrid}>
        <ProjetTimeline projets={projetsCalcules} />
        <SoldeCumuleChart points={pointsSolde} />
      </div>
    </div>
  );
}
