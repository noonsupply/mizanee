export interface SoldeEpargneFoyer {
  montant: number;
  updatedAt: string | null;
}

export interface Foyer {
  id: string;
  nom: string;
  emoji: string | null;
  soldeEpargne: SoldeEpargneFoyer;
  createdAt?: string;
  updatedAt?: string;
}

export type PatchFoyerInput = {
  nom?: string;
  emoji?: string | null;
};

export type PatchSoldeEpargneInput = {
  montant: number;
};
