export type { MembreSelectionId } from "@/lib/commun-membre";
export { COMMUN_MEMBRE, COMMUN_MEMBRE_ID, revenuCommunOption } from "@/lib/commun-membre";

export type MembreRevenuId = string;

export interface MembreRevenu {
  id: MembreRevenuId;
  prenom: string;
  couleur: string;
}

/** Données de démo — préférer `membresToSelectorOptions(useMembres())` en prod. */
export const membresRevenu: MembreRevenu[] = [
  { id: "p1", prenom: "Sophia", couleur: "#378ADD" },
  { id: "p2", prenom: "Karim", couleur: "#1D9E75" },
];
