"use client";

import { useMemo } from "react";
import { AUJOURD_HUI } from "@/lib/calculs";
import { buildMembreSlotMap, mapChargeApiToFoyer } from "@/lib/api-mappers";
import { construireDonneesSynthese } from "@/lib/calculs-synthese";
import { useCharges } from "@/hooks/useCharges";
import { EMPTY_FOYER } from "@/lib/foyer-mapper";
import { useFoyer } from "@/hooks/useFoyer";
import { useMembres } from "@/hooks/useMembres";
import { useProjets } from "@/hooks/useProjets";
import { useRevenus } from "@/hooks/useRevenus";
import type { SyntheseData } from "@/types/synthese";

export interface UseSyntheseOptions {
  epargneMensuelle?: number;
  dateDebutEpargneAttendu?: Date;
  dateRef?: Date;
}

const DEFAULTS = {
  epargneMensuelle: 0,
  dateDebutEpargneAttendu: new Date(2026, 0, 1),
  dateRef: AUJOURD_HUI,
} as const;

export function useSynthese(options: UseSyntheseOptions = {}) {
  const {
    foyer,
    isLoading: loadingFoyer,
    error: errorFoyer,
    refresh: refreshFoyer,
    updateSoldeEpargne,
  } = useFoyer();
  const { revenus, isLoading: loadingRevenus, error: errorRevenus, refresh: refreshRevenus } = useRevenus();
  const { charges: chargesRaw, isLoading: loadingCharges, error: errorCharges, refresh: refreshCharges } =
    useCharges();
  const { projets: projetsUi, isLoading: loadingProjets, error: errorProjets, refresh: refreshProjets } =
    useProjets();
  const { membres, isLoading: loadingMembres, error: errorMembres, refresh: refreshMembres } = useMembres();

  const epargneMensuelle = options.epargneMensuelle ?? DEFAULTS.epargneMensuelle;
  const dateDebutEpargneAttendu = options.dateDebutEpargneAttendu ?? DEFAULTS.dateDebutEpargneAttendu;
  const dateRef = options.dateRef ?? DEFAULTS.dateRef;

  const foyerSafe = foyer ?? EMPTY_FOYER;
  const soldeEpargne = foyerSafe.soldeEpargne ?? EMPTY_FOYER.soldeEpargne;
  const soldeEpargneReel = soldeEpargne.montant;
  const soldeEpargneUpdatedAt = soldeEpargne.updatedAt ? new Date(soldeEpargne.updatedAt) : null;

  const synthese: SyntheseData | null = useMemo(() => {
    if (loadingRevenus || loadingCharges || loadingProjets || loadingMembres || loadingFoyer) {
      return null;
    }
    const slotMap = buildMembreSlotMap(membres);
    const charges = chargesRaw.map((c) => mapChargeApiToFoyer(c, slotMap));
    const projets = projetsUi;
    const membresSynth = membres
      .filter((m) => m.actif)
      .slice(0, 2)
      .map((m, i) => ({
        id: (slotMap.get(m.id) ?? (i === 0 ? "p1" : "p2")) as "p1" | "p2",
        prenom: m.prenom,
        color: m.couleur,
      }));

    if (membresSynth.length === 0) {
      return null;
    }

    return construireDonneesSynthese({
      dateRef,
      revenus,
      charges,
      projets,
      membres: membresSynth,
      soldeEpargneReel,
      epargneMensuelle,
      dateDebutEpargneAttendu,
    });
  }, [
    loadingRevenus,
    loadingCharges,
    loadingProjets,
    loadingMembres,
    loadingFoyer,
    revenus,
    chargesRaw,
    projetsUi,
    membres,
    soldeEpargneReel,
    epargneMensuelle,
    dateDebutEpargneAttendu,
    dateRef,
  ]);

  const isLoading = loadingRevenus || loadingCharges || loadingProjets || loadingMembres || loadingFoyer;
  const error = errorRevenus ?? errorCharges ?? errorProjets ?? errorMembres ?? errorFoyer;

  const refresh = () => {
    void refreshFoyer();
    void refreshRevenus();
    void refreshCharges();
    void refreshProjets();
    void refreshMembres();
  };

  return {
    synthese,
    foyer: foyerSafe,
    soldeEpargneUpdatedAt,
    updateSoldeEpargne,
    isLoading,
    error,
    refresh,
  };
}
