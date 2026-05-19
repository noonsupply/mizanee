"use client";

import { useMemo } from "react";
import type { ProjetEpargne } from "@/data/foyer";
import { epargneMensuelleProjet, moisRestants, totalEpargneMensuelle } from "@/lib/calculs";
import type { ProjetStatut, ProjetUI } from "@/types";

function toProjetUI(p: ProjetEpargne, statut: ProjetStatut = "EN_COURS"): ProjetUI {
  const mensuelle = epargneMensuelleProjet(p);
  const mois = moisRestants(p.dateObjectif);
  const faisable = isFinite(mensuelle) && mois > 0;

  return {
    id: p.id,
    label: p.label,
    montant: p.montantCible,
    dateCible: new Date(p.dateObjectif),
    epargneMensuelle: isFinite(mensuelle) ? mensuelle : 0,
    priorite: 1,
    statut,
    couleur: "#6366f1",
    faisable,
    moisManquants: !faisable && mois > 0 ? mois : undefined,
  };
}

/** Mock local — préférer `useProjets()` pour l’API Express. */
export function useProjetsMock(projets: ProjetEpargne[]) {
  const ui = useMemo(() => projets.map((p) => toProjetUI(p)), [projets]);
  const totalEpargne = useMemo(() => totalEpargneMensuelle(projets), [projets]);

  return {
    projets: ui,
    raw: projets,
    totalEpargneMensuelle: totalEpargne,
    isLoading: false as const,
  };
}
