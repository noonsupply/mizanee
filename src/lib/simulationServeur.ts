import type { ScenarioInput } from "@/lib/validations";

export interface FoyerSnapshot {
  revenusMensuel: number;
  chargesMensuel: number;
  epargneProjets: number;
}

export function appliquerScenarioPropre(
  base: FoyerSnapshot,
  scenario: ScenarioInput,
): { simule: FoyerSnapshot; deltaSoldeNet: number } {
  let dRevenu = 0;
  let dCharge = 0;
  for (const m of scenario.modifications) {
    const v = m.valeur;
    switch (m.type) {
      case "SALAIRE":
        dRevenu += v;
        break;
      case "CONGE":
        dRevenu -= v;
        break;
      case "CHARGE_NOUVELLE":
        dCharge += v;
        break;
      case "CHARGE_SUPPRIMEE":
        dCharge -= v;
        break;
      default:
        break;
    }
  }
  const simule: FoyerSnapshot = {
    revenusMensuel: base.revenusMensuel + dRevenu,
    chargesMensuel: base.chargesMensuel + dCharge,
    epargneProjets: base.epargneProjets,
  };
  const soldeBase =
    base.revenusMensuel - base.chargesMensuel - base.epargneProjets;
  const soldeSim =
    simule.revenusMensuel - simule.chargesMensuel - simule.epargneProjets;
  return { simule, deltaSoldeNet: soldeSim - soldeBase };
}
