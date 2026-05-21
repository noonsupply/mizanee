export interface VirementMembreRef {
  id: string;
  prenom: string;
  couleur: string;
  emoji: string | null;
}

export interface Virement {
  id: string;
  membreId: string;
  membre?: VirementMembreRef;
  mois: string;
  montantVerse: number;
  note: string | null;
}

export interface VirementLigne {
  membreId: string;
  prenom: string;
  couleur: string;
  emoji: string | null;
  prorata: number;
  doitVirer: number;
  montantVerse: number;
  ecart: number;
  virementId: string | null;
  note: string | null;
}

export interface VirementSoldeHistorique {
  mois: string;
  ecart: number;
  soldeCumule: number;
}

export interface VirementSoldeMembre {
  soldeCumule: number;
  historique: VirementSoldeHistorique[];
}

export interface ResumeCommun {
  mois: string;
  chargesCommunes: number;
  totalVire: number;
  manque: number;
}

export interface VirementsPayload {
  mois: string;
  virements: Virement[];
  lignes: VirementLigne[];
  soldes: Record<string, VirementSoldeMembre>;
  resumeCommun: ResumeCommun;
}
