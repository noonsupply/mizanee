/**
 * Utilitaires date — toujours partir de la date du jour réelle.
 */

export function getAujourdhui(): Date {
  return new Date();
}

/** 1er janvier de l'année de la date de référence (défaut : année en cours). */
export function debutAnneeCourante(ref: Date = new Date()): Date {
  return new Date(ref.getFullYear(), 0, 1);
}

export function moisCourantYm(ref: Date = new Date()): string {
  return `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateLabelLong(ref: Date = new Date()): string {
  return ref.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMoisLabelLong(ref: Date = new Date()): string {
  return ref.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
