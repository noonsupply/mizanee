export type PersonneId = "P1" | "P2";

export interface Personne {
  id: PersonneId;
  nom: string;
  revenu: number;
}

export interface Charge {
  id: string;
  label: string;
  montant: number;
  categorie: "commune" | PersonneId;
}

export interface ProjetEpargne {
  id: string;
  label: string;
  montantCible: number;
  dateObjectif: string; // YYYY-MM-DD
  montantDeja: number;
}

export const personnes: Personne[] = [
  { id: "P1", nom: "Personne 1", revenu: 1500 },
  { id: "P2", nom: "Personne 2", revenu: 3600 },
];

export const revenuLocatif = 1010;

export const chargesCommunes: Charge[] = [
  { id: "loyer", label: "Loyer", montant: 1363, categorie: "commune" },
  { id: "ecole", label: "École", montant: 252, categorie: "commune" },
  { id: "engie", label: "Engie", montant: 113, categorie: "commune" },
  { id: "box_appart", label: "Box appart", montant: 41, categorie: "commune" },
  { id: "box_maison", label: "Box maison", montant: 31, categorie: "commune" },
  { id: "assurances_sg", label: "Assurances SG", montant: 55, categorie: "commune" },
  { id: "assurance_voiture", label: "Assurance voiture", montant: 44, categorie: "commune" },
  { id: "virement_yaya", label: "Virement Yaya", montant: 25, categorie: "commune" },
];

export const chargesP1: Charge[] = [
  { id: "p1_courses", label: "Courses", montant: 100, categorie: "P1" },
  { id: "p1_fringues", label: "Fringues", montant: 30, categorie: "P1" },
  { id: "p1_ongles", label: "Ongles", montant: 20, categorie: "P1" },
  { id: "p1_portable", label: "Portable", montant: 16, categorie: "P1" },
  { id: "p1_anniversaires", label: "Anniversaires", montant: 33, categorie: "P1" },
  { id: "p1_cadeaux_aid", label: "Cadeaux Aïd", montant: 33, categorie: "P1" },
  { id: "p1_vetements_yaya", label: "Vêtements Yaya", montant: 17, categorie: "P1" },
];

export const chargesP2: Charge[] = [
  { id: "p2_courses", label: "Courses", montant: 150, categorie: "P2" },
  { id: "p2_essence", label: "Essence", montant: 150, categorie: "P2" },
  { id: "p2_peage", label: "Péage", montant: 150, categorie: "P2" },
  { id: "p2_fringues", label: "Fringues", montant: 50, categorie: "P2" },
];

export const projetsEpargneInitiaux: ProjetEpargne[] = [
  { id: "chambre", label: "Nouvelle chambre", montantCible: 2200, dateObjectif: "2026-09-01", montantDeja: 0 },
  { id: "vacances_ete", label: "Vacances été", montantCible: 6000, dateObjectif: "2026-07-01", montantDeja: 0 },
  { id: "omra", label: "Omra", montantCible: 3000, dateObjectif: "2027-03-01", montantDeja: 0 },
  { id: "japon", label: "Voyage Japon", montantCible: 6000, dateObjectif: "2027-09-01", montantDeja: 0 },
  { id: "vacances_jan", label: "Vacances Janvier", montantCible: 1200, dateObjectif: "2027-01-01", montantDeja: 0 },
  { id: "canape", label: "Canapé", montantCible: 1000, dateObjectif: "2026-10-01", montantDeja: 0 },
  { id: "piano", label: "Piano", montantCible: 600, dateObjectif: "2026-08-01", montantDeja: 0 },
];
