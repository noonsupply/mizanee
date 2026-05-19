import type { Revenu } from "@/types/revenus";

/** Clés de mois normalisées (année de référence projection) */
export const MOIS_CLES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"] as const;

export type MoisCle = (typeof MOIS_CLES)[number];

/**
 * Moyenne mensuelle à partir d’une grille annuelle : somme des montants saisis / 12.
 * Les mois non saisis comptent comme 0.
 */
export function calculerMoyenneMensuelle(montantParMois: Record<string, number>): number {
  const sum = Object.values(montantParMois).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
  return sum / 12;
}

/**
 * Total mensuel du foyer : somme des `montantMensuel` des revenus actifs.
 */
export function calculerTotalFoyer(revenus: Revenu[]): number {
  return revenus.filter((r) => r.actif).reduce((s, r) => s + r.montantMensuel, 0);
}

/**
 * Total mensuel pour un membre donné (`p1`, `p2`, `commun`).
 */
export function calculerTotalParMembre(revenus: Revenu[], membreId: string): number {
  return revenus.filter((r) => r.actif && r.membreId === membreId).reduce((s, r) => s + r.montantMensuel, 0);
}

/**
 * Projection mois par mois (clés `01`–`12`) : total foyer par mois.
 * - **fixe** : même montant chaque mois (sauf si `montantParMois` précise le mois).
 * - **variable** : somme des `montantParMois` par clé.
 * - **ponctuel** : montants uniquement sur les mois renseignés dans `montantParMois`.
 * - **locatif** : `montantMensuel` par mois hors `moisAbsenceLocatif`.
 */
export function projeterRevenusAnnuels(revenus: Revenu[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of MOIS_CLES) {
    out[m] = 0;
  }

  const absenceSet = (mois: string[] | undefined) => new Set(mois ?? []);

  for (const r of revenus) {
    if (!r.actif) continue;

    if (r.type === "variable" && r.montantParMois) {
      for (const [cle, montant] of Object.entries(r.montantParMois)) {
        if (MOIS_CLES.includes(cle as MoisCle)) {
          out[cle] = (out[cle] ?? 0) + montant;
        }
      }
      continue;
    }

    if (r.type === "ponctuel" && r.montantParMois) {
      for (const [cle, montant] of Object.entries(r.montantParMois)) {
        if (MOIS_CLES.includes(cle as MoisCle)) {
          out[cle] = (out[cle] ?? 0) + montant;
        }
      }
      continue;
    }

    if (r.type === "locatif") {
      const skip = absenceSet(r.moisAbsenceLocatif);
      for (const m of MOIS_CLES) {
        if (!skip.has(m)) out[m] += r.montantMensuel;
      }
      continue;
    }

    // fixe (ou fallback)
    if (r.montantParMois) {
      let any = false;
      for (const [cle, montant] of Object.entries(r.montantParMois)) {
        if (MOIS_CLES.includes(cle as MoisCle)) {
          out[cle] = (out[cle] ?? 0) + montant;
          any = true;
        }
      }
      if (any) continue;
    }
    for (const m of MOIS_CLES) {
      out[m] += r.montantMensuel;
    }
  }

  return out;
}

/**
 * Estimation du total annuel pour l’affichage liste (hors projection détaillée).
 */
export function calculerAnnuelEstime(r: Revenu): number {
  if ((r.type === "variable" || r.type === "ponctuel") && r.montantParMois) {
    return Object.values(r.montantParMois).reduce((a, b) => a + b, 0);
  }
  if (r.type === "locatif") {
    const abs = r.moisAbsenceLocatif?.length ?? 0;
    return r.montantMensuel * (12 - abs);
  }
  return r.montantMensuel * 12;
}
