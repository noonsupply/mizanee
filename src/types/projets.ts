import type { MembreRevenuId } from "@/data/membres";

export type StatutFaisabilite = "faisable" | "serre" | "difficile";

export type StatutProjet = "en_cours" | "atteint" | "reporte" | "abandonne";

export interface Projet {
  id: string;
  label: string;
  montant: number;
  /** Cible au format `YYYY-MM` */
  date: string;
  /** 1 = le plus prioritaire ; peut être réordonné par drag */
  priorite: number;
  color: string;
  statut: StatutProjet;
  /** Projet individuel ; omis = projet commun */
  membreId?: MembreRevenuId;
  /** Montant déjà épargné pour ce projet (progression) */
  montantDeja?: number;
  /** Épargne mensuelle calculée côté API */
  epargneMensuelle?: number;
  /** Mois de la dépense effective (`YYYY-MM`) une fois le projet terminé */
  dateDepense?: string | null;
}

export interface ProjetCalcule extends Projet {
  moisRestants: number;
  epargneMensuelleNecessaire: number;
  faisabilite: StatutFaisabilite;
  progressionPct: number;
}

export type StatutAllocation = "finance" | "partiel" | "non_finance";

export type UrgenceProjet = "urgent" | "serre" | "ok" | "lointain";

export interface ProjetAlloue extends ProjetCalcule {
  /** Ce qui est alloué depuis le solde disponible */
  montantAlloue: number;
  /** montant - montantAlloue */
  montantManquant: number;
  /** montantAlloue / montant * 100 */
  progressionReelle: number;
  statutAllocation: StatutAllocation;
  urgence: UrgenceProjet;
  /** Épargne mensuelle pour combler le manque d'ici la date cible */
  epargneMensuelleRequise: number;
}

export interface PlanActionLigne {
  label: string;
  montant: number;
  couleur: string;
  statut: StatutAllocation;
}

export interface PointSolde {
  mois: string;
  solde: number;
  decaissement: number;
  projetsDecaisses: string[];
}
