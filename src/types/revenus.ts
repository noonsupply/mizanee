export type TypeRevenu = "fixe" | "variable" | "ponctuel" | "locatif";

export type Certitude = "certain" | "probable" | "incertain";

/** Variation d’un revenu fixe (chips) */
export type VariationFixe = "stable" | "prime_annuelle" | "13e";

export interface Revenu {
  id: string;
  /** `null` = revenu commun du foyer */
  membreId: string | null;
  label: string;
  type: TypeRevenu;
  /** Moyenne mensuelle ; pour le variable, dérivée de `montantParMois` */
  montantMensuel: number;
  montantParMois?: Record<string, number>;
  verseLe?: string;
  certitude?: Certitude;
  actif: boolean;
  /** Revenu fixe — variation annuelle */
  variationFixe?: VariationFixe;
  /** Locatif — détail pour affichage / édition */
  loyerNet?: number;
  chargesLocativesDeduites?: number;
  /** Clés mois `01`–`12` pour mois sans encaissement */
  moisAbsenceLocatif?: string[];
}
