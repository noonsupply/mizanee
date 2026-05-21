"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { MembreRevenu } from "@/data/membres";
import { ChargeFormEdit } from "@/components/charges/ChargeFormEdit";
import { couleurPourMembre, labelPourMembre } from "@/lib/commun-membre";
import { calculerTotalAnnuelCharge, calculerTotalFoyerChargesMensuel, libelleTypeCharge } from "@/lib/calculs-charges";
import { formatEur } from "@/lib/calculs";
import type { ChargeFoyer } from "@/types/charges";
import styles from "./ChargeList.module.css";

export interface ChargeListProps {
  charges: ChargeFoyer[];
  membres: MembreRevenu[];
  isLoading?: boolean;
  isMutating?: boolean;
  onUpdate: (id: string, charge: ChargeFoyer) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onAddCta?: () => void;
}

export function ChargeList({
  charges,
  membres,
  isLoading,
  isMutating,
  onUpdate,
  onRemove,
  onAddCta,
}: ChargeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const actives = charges.filter((c) => c.actif);
  const total = calculerTotalFoyerChargesMensuel(actives);

  if (isLoading) {
    return (
      <div className={styles.root} aria-busy="true">
        <div className={styles.header}>
          <p className={styles.headerTitle}>Toutes les charges</p>
        </div>
        <div className={styles.scroll}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="my-3 h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Toutes les charges</h2>
        <p className={styles.headerSub}>Nature, moyenne mensuelle et total annuel estimé</p>
      </div>

      <div className={styles.scroll}>
        {actives.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucune charge enregistrée.</p>
            {onAddCta && (
              <button type="button" className={styles.emptyCta} onClick={onAddCta}>
                Ajouter une charge →
              </button>
            )}
          </div>
        ) : (
          <ul>
            {actives.map((c) => {
              const annuel = calculerTotalAnnuelCharge(c);
              const couleur = couleurPourMembre(c.membreId, membres);
              const isEditing = editingId === c.id;
              const isConfirming = confirmDeleteId === c.id;

              return (
                <li key={c.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.dot} style={{ backgroundColor: couleur }} aria-hidden />
                    <div className={styles.body}>
                      <p className={styles.label}>{c.label}</p>
                      <p className={styles.meta}>
                        {libelleTypeCharge(c.type)} · {labelPourMembre(c.membreId, membres)}
                        {c.verseLe ? ` · Versé le ${c.verseLe}` : ""}
                      </p>
                    </div>
                    <div className={styles.amounts}>
                      <p className={styles.amountMain}>{formatEur(c.montantMensuel)}</p>
                      <p className={styles.amountSub}>moy. / mois</p>
                      <p className={styles.amountSub}>{formatEur(annuel)} / an</p>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className={styles.confirmBar} role="group" aria-label="Confirmer la suppression">
                      <button
                        type="button"
                        className={`${styles.confirmBtn} ${styles.confirmDelete}`}
                        disabled={isMutating}
                        onClick={() => {
                          void onRemove(c.id).then(() => setConfirmDeleteId(null));
                        }}
                      >
                        Supprimer ?
                      </button>
                      <button
                        type="button"
                        className={`${styles.confirmBtn} ${styles.confirmCancel}`}
                        disabled={isMutating}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        disabled={isMutating}
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setEditingId(c.id);
                        }}
                        aria-label={`Modifier ${c.label}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        disabled={isMutating}
                        onClick={() => {
                          setEditingId(null);
                          setConfirmDeleteId(c.id);
                        }}
                        aria-label={`Supprimer ${c.label}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <ChargeFormEdit
                      charge={c}
                      membres={membres}
                      isSubmitting={isMutating}
                      onSave={async (updated) => {
                        await onUpdate(c.id, updated);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>Total foyer (mensuel)</span>
        <span className={styles.footerTotal}>{formatEur(total)}</span>
      </div>
    </div>
  );
}
