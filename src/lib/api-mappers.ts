import { isCommunMembreId, normalizeMembreIdFromApi, toApiMembreId } from "@/lib/commun-membre";
import type { ChargeApi, CreateProjetInput, Membre, ProjetApi, RevenuApi } from "@/types/api";
import type { ChargeFoyer } from "@/types/charges";
import type { Projet, StatutProjet } from "@/types/projets";
import type { Revenu, TypeRevenu } from "@/types/revenus";
import type { ChargeCategorie, ChargeUI, MembreUI, RevenuType, RevenuUI } from "@/types";

function mapRevenuTypeApi(type: string): TypeRevenu {
  switch (type) {
    case "SALAIRE":
      return "fixe";
    case "LOCATIF":
      return "locatif";
    case "FREELANCE":
      return "variable";
    default:
      return "ponctuel";
  }
}

function mapRevenuTypeUi(type: RevenuType): string {
  switch (type) {
    case "SALAIRE":
      return "SALAIRE";
    case "LOCATIF":
      return "LOCATIF";
    case "FREELANCE":
      return "FREELANCE";
    default:
      return "AUTRE";
  }
}

export function mapRevenuApiToUi(r: RevenuApi): Revenu {
  return {
    id: r.id,
    membreId: normalizeMembreIdFromApi(r.membreId ?? (r.estCommune ? null : r.membreId)),
    label: r.label,
    type: mapRevenuTypeApi(r.type),
    montantMensuel: r.montant,
    actif: r.actif,
  };
}

export function mapRevenuUiToApiInput(r: Partial<Revenu> & { type?: TypeRevenu }): {
  label: string;
  montant: number;
  type: string;
  membreId: string | null;
  actif?: boolean;
} {
  const typeMap: Record<TypeRevenu, string> = {
    fixe: "SALAIRE",
    locatif: "LOCATIF",
    variable: "FREELANCE",
    ponctuel: "AUTRE",
  };
  return {
    label: r.label ?? "",
    montant: r.montantMensuel ?? 0,
    type: r.type ? typeMap[r.type] : "SALAIRE",
    membreId: toApiMembreId(r.membreId),
    actif: r.actif,
  };
}

function inferChargeUiType(c: ChargeApi): ChargeFoyer["type"] {
  const grid = c.montantParMois ?? {};
  const keys = Object.keys(grid);
  if (keys.length === 1 && grid[keys[0]!]! > 0 && keys.length === 1) {
    const val = grid[keys[0]!]!;
    if (val >= 100 && keys[0] !== undefined) return "annuelle";
  }
  if (keys.length > 0) return "recurrente_variable";
  return "recurrente_fixe";
}

export function mapChargeApiToFoyer(
  c: ChargeApi,
  membreSlot?: Map<string, "p1" | "p2" | "commun">,
): ChargeFoyer {
  const membreId =
    c.type === "COMMUNE" || !c.membreId
      ? null
      : membreSlot
        ? (membreSlot.get(c.membreId) ?? c.membreId)
        : c.membreId;
  const montantParMois = c.montantParMois;
  const montantMensuel = c.montantMensuelMoyen ?? c.montant;
  return {
    id: c.id,
    membreId,
    label: c.label,
    type: inferChargeUiType(c),
    montantMensuel,
    montantParMois: montantParMois && Object.keys(montantParMois).length > 0 ? montantParMois : undefined,
    actif: c.actif,
  };
}

const CHARGE_CATEGORIE_MAP: Record<ChargeFoyer["type"], string> = {
  recurrente_fixe: "AUTRE",
  recurrente_variable: "AUTRE",
  saisonniere: "AUTRE",
  annuelle: "ABONNEMENTS",
};

export function mapChargeFoyerToApiInput(c: ChargeFoyer): {
  label: string;
  montant?: number;
  montantParMois?: Record<string, number>;
  categorie: string;
  type: "COMMUNE" | "PERSONNELLE";
  membreId?: string | null;
  actif?: boolean;
} {
  const isCommun = isCommunMembreId(c.membreId);
  const payload: ReturnType<typeof mapChargeFoyerToApiInput> = {
    label: c.label,
    categorie: CHARGE_CATEGORIE_MAP[c.type] ?? "AUTRE",
    type: isCommun ? "COMMUNE" : "PERSONNELLE",
    membreId: isCommun ? null : c.membreId,
    actif: c.actif,
  };
  if (c.montantParMois && Object.keys(c.montantParMois).length > 0) {
    payload.montantParMois = c.montantParMois;
  } else {
    payload.montant = c.montantMensuel;
  }
  return payload;
}

