"use client";

import Link from "next/link";
import { formatEur } from "@/lib/calculs";
import type { ProjetAlloue } from "@/types/projets";
import styles from "./EpargneMetrics.module.css";

export interface EpargneMetricsProps {
  soldeDisponible: number;
  projetsFinances: number;
  totalProjets: number;
  projetUrgent?: ProjetAlloue;
  totalObjectifs: number;
}

export function EpargneMetrics({
  soldeDisponible,
  projetsFinances,
  totalProjets,
  projetUrgent,
  totalObjectifs,
}: EpargneMetricsProps) {
  const soldeNonRenseigne = soldeDisponible <= 0;
  const projetFinanceLabel = projetsFinances > 0 ? `${projetsFinances} projet${projetsFinances > 1 ? "s" : ""} couvert${projetsFinances > 1 ? "s" : ""}` : "Aucun couvert";

  const urgentMontant = projetUrgent ? projetUrgent.montantManquant : 0;
  const urgentActif = Boolean(projetUrgent);

  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <p className={styles.label}>Solde épargne</p>
        {soldeNonRenseigne ? (
          <Link href="/dashboard" className={styles.badgeRenseigner}>
            À renseigner
          </Link>
        ) : (
          <p className={styles.value}>{formatEur(soldeDisponible)}</p>
        )}
        <Link href="/dashboard" className={styles.linkHint}>
          {soldeNonRenseigne ? "Définir depuis la synthèse" : "Aujourd'hui · modifier"}
        </Link>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Projets financés</p>
        <p className={styles.value}>
          {projetsFinances} / {totalProjets}
        </p>
        <p className={styles.hint}>{projetFinanceLabel}</p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Besoin urgent</p>
        <p className={`${styles.value} ${urgentActif ? styles.valueRetard : ""}`}>
          {urgentActif ? formatEur(urgentMontant) : "—"}
        </p>
        <p className={`${styles.hint} ${urgentActif ? styles.hintRetard : styles.hintOk}`}>
          {projetUrgent ? `${projetUrgent.label} · dans ${projetUrgent.moisRestants} mois` : "Aucun projet urgent"}
        </p>
      </article>

      <article className={styles.card}>
        <p className={styles.label}>Total objectifs</p>
        <p className={styles.value}>{formatEur(totalObjectifs)}</p>
        <p className={styles.hint}>Sur {totalProjets} projet{totalProjets > 1 ? "s" : ""}</p>
      </article>
    </div>
  );
}
