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
}

export interface ProjetCalcule extends Projet {
  moisRestants: number;
  epargneMensuelleNecessaire: number;
  faisabilite: StatutFaisabilite;
  progressionPct: number;
}

export interface PointSolde {
  mois: string;
  solde: number;
  decaissement: number;
  projetsDecaisses: string[];
}