export function buildMembresUI(
  membres: Membre[],
  revenus: RevenuApi[],
  charges: ChargeApi[],
): MembreUI[] {
  return membres.map((m) => {
    const id = m.id;
    const revenusUi: RevenuUI[] = revenus
      .filter((r) => r.membreId === id)
      .map((r) => ({
        id: r.id,
        label: r.label,
        montant: r.montant,
        type: r.type as RevenuType,
        membreId: id,
        actif: r.actif,
      }));
    const chargesUi: ChargeUI[] = charges
      .filter((c) => c.membreId === id && c.type === "PERSONNELLE")
      .map((c) => ({
        id: c.id,
        label: c.label,
        montant: c.montantMensuelMoyen ?? c.montant,
        categorie: c.categorie as ChargeCategorie,
        type: "PERSONNELLE" as const,
        membreId: id,
        actif: c.actif,
      }));
    const revenuTotal = revenusUi.filter((r) => r.actif).reduce((s, r) => s + r.montant, 0);
    const chargeTotal = chargesUi.filter((c) => c.actif).reduce((s, c) => s + c.montant, 0);

    return {
      id: m.id,
      prenom: m.prenom,
      couleur: m.couleur,
      emoji: m.emoji ?? undefined,
      revenus: revenusUi,
      charges: chargesUi,
      prorata: m.prorata,
      resteAVivre: Math.round(revenuTotal - chargeTotal),
      actif: m.actif,
    };
  });
}

export function mapProjetApiToUi(p: ProjetApi): Projet {
  const d = new Date(p.dateCible);
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const statutMap: Record<string, StatutProjet> = {
    EN_COURS: "en_cours",
    ATTEINT: "atteint",
    REPORTE: "reporte",
    ABANDONNE: "abandonne",
  };
  return {
    id: p.id,
    label: p.label,
    montant: p.montant,
    date: ym,
    priorite: p.priorite,
    color: p.couleur,
    statut: statutMap[p.statut] ?? "en_cours",
    montantDeja: 0,
    epargneMensuelle: p.epargneMensuelle,
    dateDepense: p.dateDepense ?? null,
  };
}

export function mapProjetUiToApiInput(p: Projet): CreateProjetInput {
  const [y, m] = p.date.split("-").map(Number);
  const dateCible = new Date(y!, (m ?? 1) - 1, 1).toISOString();
  const statutMap: Record<StatutProjet, string> = {
    en_cours: "EN_COURS",
    atteint: "ATTEINT",
    reporte: "REPORTE",
    abandonne: "ABANDONNE",
  };
  return {
    label: p.label,
    montant: p.montant,
    dateCible,
    priorite: p.priorite,
    statut: statutMap[p.statut],
    couleur: p.color,
  };
}

/** Associe les deux premiers membres actifs aux slots `p1` / `p2` pour la synthèse. */
export function buildMembreSlotMap(membres: Membre[]): Map<string, "p1" | "p2"> {
  const actifs = [...membres].filter((m) => m.actif).sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  const map = new Map<string, "p1" | "p2">();
  if (actifs[0]) map.set(actifs[0].id, "p1");
  if (actifs[1]) map.set(actifs[1].id, "p2");
  return map;
}

export function mapMembreApiToMembreUI(m: Membre): MembreUI {
  const revenus: RevenuUI[] = (m.revenus ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    montant: r.montant,
    type: r.type as RevenuType,
    membreId: r.membreId,
    actif: r.actif,
  }));
  const charges: ChargeUI[] = (m.charges ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    montant: c.montant,
    categorie: c.categorie as ChargeCategorie,
    type: c.type === "COMMUNE" ? "COMMUNE" : "PERSONNELLE",
    membreId: c.membreId ?? undefined,
    actif: c.actif,
  }));
  const revenuTotal = revenus.filter((r) => r.actif).reduce((s, r) => s + r.montant, 0);
  const chargeTotal = charges.filter((c) => c.actif).reduce((s, c) => s + c.montant, 0);

  return {
    id: m.id,
    prenom: m.prenom,
    couleur: m.couleur,
    emoji: m.emoji ?? undefined,
    revenus,
    charges,
    prorata: m.prorata,
    resteAVivre: Math.round(revenuTotal - chargeTotal),
    actif: m.actif,
  };
}

export { mapRevenuTypeUi };
