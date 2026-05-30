import type { ProjetAlloue } from "@/types/projets";

export interface LigneMois {
  /** Label court, ex: 'juin 26' */
  moisLabel: string;
  /** Clé `YYYY-MM` */
  moisStr: string;
  /** Montant à mettre de côté ce mois-ci */
  epargne: number;
  /** Solde après épargne et décaissements */
  soldeApres: number;
  /** Un projet arrive à échéance ce mois */
  isDeadline: boolean;
  /** Mois courant */
  isToday: boolean;
  /** Projets à décaisser ce mois */
  deadlines: ProjetAlloue[];
  /** Deadlines avec solde suffisant */
  projetsFinances: ProjetAlloue[];
  /** Deadlines avec solde insuffisant */
  projetsManquants: ProjetAlloue[];
}

function cleMois(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMois(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

function moisEntre(dateYm: string, ref: Date): number {
  const [y, m] = dateYm.split("-").map(Number);
  if (!y || !m) return 0;
  return (y - ref.getFullYear()) * 12 + (m - 1 - ref.getMonth());
}

/**
 * Calcule le montant à épargner pour rattraper le retard sur les mois
 * restants avant chaque deadline. Fonction pure.
 */
function calculerRattrapage(
  projets: ProjetAlloue[],
  soldeActuel: number,
  dateActuelle: Date,
  moisRestantsTotal: number,
): number {
  const actifs = projets.filter((p) => p.statut === "en_cours");
  if (actifs.length === 0) return 0;

  const manqueTotal = actifs.reduce((acc, p) => {
    const moisProjet = moisEntre(p.date, dateActuelle);
    if (moisProjet >= 0) {
      return acc + Math.max(0, p.montant - soldeActuel / actifs.length);
    }
    return acc;
  }, 0);

  return Math.max(0, Math.ceil(manqueTotal / Math.max(1, moisRestantsTotal)));
}

/**
 * Génère l'échéancier sur les `nbMois` prochains mois.
 * Le premier mois utilise `montantCeMois` saisi par l'utilisateur ;
 * les mois suivants calculent le rattrapage nécessaire pour financer
 * tous les projets dans les temps. Fonction pure — aucun side effect.
 */
export function genererEcheancier(
  projets: ProjetAlloue[],
  soldeInitial: number,
  montantCeMois: number,
  nbMois = 10,
  aujourdhui: Date = new Date(),
): LigneMois[] {
  const lignes: LigneMois[] = [];
  let solde = Math.max(0, soldeInitial);

  for (let i = 0; i < nbMois; i++) {
    const date = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + i, 1);
    const moisStr = cleMois(date);
    const moisLabel = labelMois(date);

    const epargne = i === 0 ? Math.max(0, montantCeMois) : calculerRattrapage(projets, solde, date, nbMois - i);

    solde += epargne;

    const deadlines = projets.filter((p) => p.date === moisStr && p.statut === "en_cours");
    const projetsFinances = deadlines.filter((p) => solde >= p.montant);
    const projetsManquants = deadlines.filter((p) => solde < p.montant);
    const decaissement = projetsFinances.reduce((acc, p) => acc + p.montant, 0);

    solde = Math.max(0, solde - decaissement);

    lignes.push({
      moisLabel,
      moisStr,
      epargne: Math.round(epargne),
      soldeApres: Math.round(solde),
      isDeadline: deadlines.length > 0,
      isToday: i === 0,
      deadlines,
      projetsFinances,
      projetsManquants,
    });
  }

  return lignes;
}

/**
 * Montant minimum recommandé ce mois-ci : couvre uniquement les projets
 * urgents (échéance imminente). Fonction pure.
 */
export function calculerMontantMinimum(projets: ProjetAlloue[]): number {
  return projets
    .filter((p) => p.statut === "en_cours" && p.urgence === "urgent")
    .reduce((acc, p) => acc + p.epargneMensuelleRequise, 0);
}

/**
 * Montant recommandé ce mois-ci : effort d'épargne pour garder tous les
 * projets dans les temps. Fonction pure.
 */
export function calculerMontantRecommande(projets: ProjetAlloue[]): number {
  return projets
    .filter((p) => p.statut === "en_cours")
    .reduce((acc, p) => acc + p.epargneMensuelleRequise, 0);
}
