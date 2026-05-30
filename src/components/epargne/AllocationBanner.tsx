"use client";

import { useMemo } from "react";
import { formatEur } from "@/lib/calculs";
import type { ProjetAlloue } from "@/types/projets";
import styles from "./AllocationBanner.module.css";

export interface AllocationBannerProps {
  projetsAlloues: ProjetAlloue[];
  soldeDisponible: number;
}

const MAX_LIGNES = 3;

function barClass(statut: ProjetAlloue["statutAllocation"]): string {
  if (statut === "finance") return styles.barFinance;
  if (statut === "partiel") return styles.barPartiel;
  return styles.barVide;
}

export function AllocationBanner({ projetsAlloues, soldeDisponible }: AllocationBannerProps) {
  const ordre = useMemo(
    () =>
      [...projetsAlloues].sort((a, b) => {
        if (a.moisRestants !== b.moisRestants) return a.moisRestants - b.moisRestants;
        return a.priorite - b.priorite;
      }),
    [projetsAlloues],
  );

  const totalAlloue = useMemo(
    () => ordre.reduce((acc, p) => acc + p.montantAlloue, 0),
    [ordre],
  );

  const epargneTotale = useMemo(
    () =>
      ordre
        .filter((p) => p.statutAllocation !== "finance")
        .reduce((acc, p) => acc + p.epargneMensuelleRequise, 0),
    [ordre],
  );

  const visibles = ordre.filter((p) => p.montantAlloue > 0).slice(0, MAX_LIGNES);
  const reste = ordre.length - visibles.length;
  const soldeEpuise = totalAlloue >= soldeDisponible;

  return (
    <section className={styles.banner} aria-label="Répartition du solde épargne">
      <p className={styles.title}>{formatEur(totalAlloue)} alloués</p>
      <p className={styles.subtitle}>Répartis dans l&apos;ordre d&apos;urgence puis de priorité</p>

      <div className={styles.list}>
        {visibles.map((p) => (
          <div key={p.id} className={styles.line}>
            <div className={styles.lineTop}>
              <span className={styles.dot} style={{ backgroundColor: p.color }} aria-hidden />
              <span className={styles.lineLabel}>{p.label}</span>
              <span className={styles.lineValue}>
                {formatEur(p.montantAlloue)} alloués
                {p.statutAllocation === "finance" ? <span className={styles.check}> ✓</span> : null}
              </span>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${barClass(p.statutAllocation)}`}
                style={{ width: `${Math.min(100, p.progressionReelle)}%` }}
              />
            </div>
          </div>
        ))}

        {reste > 0 ? (
          <div className={styles.line}>
            <div className={styles.lineTop}>
              <span className={`${styles.dot} ${styles.dotMuted}`} aria-hidden />
              <span className={`${styles.lineLabel} ${styles.muted}`}>
                {reste} autre{reste > 1 ? "s" : ""}
              </span>
              <span className={`${styles.lineValue} ${styles.muted}`}>
                {soldeEpuise ? "0 € — solde épuisé" : "0 € alloués"}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>Pour financer tous les projets</span>
        <span className={styles.footerValue}>épargner {formatEur(epargneTotale)}/mois</span>
      </div>
    </section>
  );
}
