# SPEC.md — Foyer Finance
> Contrat partagé entre Agent Frontend et Agent Backend.
> Toute modification de ce fichier doit être validée par le chef de projet.

---

## Vision produit

Application web de gestion financière pour foyers multi-personnes.
Chaque foyer peut avoir de 1 à N membres. Chacun gère ses charges perso,
contribue aux charges communes selon un prorata configurable, et suit
ses projets d'épargne avec simulation en temps réel.

---

## Stack technique

| Couche        | Techno                                      |
|---------------|---------------------------------------------|
| Framework     | Next.js 14 (App Router)                     |
| Langage       | TypeScript strict                           |
| Style         | Tailwind CSS + shadcn/ui                    |
| Auth          | NextAuth.js v5 (Google + Email magic link)  |
| BDD           | PostgreSQL via Prisma ORM                   |
| State client  | Zustand                                     |
| Formulaires   | React Hook Form + Zod                       |
| Charts        | Chart.js + react-chartjs-2                  |
| Drag & Drop   | @dnd-kit                                    |
| Emails        | Resend                                      |
| Déploiement   | Vercel                                      |

---

## Arborescence projet

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx               ← étape 1 : nom du foyer
│   │       ├── membres/page.tsx       ← étape 2 : ajout membres
│   │       ├── revenus/page.tsx       ← étape 3 : revenus
│   │       ├── charges/page.tsx       ← étape 4 : charges
│   │       └── projets/page.tsx       ← étape 5 : projets épargne
│   ├── (app)/
│   │   ├── layout.tsx                 ← sidebar + header
│   │   ├── dashboard/page.tsx         ← synthèse foyer
│   │   ├── membres/
│   │   │   ├── page.tsx               ← liste membres
│   │   │   └── [id]/page.tsx          ← profil membre
│   │   ├── charges/page.tsx
│   │   ├── epargne/
│   │   │   ├── page.tsx               ← liste projets
│   │   │   └── [id]/page.tsx          ← détail projet
│   │   ├── projection/page.tsx
│   │   ├── simulations/page.tsx       ← simulateur what-if
│   │   └── settings/
│   │       ├── page.tsx               ← settings foyer
│   │       └── profil/page.tsx        ← settings compte
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── foyer/route.ts
│       ├── membres/
│       │   ├── route.ts               ← GET /membres, POST
│       │   └── [id]/route.ts          ← GET, PATCH, DELETE
│       ├── revenus/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── charges/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── projets/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── simulations/route.ts
├── components/
│   ├── onboarding/
│   │   ├── StepIndicator.tsx
│   │   ├── StepFoyer.tsx
│   │   ├── StepMembres.tsx
│   │   ├── StepRevenus.tsx
│   │   ├── StepCharges.tsx
│   │   └── StepProjets.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── NavMobile.tsx
│   │   └── UserMenu.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── DonutChart.tsx
│   │   ├── RepartitionCard.tsx
│   │   └── AlerteCard.tsx
│   ├── membres/
│   │   ├── MembreCard.tsx
│   │   ├── MembreForm.tsx             ← ajout / édition membre
│   │   ├── MembreAvatar.tsx
│   │   └── RepartitionSlider.tsx      ← ajuster le % prorata
│   ├── charges/
│   │   ├── ChargesList.tsx
│   │   ├── ChargeForm.tsx
│   │   └── ChargesBarChart.tsx
│   ├── epargne/
│   │   ├── ProjetCard.tsx
│   │   ├── ProjetForm.tsx
│   │   ├── DateCiblePicker.tsx        ← glisse la date → recalcul
│   │   ├── FaisabiliteAlert.tsx
│   │   └── ProjetDragList.tsx         ← réordonne par priorité
│   ├── projection/
│   │   ├── SoldeLineChart.tsx
│   │   ├── ProjectionTable.tsx
│   │   └── CumulEpargneChart.tsx
│   ├── simulations/
│   │   ├── SimulateurPanel.tsx
│   │   ├── ScenarioCard.tsx
│   │   └── ImpactChart.tsx
│   └── ui/                            ← shadcn/ui components
├── lib/
│   ├── calculs.ts                     ← logique financière pure
│   ├── validations.ts                 ← schémas Zod
│   ├── auth.ts                        ← config NextAuth
│   └── prisma.ts                      ← client Prisma
├── store/
│   ├── useFoyerStore.ts               ← state global Zustand
│   └── useSimulationStore.ts
├── hooks/
│   ├── useMembres.ts
│   ├── useCharges.ts
│   ├── useProjets.ts
│   └── useProjection.ts
└── types/
    └── index.ts                       ← tous les types partagés
