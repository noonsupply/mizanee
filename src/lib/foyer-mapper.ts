import type { Foyer, SoldeEpargneFoyer } from "@/types/foyer";

export const EMPTY_FOYER: Foyer = {
  id: "",
  nom: "",
  emoji: null,
  soldeEpargne: { montant: 0, updatedAt: null },
};

function normalizeSoldeEpargne(raw: unknown): SoldeEpargneFoyer {
  if (!raw || typeof raw !== "object") {
    return { montant: 0, updatedAt: null };
  }
  const s = raw as Record<string, unknown>;
  const montant = typeof s.montant === "number" && !Number.isNaN(s.montant) ? Math.max(0, s.montant) : 0;
  if (s.updatedAt === null || s.updatedAt === undefined) {
    return { montant, updatedAt: null };
  }
  if (typeof s.updatedAt === "string") {
    return { montant, updatedAt: s.updatedAt };
  }
  if (s.updatedAt instanceof Date) {
    return { montant, updatedAt: s.updatedAt.toISOString() };
  }
  return { montant, updatedAt: null };
}

/** Normalise la réponse GET/PATCH foyer (enveloppe `{ foyer }` ou objet foyer direct). */
export function parseFoyerPayload(payload: unknown): Foyer {
  if (!payload || typeof payload !== "object") {
    return EMPTY_FOYER;
  }

  const record = payload as Record<string, unknown>;
  const candidate =
    record.foyer !== undefined && record.foyer !== null
      ? record.foyer
      : "nom" in record || "id" in record || "soldeEpargne" in record
        ? record
        : null;

  if (!candidate || typeof candidate !== "object") {
    return EMPTY_FOYER;
  }

  const f = candidate as Record<string, unknown>;
  return {
    id: String(f.id ?? ""),
    nom: String(f.nom ?? ""),
    emoji: f.emoji === undefined || f.emoji === null ? null : String(f.emoji),
    soldeEpargne: normalizeSoldeEpargne(f.soldeEpargne),
    ...(typeof f.createdAt === "string" ? { createdAt: f.createdAt } : {}),
    ...(typeof f.updatedAt === "string" ? { updatedAt: f.updatedAt } : {}),
  };
}
