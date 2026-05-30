import { debutAnneeCourante } from "@/lib/date";

/** Hypothèse d'épargne mensuelle fixe pour la projection du solde cumulé. */
export const EPARGNE_MENSUELLE = 0;

/** 1er janvier de l'année en cours (recalculé à chaque appel). */
export function getDebutAnneeEpargneAttendu(): Date {
  return debutAnneeCourante();
}
