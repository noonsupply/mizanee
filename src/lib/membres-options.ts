import type { MembreRevenu } from "@/data/membres";
import type { Membre } from "@/types/api";

/** Membres actifs pour les sélecteurs revenus / charges. */
export function membresToSelectorOptions(membres: Membre[]): MembreRevenu[] {
  return membres
    .filter((m) => m.actif)
    .map((m) => ({
      id: m.id,
      prenom: m.prenom,
      couleur: m.couleur,
    }));
}
