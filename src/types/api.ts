/** Entités renvoyées par l’API Express (forme Prisma sérialisée). */

export interface Membre {
  id: string;
  prenom: string;
  couleur: string;
  emoji: string | null;
  actif: boolean;
  prorata: number;
  foyerId: string;
  createdAt?: string;
  revenus?: RevenuApi[];
  charges?: ChargeApi[];
  projets?: ProjetApi[];
}

export interface RevenuApi {
  id: string;
  label: string;
  montant: number;
  type: string;
  actif: boolean;
  membreId: string | null;
  estCommune?: boolean;
  createdAt?: string;
  membre?: { id: string; prenom: string };
}

export interface ChargeApi {
  id: string;
  label: string;
  montant: number;
  montantParMois?: Record<string, number>;
  montantMensuelMoyen?: number;
  categorie: string;
  type: string;
  actif: boolean;
  membreId: string | null;
  foyerId?: string;
  createdAt?: string;
  membre?: { id: string; prenom: string } | null;
}

export interface ProjetApi {
  id: string;
  label: string;
  montant: number;
  dateCible: string;
  epargneMensuelle: number;
  priorite: number;
  statut: string;
  couleur: string;
  emoji: string | null;
  dateDepense?: string | null;
  foyerId?: string;
  createdAt?: string;
  membres?: { id: string; prenom: string }[];
}

export type CreateMembreInput = {
  prenom: string;
  couleur?: string;
  emoji?: string | null;
  prorata?: number;
};

export type UpdateMembreInput = Partial<CreateMembreInput> & { actif?: boolean };

export type CreateRevenuInput = {
  label: string;
  montant: number;
  type: string;
  membreId?: string | null;
  actif?: boolean;
};

export type UpdateRevenuInput = Partial<CreateRevenuInput>;

export type CreateChargeInput = {
  label: string;
  montant?: number;
  montantParMois?: Record<string, number>;
  categorie: string;
  type?: string;
  membreId?: string | null;
  actif?: boolean;
};

export type UpdateChargeInput = Partial<CreateChargeInput>;

export type CreateProjetInput = {
  label: string;
  montant: number;
  dateCible: string;
  priorite?: number;
  statut?: string;
  couleur?: string;
  emoji?: string | null;
  membreIds?: string[];
};

export type UpdateProjetInput = Partial<CreateProjetInput>;
