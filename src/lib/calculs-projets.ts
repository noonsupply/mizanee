import { AUJOURD_HUI } from "@/lib/calculs";
import type { PointSolde, Projet, ProjetCalcule, StatutFaisabilite, StatutProjet } from "@/types/projets";

/**
 * Nombre de mois calendaires entre « aujourd’hui » et le premier jour du mois cible `YYYY-MM`.
 */
export function calculerMoisRestants(date: string, aujourdhui: Date = AUJOURD_HUI): number {
  const [y, m] = date.split("-").map(Number);
  if (!y || !m) return 0;
  const cible = new Date(y, m - 1, 1);
  const diff =
    (cible.getFullYear() - aujourdhui.getFullYear()) * 12 + (cible.getMonth() - aujourdhui.getMonth());
  return Math.max(0, diff);
}

/**
 * Épargne mensuelle nécessaire pour combler le reste à financer sur `moisRestants` mois.
 */
export function calculerEpargneMensuelle(montant: number, moisRestants: number): number {
  if (moisRestants <= 0) return Number.POSITIVE_INFINITY;
  if (montant <= 0) return 0;
  return Math.ceil(montant / moisRestants);
}

/**
 * Faisabilité en comparant l’épargne mensuelle requise au reste disponible mensuel (après charges, etc.).
 */
export function calculerFaisabilite(epargneMensuelle: number, resteDisponible: number): StatutFaisabilite {
  if (!Number.isFinite(epargneMensuelle) || epargneMensuelle <= 0) return "faisable";
  if (resteDisponible <= 0) return "difficile";
  if (epargneMensuelle === Number.POSITIVE_INFINITY) return "difficile";
  const ratio = epargneMensuelle / resteDisponible;
  if (ratio <= 0.85) return "faisable";
  if (ratio <= 1) return "serre";
  return "difficile";
}

/**
 * Enrichit un projet avec mois restants, épargne mensuelle cible, faisabilité et progression.
 */
export function enrichirProjet(projet: Projet, resteDisponible: number): ProjetCalcule {
  const moisRestants = calculerMoisRestants(projet.date);
  const deja = projet.montantDeja ?? 0;
  const restant = Math.max(0, projet.montant - deja);
  const epargneMensuelleNecessaire =
    moisRestants <= 0 ? (restant > 0 ? Number.POSITIVE_INFINITY : 0) : calculerEpargneMensuelle(restant, moisRestants);
  const faisabilite = calculerFaisabilite(
    Number.isFinite(epargneMensuelleNecessaire) ? epargneMensuelleNecessaire : Number.POSITIVE_INFINITY,
    resteDisponible,
  );
  const progressionPct = projet.montant > 0 ? Math.min(100, Math.round((Math.min(deja, projet.montant) / projet.montant) * 100)) : 0;

  return {
    ...projet,
    moisRestants,
    epargneMensuelleNecessaire: Number.isFinite(epargneMensuelleNecessaire) ? epargneMensuelleNecessaire : 0,
    faisabilite,
    progressionPct,
  };
}

function moisCleDepuisDate(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function labelMoisCourt(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

/**
 * Projection du solde cumulé sur `nbMois` mois : épargne mensuelle ajoutée, décaissements aux dates cibles.
 */
export function projeterSolde(
  projets: Projet[],
  soldeInitial: number,
  epargneMensuelle: number,
  nbMois = 24,
  aujourdhui: Date = AUJOURD_HUI,
): PointSolde[] {
  const actifs = projets.filter((p) => p.statut === ("en_cours" as StatutProjet));
  const points: PointSolde[] = [];
  let cumul = soldeInitial;

  for (let i = 0; i < nbMois; i++) {
    const d = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + i, 1);
    const cle = moisCleDepuisDate(d);
    let decaissement = 0;
    const projetsDecaisses: string[] = [];

    for (const p of actifs) {
      if (p.date === cle) {
        decaissement += p.montant;
        projetsDecaisses.push(p.label);
      }
    }

    cumul += epargneMensuelle - decaissement;
    points.push({
      mois: labelMoisCourt(d),
      solde: Math.round(cumul),
      decaissement,
      projetsDecaisses,
    });
  }

  return points;
}

/**
 * Indices des mois où le solde passe sous `seuil` (valeur absolue du solde cumulé).
 */
export function detecterMoisTendus(points: PointSolde[], seuil = 0): number[] {
  const out: number[] = [];
  points.forEach((p, i) => {
    if (p.solde < seuil) out.push(i);
  });
  return out;
}

/** 24 mois consécutifs à partir de `aujourdhui` (1er du mois). */
export function iter24Mois(aujourdhui: Date = AUJOURD_HUI): { cle: string; label: string }[] {
  const out: { cle: string; label: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + i, 1);
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    out.push({ cle, label });
  }
  return out;
}

export function indexMoisDansHorizon(dateYm: string, mois: { cle: string }[]): number {
  const i = mois.findIndex((m) => m.cle === dateYm);
  return i;
}
