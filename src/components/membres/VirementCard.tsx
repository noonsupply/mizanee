"use client";

import { useEffect, useState } from "react";
import { formatEur } from "@/lib/calculs";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { SoldeCumulChart } from "@/components/membres/SoldeCumulChart";
import type { VirementLigne, VirementSoldeMembre } from "@/types/virements";
import styles from "./VirementCard.module.css";

export interface VirementCardProps {
  ligne: VirementLigne;
  mois: string;
  solde?: VirementSoldeMembre;
  disabled?: boolean;
  onSaveMontant: (montantVerse: number) => Promise<void>;
  onSaveNote: (note: string | null) => Promise<void>;
}

export function VirementCard({ ligne, mois, solde, disabled, onSaveMontant, onSaveNote }: VirementCardProps) {
  const [montantDraft, setMontantDraft] = useState(String(ligne.montantVerse));
  const [noteDraft, setNoteDraft] = useState(ligne.note ?? "");

  useEffect(() => {
    setMontantDraft(String(ligne.montantVerse));
    setNoteDraft(ligne.note ?? "");
  }, [ligne.montantVerse, ligne.note, ligne.membreId]);

  const debouncedMontant = useDebouncedCallback((value: string) => {
    const n = Number(value.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(n) || n < 0) return;
    void onSaveMontant(n);
  }, 800);

  const debouncedNote = useDebouncedCallback((value: string) => {
    void onSaveNote(value.trim() || null);
  }, 800);

  const ecartClass =
    ligne.ecart < 0 ? styles.ecartNeg : ligne.ecart > 0 ? styles.ecartPos : styles.ecartZero;

  const soldeCumule = solde?.soldeCumule ?? ligne.ecart;
  const soldeOk = soldeCumule >= 0;

  return (
    <article className={styles.card} aria-labelledby={`virement-${ligne.membreId}`}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ backgroundColor: ligne.couleur }} aria-hidden />
        <h3 id={`virement-${ligne.membreId}`} className={styles.name}>
          {ligne.emoji ? `${ligne.emoji} ` : ""}
          {ligne.prenom}
        </h3>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Doit virer ce mois</span>
        <span className={styles.rowValue}>{formatEur(ligne.doitVirer)}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>A viré</span>
        <div className={styles.inputWrap}>
          <input
            type="number"
            min={0}
            step={1}
            className={styles.montantInput}
            value={montantDraft}
            disabled={disabled}
            aria-label={`Montant viré par ${ligne.prenom} pour ${mois}`}
            onChange={(e) => {
              setMontantDraft(e.target.value);
              debouncedMontant(e.target.value);
            }}
          />
        </div>
      </div>

      <div className={`${styles.row} ${styles.inlineStats}`}>
        <div>
          <span className={styles.rowLabel}>Écart </span>
          <span className={`${styles.rowValue} ${ecartClass}`}>
            {formatEur(ligne.ecart)}
            {ligne.ecart < 0 ? " ⚠️" : ""}
          </span>
        </div>
        <div>
          <span className={styles.rowLabel}>Solde cumulé </span>
          <span className={`${styles.rowValue} ${soldeOk ? styles.ecartPos : styles.ecartNeg}`}>
            {formatEur(soldeCumule)}
            {soldeOk && soldeCumule === 0 ? " ✅" : soldeOk ? " ✅" : ""}
          </span>
        </div>
      </div>

      {solde && solde.historique.length > 0 && (
        <div className={styles.chartWrap}>
          <SoldeCumulChart historique={solde.historique} couleur={ligne.couleur} />
        </div>
      )}

      <textarea
        className={styles.note}
        placeholder="Note optionnelle…"
        value={noteDraft}
        disabled={disabled}
        aria-label={`Note pour ${ligne.prenom}`}
        onChange={(e) => {
          setNoteDraft(e.target.value);
          debouncedNote(e.target.value);
        }}
      />
    </article>
  );
}
