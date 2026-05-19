import type { MembreRevenu } from "@/data/membres";

/**
 * Point de la courbe « solde net » sur 12 mois (synthèse).
 * Distinct du type homonyme dans `@/types/index` (schéma plus riche côté API).
 */
export interface ProjectionMois {
  mois: string;
  soldeNet: number;
  soldeCumule: number;
  estTendu: boolean;
  raisonTension?: string;
}

export interface Echeance {
  id: string;
  label: string;
  type: "abonnement" | "projet" | "renouvellement";
  /** Mois concerné `YYYY-MM` */
  date: string;
  montant: number;
  statut: "ok" | "serre" | "retard" | "info";
  membreId?: string;
  detail?: string;
  /** Texte du badge urgence (« dans X jours », « dans X semaines », …) */
  delaiLibelle: string;
  /** Couleur sémantique du badge urgence (calculée en lib) */
  teinteDelai: "rouge" | "ambre" | "bleu";
}

/** Ligne « Commun » sur le dashboard (revenus / charges du foyer, hors membres). */
export interface SyntheseCommunLigne {
  label: string;
  color: string;
  revenus: number;
  charges: number;
}

export interface SyntheseMembreLigne {
  id: string;
  prenom: string;
  color: string;
  revenus: number;
  /** Part du foyer (0–100) sur la base des salaires seuls */
  partFoyerPct: number;
  /** Quote-part charges communes (€ / mois) */
  chargesCommunes: number;
  /** Revenus nets après charges perso, part communes et épargne imputée */
  resteAVivreNet: number;
  /** Part du prorata affichée (0–100) */
  prorata: number;
}

export interface SyntheseData {
  moisLabel: string;
  revenus: number;
  charges: number;
  resteAVivre: number;
  soldeEpargneReel: number;
  soldeEpargneAttendu: number;
  ecartEpargne: number;
  statutEpargne: "avance" | "ok" | "retard";
  alerteMois?: { message: string; excedent: number };
  repartitionBudget: { label: string; montant: number; color: string }[];
  membres: SyntheseMembreLigne[];
  commun: SyntheseCommunLigne;
  echeances: Echeance[];
  projection: ProjectionMois[];
  /** Phrases calculées pour la barre de métriques (aucune logique dans les composants) */
  libelleSecondaireRevenus: string;
  libelleSecondaireCharges: string;
  chargesTonSurcote: boolean;
  pourcentageRavSurRevenus: number;
  /** Total charges communes (€ / mois) */
  totalChargesCommunes: number;
}

/** Membre foyer (identité) — réexport pratique pour les pages */
export type Membre = MembreRevenu;
