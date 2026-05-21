"use client";

import { formatEur } from "@/lib/calculs";
import { libelleMoisYm } from "@/hooks/useVirements";
import type { ResumeCommun } from "@/types/virements";
import styles from "./CompteCommunResume.module.css";

export interface CompteCommunResumeProps {
  resume: ResumeCommun;
  onMoisPrecedent: () => void;
  onMoisSuivant: () => void;
}

export function CompteCommunResume({ resume, onMoisPrecedent, onMoisSuivant }: CompteCommunResumeProps) {
  const manqueClass =
    resume.manque < 0 ? styles.manqueNeg : resume.manque > 0 ? styles.manqueOk : styles.manqueZero;

  return (
    <section aria-labelledby="compte-commun-resume-title">
      <div className={styles.monthNav}>
        <button type="button" className={styles.monthBtn} onClick={onMoisPrecedent} aria-label="Mois précédent">
          ←
        </button>
        <span className={styles.monthLabel}>{libelleMoisYm(resume.mois)}</span>
        <button type="button" className={styles.monthBtn} onClick={onMoisSuivant} aria-label="Mois suivant">
          →
        </button>
      </div>

      <div className={styles.card}>
        <h2 id="compte-commun-resume-title" className={styles.title}>
          Compte commun — {libelleMoisYm(resume.mois)}
        </h2>
        <div className={styles.grid}>
          <div>
            <p className={styles.cellLabel}>Charges communes</p>
            <p className={styles.cellValue}>{formatEur(resume.chargesCommunes)}</p>
          </div>
          <div>
            <p className={styles.cellLabel}>Total viré</p>
            <p className={styles.cellValue}>{formatEur(resume.totalVire)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className={styles.cellLabel}>Manque</p>
            <p className={`${styles.cellValue} ${manqueClass}`}>
              {formatEur(resume.manque)}
              {resume.manque < 0 ? " ⚠️" : resume.manque === 0 ? "" : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
