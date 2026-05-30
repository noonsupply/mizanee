import { debutAnneeCourante } from "@/lib/date";
import { COMMUN_MEMBRE, isCommunMembreId } from "@/lib/commun-membre";
import type { ChargeFoyer } from "@/types/charges";
import type { Revenu } from "@/types/revenus";
import type { Projet } from "@/types/projets";
import type { Echeance, ProjectionMois, SyntheseData, SyntheseMembreLigne } from "@/types/synthese";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function cleMoisDepuisDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function premierJourMoisYm(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, 1);
}

/**
 * Nombre de mois calendaires entre le 1er jour de `debut` (inclus) et le 1er jour de `fin` (inclus).
 */
function nbMoisCalendaires(debut: Date, fin: Date): number {
  return Math.max(
    0,
    (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth()),
  );
}

/**
 * Calcule combien devrait être sur le compte épargne à ce jour
 * en fonction des projets et de l'épargne mensuelle (depuis le 1er janvier de l'année en cours).
 */
export function calculerSoldeAttendu(
  projets: Projet[],
  epargneMensuelle: number,
  soldeDepart = 0,
  dateRef: Date = new Date(),
): number {
  const debut = debutAnneeCourante(dateRef);
  const aujourdhui = new Date(dateRef.getFullYear(), dateRef.getMonth(), 1);

  const moisEcoules =
    (aujourdhui.getFullYear() - debut.getFullYear()) * 12 + (aujourdhui.getMonth() - debut.getMonth());

  let solde = soldeDepart;
  const actifs = projets.filter((p) => p.statut === "en_cours");

  for (let i = 0; i < moisEcoules; i++) {
    const date = new Date(debut.getFullYear(), debut.getMonth() + i, 1);
    const moisStr = cleMoisDepuisDate(date);

    solde += epargneMensuelle;

    const decaissement = actifs.filter((p) => p.date === moisStr).reduce((acc, p) => acc + p.montant, 0);

    solde = Math.max(0, solde - decaissement);
  }

  return Math.round(solde);
}

/**
 * Écart entre solde réel et solde attendu (positif = avance).
 */
export function calculerEcartEpargne(
  soldeReel: number,
  soldeAttendu: number,
): { ecart: number; statut: "avance" | "ok" | "retard" } {
  const ecart = Math.round(soldeReel - soldeAttendu);
  const tol = 25;
  if (ecart > tol) return { ecart, statut: "avance" };
  if (ecart < -tol) return { ecart, statut: "retard" };
  return { ecart, statut: "ok" };
}

function montantChargePourMois(c: ChargeFoyer, moisCle: string): number {
  if (!c.actif) return 0;
  const key = moisCle.slice(0, 2);
  if (c.montantParMois && c.montantParMois[key] != null) return c.montantParMois[key]!;
  if (c.type === "annuelle" && c.montantParMois) {
    const v = c.montantParMois[key];
    return v ?? 0;
  }
  return c.montantMensuel;
}

function baselineMensuelleCharge(c: ChargeFoyer): number {
  if (!c.actif) return 0;
  return c.montantMensuel;
}

/**
 * Détecte si le mois courant est « chargé » (charges au-dessus d’une baseline mensuelle).
 *
 * @param charges — Grille foyer (`ChargeFoyer`) avec `montantParMois` pour les pics.
 * @param moisIndex — Index mois JS (`0` = janvier … `4` = mai).
 */
export function analyserMoisCourant(
  charges: ChargeFoyer[],
  moisIndex: number,
): { estCharge: boolean; excedent: number; raisons: string[] } {
  const moisCle = pad2(moisIndex + 1);
  let totalCourant = 0;
  let totalBaseline = 0;
  const raisons: string[] = [];

  for (const c of charges) {
    totalCourant += montantChargePourMois(c, moisCle);
    totalBaseline += baselineMensuelleCharge(c);
    const mc = montantChargePourMois(c, moisCle);
    const base = Math.max(1, baselineMensuelleCharge(c));
    if (c.actif && mc > base * 1.35 && mc - base >= 25) {
      raisons.push(c.label);
    }
  }

  const excedent = Math.round(totalCourant - totalBaseline);
  const estCharge = excedent >= 120 || raisons.length >= 2;
  return { estCharge, excedent: Math.max(0, excedent), raisons: raisons.slice(0, 6) };
}

function joursEntre(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / 86400000);
}

