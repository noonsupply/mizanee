"use client";

import { formatEur } from "@/lib/calculs";
import styles from "./EpargneMetrics.module.css";

export interface EpargneMetricsProps {
  epargneMensuelle: number;
  projetsActifs: number;
  soldeReel: number;
  soldeAttendu: number;
  ecartEpargne: number;
  statutEpargne: "avance" | "ok" | "retard";
  totalObjectifs: number;
}

export function EpargneMetrics({
  epargneMensuelle,
  projetsActifs,
  soldeReel,
  ecartEpargne,
  statutEpargne,
  totalObjectifs,
}: EpargneMetricsProps) {
  const soldeValueClass =
    statutEpargne === "avance" ? styles.valueAvance : statutEpargne === "retard" ? styles.valueRetard : "";

  const soldeHint =
    statutEpargne === "avance"
      ? { text: `En avance +${formatEur(ecartEpargne)}`, className: styles.hintAvance }
      : statutEpargne === "retard"
        ? { text: `Retard -${formatEur(Math.abs(ecartEpargne))}`, className: styles.hintRetard }
        : { text: "À jour", className: styles.hintOk };

  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <p className={styles.label}>Épargne / mois</p>
        <p className={styles.value}>{formatEur(epargneMensuelle)}</p>
        <p className={styles.hint}>Hypothèse fixe</p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Projets actifs</p>
        <p className={styles.value}>{projetsActifs}</p>
        <p className={styles.hint}>Statut en cours</p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Solde compte</p>
        <p className={`${styles.value} ${soldeValueClass}`}>{formatEur(soldeReel)}</p>
        <p className={`${styles.hint} ${soldeHint.className}`}>{soldeHint.text}</p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Total objectifs</p>
        <p className={styles.value}>{formatEur(totalObjectifs)}</p>
        <p className={styles.hint}>Somme des cibles</p>
      </article>
    </div>
  );
}
