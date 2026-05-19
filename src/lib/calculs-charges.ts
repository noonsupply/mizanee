import { MOIS_CLES, type MoisCle } from "@/lib/calculs-revenus";
import { calculerMoyenneMensuelle } from "@/lib/calculs-revenus";
import type { ChargeFoyer, TypeCharge } from "@/types/charges";
import { membresRevenu } from "@/data/membres";
import { COMMUN_MEMBRE, isCommunMembreId } from "@/lib/commun-membre";

/** Couleur réservée aux charges saisonnières et annuelles (segments du graphique). */
export const CHARGE_CORAL_SAISON_ANNUEL = "#D85A30";

/**
 * Couleur d’affichage d’une charge dans le graphique empilé :
 * corail pour saisonnière / annuelle, sinon couleur du membre (Sophia, Karim, Commun).
 */
export function couleurSegmentCharge(ch: ChargeFoyer): string {
  if (ch.type === "saisonniere" || ch.type === "annuelle") return CHARGE_CORAL_SAISON_ANNUEL;
  if (isCommunMembreId(ch.membreId)) return COMMUN_MEMBRE.couleur;
  return membresRevenu.find((m) => m.id === ch.membreId)?.couleur ?? "#64748b";
}

/**
 * Montant de la charge pour un mois donné (`01`–`12`).
 */
export function montantChargePourMois(ch: ChargeFoyer, mois: MoisCle): number {
  if (!ch.actif) return 0;
  switch (ch.type) {
    case "recurrente_fixe":
      return ch.montantMensuel;
    case "recurrente_variable":
    case "saisonniere":
      return ch.montantParMois?.[mois] ?? 0;
    case "annuelle": {
      const mp = ch.montantParMois;
      if (mp && Object.keys(mp).length > 0) return mp[mois] ?? 0;
      return ch.montantMensuel;
    }
  }
}

/**
 * Somme des montants mensuels équivalents (champs `montantMensuel`) pour les charges actives.
 */
export function calculerTotalFoyerChargesMensuel(charges: ChargeFoyer[]): number {
  return charges.filter((c) => c.actif).reduce((s, c) => s + c.montantMensuel, 0);
}

/**
 * Total annuel estimé pour une charge (somme des 12 mois projetés).
 */
export function calculerTotalAnnuelCharge(ch: ChargeFoyer): number {
  if (!ch.actif) return 0;
  return MOIS_CLES.reduce((sum, m) => sum + montantChargePourMois(ch, m), 0);
}

/**
 * Moyenne mensuelle à partir d’une grille (réutilise la même règle que les revenus variables).
 */
export function calculerMoyenneMensuelleCharge(montantParMois: Record<string, number>): number {
  return calculerMoyenneMensuelle(montantParMois);
}

/**
 * Total par mois (toutes charges actives), clés `01`–`12`.
 */
export function totalParMoisCharges(charges: ChargeFoyer[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of MOIS_CLES) {
    out[m] = 0;
  }
  for (const c of charges) {
    if (!c.actif) continue;
    for (const m of MOIS_CLES) {
      out[m] += montantChargePourMois(c, m);
    }
  }
  return out;
}

/** Libellé court de la nature pour la liste */
export function libelleTypeCharge(t: TypeCharge): string {
  switch (t) {
    case "recurrente_fixe":
      return "Récurrente fixe";
    case "recurrente_variable":
      return "Récurrente variable";
    case "saisonniere":
      return "Saisonnière";
    case "annuelle":
      return "Annuelle";
  }
}
