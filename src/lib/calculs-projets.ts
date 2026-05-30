import type { PointSolde, Projet, ProjetCalcule, StatutFaisabilite, StatutProjet } from "@/types/projets";

/**
 * Calcule le nombre de mois entre aujourd'hui et la date cible (1er du mois `YYYY-MM`).
 */
export function calculerMoisRestants(date: string, aujourdhui: Date = new Date()): number {
  const [year, month] = date.split("-").map(Number);
  if (!year || !month) return 1;
  const dateCible = new Date(year, month - 1, 1);

  const diff =
    (dateCible.getFullYear() - aujourdhui.getFullYear()) * 12 + (dateCible.getMonth() - aujourdhui.getMonth());

  return Math.max(1, diff);
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
 * Faisabilité en comparant l'épargne mensuelle requise au reste disponible mensuel (après charges, etc.).
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMoisCourt(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

/**
 * Projette le solde épargne sur `nbMois` à partir d'aujourd'hui.
 */
export function projeterSolde(
  projets: Projet[],
  soldeInitial: number,
  epargneMensuelle: number,
  nbMois = 24,
  aujourdhui: Date = new Date(),
): PointSolde[] {
  const actifs = projets.filter((p) => p.statut === ("en_cours" as StatutProjet));
  const points: PointSolde[] = [];
  let solde = soldeInitial;

  for (let i = 0; i < nbMois; i++) {
    const date = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + i, 1);
    const moisStr = moisCleDepuisDate(date);
    const moisLabel = labelMoisCourt(date);

    solde += epargneMensuelle;

    const projetsDecaisses = actifs.filter((p) => p.date === moisStr).map((p) => p.label);
    const decaissement = actifs.filter((p) => p.date === moisStr).reduce((acc, p) => acc + p.montant, 0);

    solde = Math.max(0, solde - decaissement);

    points.push({
      mois: moisLabel,
      solde: Math.round(solde),
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

/** 24 mois consécutifs à partir d'aujourd'hui (1er du mois). */
export function iter24Mois(aujourdhui: Date = new Date()): { cle: string; label: string }[] {
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
  return mois.findIndex((m) => m.cle === dateYm);
}
