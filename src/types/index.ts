export type RevenuType = "SALAIRE" | "LOCATIF" | "FREELANCE" | "AUTRE";

export type ChargeType = "COMMUNE" | "PERSONNELLE";

export type ChargeCategorie =
  | "LOGEMENT"
  | "ALIMENTATION"
  | "TRANSPORT"
  | "EDUCATION"
  | "LOISIRS"
  | "SANTE"
  | "ABONNEMENTS"
  | "AUTRE";

export type ProjetStatut = "EN_COURS" | "ATTEINT" | "REPORTE" | "ABANDONNE";

export interface RevenuUI {
  id: string;
  label: string;
  montant: number;
  type: RevenuType;
  membreId: string | null;
  actif: boolean;
}

export interface ChargeUI {
  id: string;
  label: string;
  montant: number;
  categorie: ChargeCategorie;
  type: ChargeType;
  membreId?: string | null;
  actif: boolean;
}

export interface MembreUI {
  id: string;
  prenom: string;
  couleur: string;
  emoji?: string;
  revenus: RevenuUI[];
  charges: ChargeUI[];
  prorata: number;
  resteAVivre: number;
  actif?: boolean;
}

export interface ProjetUI {
  id: string;
  label: string;
  montant: number;
  dateCible: Date;
  epargneMensuelle: number;
  priorite: number;
  statut: ProjetStatut;
  couleur: string;
  emoji?: string;
  faisable: boolean;
  moisManquants?: number;
}

export interface ProjectionMois {
  mois: string;
  revenus: number;
  chargesCommunes: number;
  chargesPerso: Record<string, number>;
  epargne: number;
  soldeNet: number;
  soldeCumule: number;
}

export interface ScenarioModification {
  membreId: string;
  type: "SALAIRE" | "CHARGE_NOUVELLE" | "CHARGE_SUPPRIMEE" | "CONGE";
  valeur: number;
  debut: Date;
  fin: Date;
}

export interface Scenario {
  label: string;
  modifications: ScenarioModification[];
}

export interface ImpactResult {
  epargneTotaleAvant: number;
  epargneTotaleApres: number;
  resteAVivreDelta: number;
}

export interface SavedScenario {
  id: string;
  label: string;
  scenario: Scenario;
  createdAt: Date;
}
