"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { formatEur } from "@/lib/calculs";
import {
  calculerMontantMinimum,
  genererEcheancier,
  type LigneMois,
} from "@/lib/calculs-echeancier";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { ProjetAlloue } from "@/types/projets";
import styles from "./Echeancier.module.css";

export interface EcheancierProps {
  projets: ProjetAlloue[];
  soldeInitial: number;
  /** Reste à vivre du mois (revenus - charges) */
  resteAVivre: number;
  /** Somme des epargneMensuelleRequise */
  epargneMensuelleRecommandee: number;
}

interface Raccourci {
  montant: number;
  label: string;
  recommande?: boolean;
}

function moisDeProjet(projets: ProjetAlloue[], lignes: LigneMois[]) {
  const statutParId = new Map<string, "ok" | "risque">();
  for (const p of projets) {
    if (p.statut !== "en_cours") continue;
    const ligne = lignes.find((l) => l.moisStr === p.date);
    if (ligne && ligne.projetsFinances.some((f) => f.id === p.id)) {
      statutParId.set(p.id, "ok");
    } else {
      statutParId.set(p.id, "risque");
    }
  }
  return statutParId;
}

export function Echeancier({
  projets,
  soldeInitial,
  resteAVivre,
  epargneMensuelleRecommandee,
}: EcheancierProps) {
  const recommande = Math.round(epargneMensuelleRecommandee);
  const minimum = Math.round(calculerMontantMinimum(projets));

  const [montantInput, setMontantInput] = useState<string>(String(recommande));
  const [montantApplique, setMontantApplique] = useState<number>(recommande);

  const appliquerDebounce = useDebouncedCallback((v: number) => {
    setMontantApplique(v);
  }, 300);

  const onChangeMontant = (value: string) => {
    setMontantInput(value);
    const n = Number(value);
    appliquerDebounce(Number.isFinite(n) && n >= 0 ? n : 0);
  };

  const choisir = (montant: number) => {
    setMontantInput(String(montant));
    setMontantApplique(montant);
  };

  const lignes = useMemo(
    () => genererEcheancier(projets, soldeInitial, montantApplique, 10),
    [projets, soldeInitial, montantApplique],
  );

  const statutProjets = useMemo(() => moisDeProjet(projets, lignes), [projets, lignes]);

  const moisCourantLabel = useMemo(
    () => new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    [],
  );

  const raccourcis = useMemo<Raccourci[]>(() => {
    const plus50 = Math.round(recommande * 1.5);
    const max = Math.max(0, Math.round(resteAVivre));
    const bruts: Raccourci[] = [
      { montant: minimum, label: "Minimum" },
      { montant: recommande, label: "Recommandé", recommande: true },
      { montant: plus50, label: "+50%" },
      { montant: max, label: "Tout dispo" },
    ];
    const vus = new Set<number>();
    return bruts.filter((r) => {
      if (r.montant <= 0 || vus.has(r.montant) || r.montant > max) return false;
      vus.add(r.montant);
      return true;
    });
  }, [minimum, recommande, resteAVivre]);

  const resteApresEpargne = Math.max(0, Math.round(resteAVivre) - Math.round(montantApplique));
  const ecart = recommande - Math.round(montantApplique);

  const projetsTries = useMemo(
    () =>
      [...projets]
        .filter((p) => p.statut === "en_cours")
        .sort((a, b) => a.moisRestants - b.moisRestants || a.priorite - b.priorite),
    [projets],
  );

  return (
    <div className={styles.wrapper}>
      <section className={styles.panel} aria-label="Épargne de ce mois-ci">
        <div className={styles.panelHead}>
          <p className={styles.panelTitle}>Ce mois-ci ({moisCourantLabel})</p>
          <p className={styles.panelSub}>Combien peux-tu mettre de côté ?</p>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <input
              type="number"
              min={0}
              max={Math.max(0, Math.round(resteAVivre))}
              step={10}
              className={styles.input}
              value={montantInput}
              onChange={(e) => onChangeMontant(e.target.value)}
              aria-label="Montant à épargner ce mois"
            />
            <span className={styles.inputSuffix}>€</span>
          </div>
          <span className={styles.dispo}>sur {formatEur(Math.max(0, Math.round(resteAVivre)))} disponibles</span>
        </div>

        {raccourcis.length > 0 ? (
          <div className={styles.raccourcis}>
            {raccourcis.map((r) => {
              const actif = Math.round(montantApplique) === r.montant;
              return (
                <button
                  key={`${r.label}-${r.montant}`}
                  type="button"
                  className={`${styles.chip} ${r.recommande ? styles.chipReco : ""} ${actif ? styles.chipActif : ""}`}
                  onClick={() => choisir(r.montant)}
                >
                  {formatEur(r.montant)}
                  {r.recommande ? <span className={styles.chipTag}>recommandé</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {Math.round(montantApplique) === 0 ? (
          <div className={`${styles.banner} ${styles.bannerRed}`}>
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <span>Attention, aucune épargne prévue ce mois-ci.</span>
          </div>
        ) : ecart > 0 ? (
          <div className={`${styles.banner} ${styles.bannerAmber}`}>
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              Tu épargnes {formatEur(ecart)} de moins que recommandé. Le plan ci-dessous montre le rattrapage
              nécessaire.
            </span>
          </div>
        ) : (
          <div className={`${styles.banner} ${styles.bannerGreen}`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            <span>Tous tes projets restent dans les temps.</span>
          </div>
        )}

        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Tu mets de côté</span>
            <span className={styles.summaryValue}>{formatEur(Math.round(montantApplique))}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Il te reste pour vivre</span>
            <span className={styles.summaryValue}>{formatEur(resteApresEpargne)}</span>
          </div>
        </div>
      </section>

      <section className={styles.panel} aria-label="Échéancier">
        <p className={styles.panelTitle}>Échéancier — plan de rattrapage</p>

        {projetsTries.length === 0 ? (
          <p className={styles.empty}>Aucun projet en cours.</p>
        ) : (
          <div className={styles.timeline}>
            {lignes.map((l, i) => {
              const rattrapage = !l.isToday && l.epargne > Math.round(montantApplique);
              if (l.isDeadline) {
                return (
                  <div key={l.moisStr} className={styles.deadlineRow}>
                    <div className={styles.deadlineHead}>
                      <span className={styles.moisDeadline}>{l.moisLabel}</span>
                      <span className={styles.badgeDeadline}>Deadline</span>
                      {l.epargne > 0 ? (
                        <span className={`${styles.epargne} ${rattrapage ? styles.epargneAmber : ""}`}>
                          +{formatEur(l.epargne)}
                        </span>
                      ) : null}
                    </div>
                    <div className={styles.deadlineProjets}>
                      {l.projetsFinances.map((p) => (
                        <div key={p.id} className={`${styles.projet} ${styles.projetOk}`}>
                          <span className={styles.dot} style={{ backgroundColor: p.color }} aria-hidden />
                          <span className={styles.projetLabel}>{p.label}</span>
                          <span className={styles.projetMontant}>{formatEur(p.montant)}</span>
                          <span className={styles.projetStatut}>
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Financé
                          </span>
                        </div>
                      ))}
                      {l.projetsManquants.map((p) => (
                        <div key={p.id} className={`${styles.projet} ${styles.projetKo}`}>
                          <span className={styles.dot} style={{ backgroundColor: p.color }} aria-hidden />
                          <span className={styles.projetLabel}>{p.label}</span>
                          <span className={styles.projetMontant}>{formatEur(p.montant)}</span>
                          <span className={styles.projetStatut}>
                            <XCircle className="h-3.5 w-3.5" aria-hidden /> Insuffisant
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className={styles.soldeApres}>Solde après : {formatEur(l.soldeApres)}</p>
                  </div>
                );
              }
              return (
                <div key={l.moisStr} className={`${styles.row} ${l.isToday ? styles.rowToday : ""}`}>
                  <span className={`${styles.mois} ${l.isToday ? styles.moisToday : ""}`}>
                    {l.isToday ? <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> : null}
                    {l.moisLabel}
                  </span>
                  <span className={styles.rowLabel}>
                    {l.isToday ? "Ce que tu mets" : rattrapage ? "Rattrapage" : "Épargne"}
                  </span>
                  <span className={`${styles.epargne} ${rattrapage ? styles.epargneAmber : ""}`}>
                    +{formatEur(l.epargne)}
                  </span>
                  <span className={styles.solde}>solde : {formatEur(l.soldeApres)}</span>
                </div>
              );
            })}
          </div>
        )}

        {projetsTries.length > 0 ? (
          <div className={styles.resume}>
            <p className={styles.resumeTitle}>Récapitulatif des projets</p>
            {projetsTries.map((p) => {
              const ok = statutProjets.get(p.id) === "ok";
              return (
                <div key={p.id} className={styles.resumeLine}>
                  <span className={styles.dot} style={{ backgroundColor: p.color }} aria-hidden />
                  <span className={styles.resumeLabel}>{p.label}</span>
                  <span className={styles.resumeMeta}>
                    {formatEur(p.montant)} · {p.moisRestants} mois
                  </span>
                  <span className={`${styles.resumeBadge} ${ok ? styles.resumeOk : styles.resumeRisque}`}>
                    {ok ? "Dans les temps" : "Risque retard"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
