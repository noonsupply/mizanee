/** Nature de la charge (cartes du formulaire) */
export type TypeCharge = "recurrente_fixe" | "recurrente_variable" | "saisonniere" | "annuelle";

export interface ChargeFoyer {
  id: string;
  /** `null` = charge commune du foyer */
  membreId: string | null;
  label: string;
  type: TypeCharge;
  /** Équivalent mensuel moyen (affichage / totaux) */
  montantMensuel: number;
  /** Grille mensuelle `01`–`12` pour variable / saisonnière, ou mois unique pour annuelle */
  montantParMois?: Record<string, number>;
  /** Montant annuel saisi (type annuelle) */
  montantAnnuel?: number;
  verseLe?: string;
  actif: boolean;
}
