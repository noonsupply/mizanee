"use client";

/**
 * Données mock pour les écrans non encore branchés sur l’API.
 * Préférer `useMembres()` pour les appels HTTP.
 */
import { useMemo } from "react";
import {
  personnes,
  chargesP1,
  chargesP2,
  revenuLocatif,
} from "@/data/foyer";
import type { Charge as LegacyCharge } from "@/data/foyer";
import { totalChargesCommunes, totalRevenus, totalChargesMensuelles, totalEpargneMensuelle } from "@/lib/calculs";
import type { ChargeCategorie, ChargeUI, MembreUI, RevenuUI } from "@/types";
import type { ProjetEpargne } from "@/data/foyer";

function mapCategoriePersonnelle(): ChargeCategorie {
  return "AUTRE";
}

function chargesToUI(list: LegacyCharge[], membreId: string, type: "COMMUNE" | "PERSONNELLE"): ChargeUI[] {
  return list.map((c) => ({
    id: c.id,
    label: c.label,
    montant: c.montant,
    categorie: c.categorie === "commune" ? "LOGEMENT" : mapCategoriePersonnelle(),
    type,
    membreId: type === "PERSONNELLE" ? membreId : undefined,
    actif: true,
  }));
}

function buildMembres(projets: ProjetEpargne[]): MembreUI[] {
  const communesPart = totalChargesCommunes();
  const totalSal = personnes.reduce((s, p) => s + p.revenu, 0);
  const epargne = totalEpargneMensuelle(projets);

  return personnes.map((p) => {
    const prorataShare = totalSal > 0 ? (p.revenu / totalSal) * communesPart : 0;
    const perso = p.id === "P1" ? chargesP1 : chargesP2;
    const persoTotal = perso.reduce((s, c) => s + c.montant, 0);
    const revenus: RevenuUI[] = [
      {
        id: `${p.id}-salaire`,
        label: "Salaire",
        montant: p.revenu,
        type: "SALAIRE",
        membreId: p.id,
        actif: true,
      },
    ];
    if (p.id === "P1") {
      revenus.push({
        id: "loc",
        label: "Revenus locatifs (foyer)",
        montant: revenuLocatif,
        type: "LOCATIF",
        membreId: p.id,
        actif: true,
      });
    }
    const charges: ChargeUI[] = chargesToUI(perso, p.id, "PERSONNELLE");
    const revenuMembre = p.id === "P1" ? p.revenu + revenuLocatif : p.revenu;
    const reste = revenuMembre - prorataShare - persoTotal - epargne / personnes.length;

    return {
      id: p.id,
      prenom: p.nom,
      couleur: p.id === "P1" ? "#f43f5e" : "#6366f1",
      emoji: p.id === "P1" ? "🙂" : "🌿",
      revenus,
      charges,
      prorata: totalSal > 0 ? Math.round((p.revenu / totalSal) * 1000) / 10 : 0,
      resteAVivre: Math.round(reste),
      actif: true,
    };
  });
}

export function useMembresMock(projets: ProjetEpargne[]) {
  const membres = useMemo(() => buildMembres(projets), [projets]);
  return {
    membres,
    isLoading: false as const,
    totalRevenusFoyer: totalRevenus(),
    totalChargesFoyer: totalChargesMensuelles(),
  };
}