function statutProjetPourEcheance(p: Projet, dateRef: Date): "ok" | "serre" | "retard" | "info" {
  const debut = debutAnneeCourante(dateRef);
  const ref = new Date(dateRef.getFullYear(), dateRef.getMonth(), dateRef.getDate());
  const fin = premierJourMoisYm(p.date);
  const total = nbMoisCalendaires(debut, fin);
  const elapsed = nbMoisCalendaires(debut, ref);
  if (total <= 0) return "info";
  const attendu = (Math.min(elapsed, total) / total) * p.montant;
  const deja = p.montantDeja ?? 0;
  if (deja >= attendu - 50) return "ok";
  if (deja >= attendu * 0.65) return "serre";
  return "retard";
}

function delaiPresentation(jours: number): string {
  if (jours < 30) return `dans ${Math.max(0, jours)} jours`;
  if (jours < 90) {
    const sem = Math.max(1, Math.round(jours / 7));
    return `dans ${sem} semaines`;
  }
  const mo = Math.max(1, Math.round(jours / 30));
  return `dans ${mo} mois`;
}

function teinteDelaiDepuisJours(jours: number, statut: Echeance["statut"]): "rouge" | "ambre" | "bleu" {
  if (jours < 30) return statut === "retard" ? "rouge" : "ambre";
  if (jours < 90) return "ambre";
  return "bleu";
}

function finMoisCalendarDate(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y ?? 1970, m ?? 1, 0);
}

/**
 * Échéances à venir (fenêtre ~0–365 jours), triées par date croissante.
 */
export function calculerEcheances(
  charges: ChargeFoyer[],
  projets: Projet[],
  soldeEpargne: number,
  dateRef: Date = new Date(),
): Echeance[] {
  const out: Echeance[] = [];
  const finHorizon = new Date(dateRef);
  finHorizon.setDate(finHorizon.getDate() + 365);

  for (const c of charges) {
    if (!c.actif) continue;
    if (c.type === "annuelle" && c.montantParMois) {
      for (const [moisNum, montant] of Object.entries(c.montantParMois)) {
        const y = dateRef.getFullYear();
        let d = new Date(y, Number(moisNum) - 1, 1);
        if (d < dateRef) d = new Date(y + 1, Number(moisNum) - 1, 1);
        if (d > finHorizon) continue;
        const ym = cleMoisDepuisDate(d);
        const j = joursEntre(dateRef, d);
        if (j < 0 || j > 365) continue;
        const statut: Echeance["statut"] = montant > 400 ? "serre" : "info";
        out.push({
          id: `ab-${c.id}-${ym}`,
          label: c.label,
          type: "abonnement",
          date: ym,
          montant,
          statut,
          membreId: isCommunMembreId(c.membreId) ? undefined : (c.membreId ?? undefined),
          detail: c.type === "annuelle" ? "Paiement annuel" : undefined,
          delaiLibelle: delaiPresentation(j),
          teinteDelai: teinteDelaiDepuisJours(j, statut),
        });
      }
    }
    if (c.id === "assurance_voiture" && c.type === "recurrente_fixe") {
      const ym = "2026-06";
      const d = premierJourMoisYm(ym);
      if (d >= dateRef && d <= finHorizon) {
        const j = joursEntre(dateRef, d);
        out.push({
          id: `ren-${c.id}`,
          label: `${c.label} (renouvellement)`,
          type: "renouvellement",
          date: ym,
          montant: c.montantMensuel,
          statut: "info",
          detail: `${c.montantMensuel} € / mois`,
          delaiLibelle: delaiPresentation(j),
          teinteDelai: teinteDelaiDepuisJours(j, "info"),
        });
      }
    }
  }

  for (const p of projets) {
    if (p.statut !== "en_cours") continue;
    const ymRef = cleMoisDepuisDate(dateRef);
    const ymFin = cleMoisDepuisDate(finHorizon);
    if (p.date < ymRef || p.date > ymFin) continue;
    const finMois = finMoisCalendarDate(p.date);
    const j = joursEntre(dateRef, finMois);
    const st = statutProjetPourEcheance(p, dateRef);
    const deja = p.montantDeja ?? 0;
    const moisRestants = nbMoisCalendaires(
      new Date(dateRef.getFullYear(), dateRef.getMonth(), 1),
      premierJourMoisYm(p.date),
    );
    out.push({
      id: `pr-${p.id}-${p.date}`,
      label: p.label,
      type: "projet",
      date: p.date,
      montant: p.montant,
      statut: st,
      membreId: p.membreId,
      projetId: p.id,
      moisRestants,
      detail: `${Math.round(deja)} € épargnés / ${p.montant} €`,
      delaiLibelle: delaiPresentation(j),
      teinteDelai: teinteDelaiDepuisJours(j, st),
    });
  }

  out.sort((a, b) => a.date.localeCompare(b.date));
  void soldeEpargne;
  return out;
}