```

---

## Schéma base de données (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  foyer         Foyer?    @relation(fields: [foyerId], references: [id])
  foyerId       String?
  membre        Membre?
  accounts      Account[]
  sessions      Session[]
}

model Foyer {
  id        String    @id @default(cuid())
  nom       String
  createdAt DateTime  @default(now())
  membres   Membre[]
  charges   Charge[]
  projets   Projet[]
  users     User[]
}

model Membre {
  id        String    @id @default(cuid())
  prenom    String
  couleur   String    @default("#378ADD")   // couleur avatar
  emoji     String?                          // emoji avatar
  actif     Boolean   @default(true)
  foyerId   String
  foyer     Foyer     @relation(fields: [foyerId], references: [id])
  userId    String?   @unique
  user      User?     @relation(fields: [userId], references: [id])
  revenus   Revenu[]
  charges   Charge[]  @relation("ChargesMembre")
  projets   Projet[]  @relation("ProjetsMembre")
  prorata   Float     @default(0)           // % calculé automatiquement
  createdAt DateTime  @default(now())
}

model Revenu {
  id        String    @id @default(cuid())
  label     String
  montant   Float
  type      RevenuType
  membreId  String
  membre    Membre    @relation(fields: [membreId], references: [id])
  actif     Boolean   @default(true)
  createdAt DateTime  @default(now())
}

enum RevenuType {
  SALAIRE
  LOCATIF
  FREELANCE
  AUTRE
}

model Charge {
  id        String      @id @default(cuid())
  label     String
  montant   Float
  categorie ChargeCategorie
  type      ChargeType  @default(COMMUNE)
  membreId  String?
  membre    Membre?     @relation("ChargesMembre", fields: [membreId], references: [id])
  foyerId   String
  foyer     Foyer       @relation(fields: [foyerId], references: [id])
  actif     Boolean     @default(true)
  createdAt DateTime    @default(now())
}

enum ChargeType {
  COMMUNE
  PERSONNELLE
}

enum ChargeCategorie {
  LOGEMENT
  ALIMENTATION
  TRANSPORT
  EDUCATION
  LOISIRS
  SANTE
  ABONNEMENTS
  AUTRE
}

model Projet {
  id               String       @id @default(cuid())
  label            String
  montant          Float
  dateCible        DateTime
  epargneMensuelle Float        // calculée automatiquement
  priorite         Int          @default(1)
  statut           ProjetStatut @default(EN_COURS)
  couleur          String       @default("#378ADD")
  emoji            String?
  foyerId          String
  foyer            Foyer        @relation(fields: [foyerId], references: [id])
  membres          Membre[]     @relation("ProjetsMembre")
  createdAt        DateTime     @default(now())
}

enum ProjetStatut {
  EN_COURS
  ATTEINT
  REPORTE
  ABANDONNE
}
```

---

## Fonctionnalités détaillées

### AUTH & ONBOARDING

#### Authentification (NextAuth v5)
- [ ] Login Google OAuth
- [ ] Login Email magic link (sans mot de passe)
- [ ] Page login avec les deux options
- [ ] Redirection post-login : si nouveau → onboarding, sinon → dashboard
- [ ] Protection des routes (auth middleware)
- [ ] Déconnexion depuis le menu utilisateur

#### Parcours onboarding guidé (5 étapes)
- [ ] Indicateur de progression (step 1/5)
- [ ] Étape 1 — Nom du foyer (ex: "Famille Dupont", "Chez nous 🏠")
- [ ] Étape 2 — Membres : ajouter membres avec prénom, couleur, emoji
- [ ] Étape 3 — Revenus : saisir salaire + autres revenus par membre
- [ ] Étape 4 — Charges : communes puis personnelles par membre
- [ ] Étape 5 — Projets d'épargne : ajouter projets avec date cible
- [ ] Possibilité de revenir en arrière sans perdre les données
- [ ] Sauvegarde en base à chaque étape
- [ ] Skip possible (compléter plus tard)

