"use client";

import { useMemo } from "react";
import type { ProjetEpargne } from "@/data/foyer";
import { simulationSolde, totalRevenus, totalChargesMensuelles, totalEpargneMensuelle } from "@/lib/calculs";
import type { ProjectionMois } from "@/types";

export function useProjection(projets: ProjetEpargne[]) {
  const points = useMemo(() => simulationSolde(projets), [projets]);

  const mois: ProjectionMois[] = useMemo(() => {
    const rev = totalRevenus();
    const charges = totalChargesMensuelles();
    const ep = totalEpargneMensuelle(projets);
    return points.map((row) => ({
      mois: row.mois,
      revenus: rev,
      chargesCommunes: charges - 0,
      chargesPerso: {},
      epargne: ep,
      soldeNet: row.net,
      soldeCumule: row.soldeCumul,
    }));
  }, [points, projets]);

  return {
    points,
    mois,
    isLoading: false as const,
  };
}
