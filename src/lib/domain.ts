/** Mois calendaires entre deux dates (inclus mois de début, exclus fin du jour si même mois — aligné SPEC épargne). */
export function moisRestantsVers(dateCible: Date, depuis: Date = new Date()): number {
  const d0 = new Date(depuis.getFullYear(), depuis.getMonth(), 1);
  const d1 = new Date(dateCible.getFullYear(), dateCible.getMonth(), 1);
  const m =
    (d1.getFullYear() - d0.getFullYear()) * 12 + (d1.getMonth() - d0.getMonth());
  return Math.max(0, m);
}

export function calculerEpargneMensuelleStockee(montant: number, dateCible: Date, depuis = new Date()): number {
  const mois = moisRestantsVers(dateCible, depuis);
  if (mois <= 0) return montant > 0 ? montant : 0;
  return Math.ceil(montant / mois);
}