function totalRevenusMois(revenus: Revenu[], moisNum: string): number {
  let s = 0;
  for (const r of revenus) {
    if (!r.actif) continue;
    const extra = r.montantParMois?.[moisNum] ?? 0;
    s += r.montantMensuel + extra;
  }
  return Math.round(s);
}

function totalChargesMois(charges: ChargeFoyer[], moisIndex: number): number {
  const moisCle = pad2(moisIndex + 1);
  return Math.round(charges.filter((c) => c.actif).reduce((s, c) => s + montantChargePourMois(c, moisCle), 0));
}

/**
 * Projection du solde net cumulé sur 12 mois (revenus − charges mensuelles − épargne).
 * Les mois « tendus » sont ceux dont le solde net est strictement inférieur à 85 % de la moyenne des nets.
 */
export function projeterSoldeNet(
  revenus: Revenu[],
  charges: ChargeFoyer[],
  epargne: number,
  dateRef: Date = new Date(),
): ProjectionMois[] {
  const moisIdx = dateRef.getMonth();
  const moisNum = pad2(moisIdx + 1);
  const R = totalRevenusMois(revenus, moisNum);
  const C = charges.filter((c) => c.actif).reduce((s, c) => s + c.montantMensuel, 0);
  const net = Math.round(R - C - epargne);
  const bruts: Omit<ProjectionMois, "estTendu" | "raisonTension">[] = [];
  let cumul = 0;
  for (let i = 0; i < 12; i += 1) {
    cumul += net;
    const d = new Date(dateRef.getFullYear(), dateRef.getMonth() + i + 1, 1);
    const mois = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    bruts.push({ mois, soldeNet: net, soldeCumule: Math.round(cumul) });
  }
  const moyenne = bruts.reduce((s, p) => s + p.soldeNet, 0) / bruts.length;
  const seuil = moyenne * 0.85;
  return bruts.map((p) => ({
    ...p,
    estTendu: p.soldeNet < seuil,
    raisonTension:
      p.soldeNet < seuil
        ? `Solde net sous 85 % de la moyenne (${Math.round(seuil)} €)`
        : undefined,
  }));
}

function sommeRevenusMembre(revenus: Revenu[], membreId: string): number {
  return revenus.filter((r) => r.actif && r.membreId === membreId).reduce((s, r) => s + r.montantMensuel, 0);
}

function sommeChargesPerso(charges: ChargeFoyer[], membreId: "p1" | "p2"): number {
  return charges
    .filter((c) => c.actif && c.membreId === membreId)
    .reduce((s, c) => s + c.montantMensuel, 0);
}

function sommeChargesCommunes(charges: ChargeFoyer[]): number {
  return charges
    .filter((c) => c.actif && isCommunMembreId(c.membreId))
    .reduce((s, c) => s + c.montantMensuel, 0);
}

function sommeRevenusCommun(revenus: Revenu[]): number {
  return revenus
    .filter((r) => r.actif && isCommunMembreId(r.membreId))
    .reduce((s, r) => s + r.montantMensuel, 0);
}

export interface ParametresSynthese {
  dateRef: Date;
  revenus: Revenu[];
  charges: ChargeFoyer[];
  projets: Projet[];
  /** Identités `p1` / `p2` pour les lignes membres */
  membres: { id: "p1" | "p2"; prenom: string; color: string }[];
  soldeEpargneReel: number;
  epargneMensuelle: number;
}

/**
 * Assemble toutes les données affichées sur l’écran Synthèse (calculs uniquement).
 */
