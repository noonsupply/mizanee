import { personnes, revenuLocatif, chargesCommunes, chargesP1, chargesP2 } from "@/data/foyer";
import type { ProjetEpargne } from "@/data/foyer";

export const AUJOURD_HUI = new Date(2026, 4, 10); // 10 mai 2026

export function totalRevenus(): number {
  return personnes.reduce((s, p) => s + p.revenu, 0) + revenuLocatif;
}

export function totalChargesCommunes(): number {
  return chargesCommunes.reduce((s, c) => s + c.montant, 0);
}

export function totalChargesP1(): number {
  return chargesP1.reduce((s, c) => s + c.montant, 0);
}

export function totalChargesP2(): number {
  return chargesP2.reduce((s, c) => s + c.montant, 0);
}

export function totalChargesMensuelles(): number {
  return totalChargesCommunes() + totalChargesP1() + totalChargesP2();
}

export function resteAVivre(epargne = 0): number {
  return totalRevenus() - totalChargesMensuelles() - epargne;
}

export function repartitionProrata(): { P1: number; P2: number } {
  const totalSalaires = personnes.reduce((s, p) => s + p.revenu, 0);
  const p1 = personnes.find((p) => p.id === "P1")!;
  const p2 = personnes.find((p) => p.id === "P2")!;
  const communes = totalChargesCommunes();
  return {
    P1: Math.round((p1.revenu / totalSalaires) * communes),
    P2: Math.round((p2.revenu / totalSalaires) * communes),
  };
}

export function moisRestants(dateObjectif: string): number {
  const target = new Date(dateObjectif);
  const diff =
    (target.getFullYear() - AUJOURD_HUI.getFullYear()) * 12 +
    (target.getMonth() - AUJOURD_HUI.getMonth());
  return Math.max(0, diff);
}

export function epargneMensuelleProjet(projet: ProjetEpargne): number {
  const mois = moisRestants(projet.dateObjectif);
  if (mois <= 0) return Infinity;
  const restant = projet.montantCible - projet.montantDeja;
  if (restant <= 0) return 0;
  return Math.ceil(restant / mois);
}

export function totalEpargneMensuelle(projets: ProjetEpargne[]): number {
  return projets.reduce((s, p) => {
    const m = epargneMensuelleProjet(p);
    return s + (isFinite(m) ? m : 0);
  }, 0);
}

export interface PointProjection {
  mois: string;
  entrees: number;
  sorties: number;
  epargne: number;
  net: number;
  soldeCumul: number;
}

export function simulationSolde(projets: ProjetEpargne[]): PointProjection[] {
  const revenus = totalRevenus();
  const charges = totalChargesMensuelles();
  const epargne = totalEpargneMensuelle(projets);
  const net = revenus - charges - epargne;

  let cumul = 0;
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(AUJOURD_HUI.getFullYear(), AUJOURD_HUI.getMonth() + i + 1, 1);
    const mois = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    cumul += net;
    return {
      mois,
      entrees: revenus,
      sorties: charges,
      epargne,
      net: Math.round(net),
      soldeCumul: Math.round(cumul),
    };
  });
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