---

### MEMBRES

- [ ] Ajouter un membre (prénom, couleur avatar, emoji)
- [ ] Modifier le prénom d'un membre
- [ ] Modifier couleur et emoji avatar
- [ ] Désactiver un membre (sans supprimer ses données)
- [ ] Supprimer un membre (avec confirmation + gestion des données liées)
- [ ] Lier un membre à un compte utilisateur (invite par email)
- [ ] Prorata des charges communes :
  - Calcul automatique au prorata des revenus (défaut)
  - Slider manuel pour ajuster le % de chaque membre
  - Visualisation en temps réel de la contribution de chacun
- [ ] Page profil membre : ses revenus, ses charges, son épargne, son reste à vivre

---

### REVENUS

- [ ] Ajouter un revenu par membre (salaire, locatif, freelance, autre)
- [ ] Modifier / supprimer un revenu
- [ ] Revenus actifs / inactifs (simulation changement de situation)
- [ ] Total revenus foyer calculé en temps réel

---

### CHARGES

- [ ] Ajouter une charge commune (logement, abonnements, éducation…)
- [ ] Ajouter une charge personnelle liée à un membre
- [ ] Modifier / supprimer une charge
- [ ] Catégories avec icône et couleur
- [ ] Charges actives / inactives
- [ ] Répartition automatique des charges communes par prorata
- [ ] Visualisation : barre par membre + total commun

---

### ÉPARGNE & PROJETS

- [ ] Ajouter un projet (label, montant cible, date cible, emoji, couleur)
- [ ] Modifier un projet
- [ ] Supprimer un projet (avec confirmation)
- [ ] **Date cible glissante** : changer la date → recalcul automatique de l'épargne mensuelle nécessaire
- [ ] Alerte faisabilité : rouge si épargne requise > reste à vivre disponible
- [ ] Suggestion automatique : "Décaler de 3 mois rend ce projet faisable"
- [ ] Drag & drop pour réordonner les priorités
- [ ] Statuts : En cours / Atteint / Reporté / Abandonné
- [ ] Associer un projet à un ou plusieurs membres
- [ ] Vue détail projet : courbe de progression, historique, projection
- [ ] Solde cumulé du compte épargne sur 12 mois (tous projets confondus)

---

### PROJECTION

- [ ] Courbe du solde mensuel net sur 12 mois
- [ ] Courbe du solde cumulé épargne
- [ ] Tableau mensuel complet (charges, revenus, solde net, épargne)
- [ ] Mise en évidence des mois tendus (charges exceptionnelles)
- [ ] Export PDF du bilan mensuel

---

### SIMULATEUR "ET SI…"

- [ ] Simuler un changement de salaire d'un membre (durée, montant)
- [ ] Simuler un congé parental / arrêt maladie
- [ ] Simuler une nouvelle charge (ex: crédit voiture)
- [ ] Simuler la suppression d'une charge (ex: fin de loyer)
- [ ] Voir l'impact sur tous les projets d'épargne
- [ ] Comparer scénario actuel vs simulé côte à côte
- [ ] Sauvegarder un scénario pour y revenir

---

### SETTINGS

#### Foyer
- [ ] Modifier le nom du foyer
- [ ] Changer l'emoji du foyer
- [ ] Inviter un membre à créer un compte lié
- [ ] Gérer les accès (qui peut modifier quoi)
- [ ] Supprimer le foyer (avec confirmation forte)

#### Profil utilisateur
- [ ] Modifier son prénom / nom
- [ ] Changer son avatar
- [ ] Gérer ses notifications (alertes projets, résumé mensuel)
- [ ] Supprimer son compte

---

### NOTIFICATIONS & ALERTES

- [ ] Alerte si un projet devient infaisable
- [ ] Alerte si le reste à vivre d'un membre passe sous un seuil
- [ ] Résumé mensuel par email (1er du mois)
- [ ] Rappel si un projet approche de sa date cible sans être atteint

---

## API Routes

### Membres
```
GET    /api/membres              → liste membres du foyer
POST   /api/membres              → créer un membre
PATCH  /api/membres/[id]         → modifier prénom, couleur, emoji, prorata
DELETE /api/membres/[id]         → supprimer ou désactiver
```

