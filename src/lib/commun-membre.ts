/** Identifiant UI de l’option statique « Commun » (jamais renvoyée par l’API membres). */
export const COMMUN_MEMBRE_ID = "commun" as const;

/** Option statique « Commun » — jamais renvoyée par l’API membres. */
export const COMMUN_MEMBRE = {
  id: COMMUN_MEMBRE_ID,
  label: "Commun",
  couleur: "#EF9F27",
  emoji: "🏠",
} as const;

export type MembreSelectionId = string;

/** @deprecated Utiliser `COMMUN_MEMBRE` */
export const revenuCommunOption = COMMUN_MEMBRE;

export function isCommunMembreId(membreId: string | null | undefined): boolean {
  return membreId == null || membreId === COMMUN_MEMBRE_ID;
}

/** Valeur pour les formulaires / MembreSelector (`'commun'` au lieu de `null`). */
export function toFormMembreId(membreId: string | null | undefined, fallback?: string): string {
  if (isCommunMembreId(membreId)) return COMMUN_MEMBRE_ID;
  return membreId ?? fallback ?? COMMUN_MEMBRE_ID;
}

/** Valeur pour POST/PATCH API (`null` quand commun). */
export function toApiMembreId(membreId: string | null | undefined): string | null {
  if (isCommunMembreId(membreId)) return null;
  return membreId ?? null;
}

/** Normalise la réponse API vers l’état domaine (`null` = commun). */
export function normalizeMembreIdFromApi(membreId: string | null | undefined): string | null {
  return toApiMembreId(membreId);
}

export function labelPourMembre(
  membreId: string | null,
  membres: { id: string; prenom: string }[],
): string {
  if (isCommunMembreId(membreId)) return COMMUN_MEMBRE.label;
  return membres.find((m) => m.id === membreId)?.prenom ?? "—";
}

export function couleurPourMembre(
  membreId: string | null,
  membres: { id: string; couleur: string }[],
): string {
  if (isCommunMembreId(membreId)) return COMMUN_MEMBRE.couleur;
  return membres.find((m) => m.id === membreId)?.couleur ?? "#64748b";
}