export function construireDonneesSynthese(p: ParametresSynthese): SyntheseData {
  const { dateRef, revenus, charges, projets, membres, soldeEpargneReel, epargneMensuelle } = p;
  const moisIndex = dateRef.getMonth();
  const moisLabel = dateRef.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const moisNum = pad2(moisIndex + 1);

  const revenusTotal = totalRevenusMois(revenus, moisNum);
  const chargesTotal = totalChargesMois(charges, moisIndex);
  const resteAVivre = Math.round(revenusTotal - chargesTotal - epargneMensuelle);

  // Épargne mensuelle théorique attendue : somme des efforts d'épargne des projets en cours.
  // (indépendante de l'hypothèse `epargneMensuelle` qui sert au reste à vivre)
  const epargneAttendueMensuelle = projets
    .filter((p) => p.statut === "en_cours")
    .reduce((s, p) => s + (p.epargneMensuelle ?? 0), 0);

  const soldeAttendu = calculerSoldeAttendu(projets, epargneAttendueMensuelle, 0, dateRef);
  const { ecart, statut } = calculerEcartEpargne(soldeEpargneReel, soldeAttendu);

  const analyse = analyserMoisCourant(charges, moisIndex);
  let alerteMois: SyntheseData["alerteMois"];
  if (analyse.estCharge) {
    const raisons = analyse.raisons.length ? analyse.raisons.join(" + ") : "charges groupées";
    alerteMois = {
      message: `${moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1)} est un mois chargé — ${raisons}. Soit +${analyse.excedent} € par rapport à un mois normal.`,
      excedent: analyse.excedent,
    };
  }

  const communes = sommeChargesCommunes(charges);
  const revP1 = sommeRevenusMembre(revenus, "p1");
  const revP2 = sommeRevenusMembre(revenus, "p2");
  const salaires = revP1 + revP2;
  const prorataP1 = salaires > 0 ? Math.round((revP1 / salaires) * communes) : 0;
  const prorataP2 = salaires > 0 ? Math.round((revP2 / salaires) * communes) : 0;
  const perso1 = sommeChargesPerso(charges, "p1");
  const perso2 = sommeChargesPerso(charges, "p2");
  const ep1 = salaires > 0 ? Math.round(epargneMensuelle * (revP1 / salaires)) : 0;
  const ep2 = salaires > 0 ? Math.round(epargneMensuelle * (revP2 / salaires)) : 0;

  const rav1 = Math.round(revP1 - perso1 - prorataP1 - ep1);
  const rav2 = Math.round(revP2 - perso2 - prorataP2 - ep2);

  const membresLignes: SyntheseMembreLigne[] = membres.map((m) => {
    const rev = m.id === "p1" ? revP1 : revP2;
    const cc = m.id === "p1" ? prorataP1 : prorataP2;
    const rav = m.id === "p1" ? rav1 : rav2;
    const part = salaires > 0 ? Math.round((rev / salaires) * 100) : 0;
    return {
      id: m.id,
      prenom: m.prenom,
      color: m.color,
      revenus: rev,
      partFoyerPct: part,
      chargesCommunes: cc,
      resteAVivreNet: rav,
      prorata: part,
    };
  });

  const prenom1 = membres.find((x) => x.id === "p1")?.prenom ?? "Membre 1";
  const prenom2 = membres.find((x) => x.id === "p2")?.prenom ?? "Membre 2";
  const revCommun = sommeRevenusCommun(revenus);
  const communLigne: SyntheseData["commun"] = {
    label: COMMUN_MEMBRE.label,
    color: COMMUN_MEMBRE.couleur,
    revenus: revCommun,
    charges: communes,
  };

  const repartitionBudget: SyntheseData["repartitionBudget"] = [
    { label: "Charges communes", montant: communes, color: COMMUN_MEMBRE.couleur },
    { label: `Perso ${prenom1}`, montant: perso1, color: "#378ADD" },
    { label: `Perso ${prenom2}`, montant: perso2, color: "#1D9E75" },
    { label: "Épargne prévue", montant: epargneMensuelle, color: "#7F77DD" },
    { label: "Reste à vivre", montant: Math.max(0, resteAVivre), color: "#10b981" },
  ];

  const echeancesBrutes = calculerEcheances(charges, projets, soldeEpargneReel, dateRef);
  const echeances = echeancesBrutes.slice(0, 5);

  const projection = projeterSoldeNet(revenus, charges, epargneMensuelle, dateRef);

  const exceptionnel = revenus.some(
    (r) => r.actif && r.montantParMois && (r.montantParMois[moisNum] ?? 0) > 0,
  );
  const libelleSecondaireRevenus = exceptionnel ? "Revenu exceptionnel ce mois" : "Stable ce mois";

  const libelleSecondaireCharges = analyse.estCharge
    ? `+${analyse.excedent} € vs mois normal`
    : "Dans la moyenne habituelle";

  const pourcentageRavSurRevenus = revenusTotal > 0 ? Math.round((resteAVivre / revenusTotal) * 100) : 0;

  return {
    moisLabel,
    revenus: revenusTotal,
    charges: chargesTotal,
    resteAVivre,
    soldeEpargneReel,
    soldeEpargneAttendu: soldeAttendu,
    ecartEpargne: ecart,
    statutEpargne: statut,
    alerteMois,
    repartitionBudget,
    membres: membresLignes,
    commun: communLigne,
    echeances,
    projection,
    libelleSecondaireRevenus,
    libelleSecondaireCharges,
    chargesTonSurcote: analyse.estCharge,
    pourcentageRavSurRevenus,
    totalChargesCommunes: communes,
  };
}