### Revenus
```
GET    /api/revenus              → tous les revenus du foyer
POST   /api/revenus              → ajouter un revenu
PATCH  /api/revenus/[id]         → modifier
DELETE /api/revenus/[id]         → supprimer
```

### Charges
```
GET    /api/charges              → toutes les charges
POST   /api/charges              → créer
PATCH  /api/charges/[id]         → modifier
DELETE /api/charges/[id]         → supprimer
```

### Projets
```
GET    /api/projets              → tous les projets
POST   /api/projets              → créer
PATCH  /api/projets/[id]         → modifier (dont dateCible → recalcul auto)
DELETE /api/projets/[id]         → supprimer
PATCH  /api/projets/reorder      → réordonner les priorités
```

### Simulations
```
POST   /api/simulations          → calculer un scénario (sans persister)
POST   /api/simulations/save     → sauvegarder un scénario
GET    /api/simulations          → liste des scénarios sauvegardés
DELETE /api/simulations/[id]     → supprimer un scénario
```

---

## Logique métier (lib/calculs.ts)

```typescript
// Prorata des charges communes
calculerProrata(membres: Membre[]): Record<string, number>

// Reste à vivre par membre
calculerResteAVivre(membre: Membre, chargesCommunes: number): number

// Épargne mensuelle nécessaire pour un projet
calculerEpargneMensuelle(montant: number, dateCible: Date): number

// Faisabilité d'un projet
estFaisable(projet: Projet, resteAVivre: number): boolean

// Mois minimum pour rendre un projet faisable
moisPourFaisabilite(projet: Projet, resteAVivre: number): number

// Projection solde sur N mois
projeterSolde(foyer: Foyer, mois: number): ProjectionMois[]

// Impact d'un scénario sur les projets
simulerImpact(foyer: Foyer, scenario: Scenario): ImpactResult
```

---

## Types partagés (types/index.ts)

```typescript
export interface MembreUI {
  id: string
  prenom: string
  couleur: string
  emoji?: string
  revenus: RevenuUI[]
  charges: ChargeUI[]
  prorata: number
  resteAVivre: number
}

export interface ProjetUI {
  id: string
  label: string
  montant: number
  dateCible: Date
  epargneMensuelle: number
  priorite: number
  statut: 'EN_COURS' | 'ATTEINT' | 'REPORTE' | 'ABANDONNE'
  couleur: string
  emoji?: string
  faisable: boolean
  moisManquants?: number
}

export interface ProjectionMois {
  mois: string
  revenus: number
  chargesCommunes: number
  chargesPerso: Record<string, number>
  epargne: number
  soldeNet: number
  soldeCumule: number
}

export interface Scenario {
  label: string
  modifications: {
    membreId: string
    type: 'SALAIRE' | 'CHARGE_NOUVELLE' | 'CHARGE_SUPPRIMEE' | 'CONGE'
    valeur: number
    debut: Date
    fin: Date
  }[]
}
```

---

## Règles pour les agents

### Agent Frontend
- Travailler uniquement dans `src/components/`, `src/app/(app)/`, `src/app/(auth)/`, `src/store/`, `src/hooks/`
- Ne jamais toucher à `src/app/api/` ni `prisma/`
- Utiliser les types de `src/types/index.ts`
- Appeler les hooks (`useMembres`, `useCharges`, etc.) — jamais fetch directement
- Tailwind uniquement, pas de CSS inline sauf exception justifiée
- Composants shadcn/ui pour tous les éléments de formulaire

### Agent Backend
- Travailler uniquement dans `src/app/api/`, `src/lib/`, `prisma/`, `src/types/`
- Ne jamais toucher aux composants UI
- Toujours valider les inputs avec Zod avant de toucher la BDD
- Toujours vérifier que l'utilisateur appartient au foyer (sécurité)
- Retourner des erreurs typées et cohérentes

### Règles communes
- TypeScript strict — pas de `any`
- Chaque fonction dans `calculs.ts` doit avoir des tests unitaires
- Documenter les fonctions complexes avec JSDoc
- Consulter ce SPEC.md avant toute décision d'architecture
```