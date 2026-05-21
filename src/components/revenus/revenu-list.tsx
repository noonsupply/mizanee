"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenuFormEdit } from "@/components/revenus/RevenuFormEdit";
import type { MembreRevenu } from "@/data/membres";
import { COMMUN_MEMBRE, couleurPourMembre, isCommunMembreId, labelPourMembre } from "@/lib/commun-membre";
import { calculerAnnuelEstime, calculerTotalFoyer } from "@/lib/calculs-revenus";
import { formatEur } from "@/lib/calculs";
import type { Revenu, TypeRevenu } from "@/types/revenus";
import styles from "./RevenuList.module.css";

export interface RevenuListProps {
  revenus: Revenu[];
  membres: MembreRevenu[];
  isLoading?: boolean;
  isMutating?: boolean;
  onUpdate: (id: string, revenu: Revenu) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onAddCta?: () => void;
}

const TYPE_LABEL: Record<TypeRevenu, string> = {
  fixe: "Fixe",
  variable: "Variable",
  ponctuel: "Ponctuel",
  locatif: "Locatif",
};

function RevenuRow({
  r,
  membres,
  isMutating,
  isEditing,
  isConfirming,
  onStartEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
  onSave,
  onCancelEdit,
}: {
  r: Revenu;
  membres: MembreRevenu[];
  isMutating?: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  onStartEdit: () => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onSave: (revenu: Revenu) => Promise<void>;
  onCancelEdit: () => void;
}) {
  const couleur = couleurPourMembre(r.membreId, membres);
  const annuel = calculerAnnuelEstime(r);
  const metaParts = [TYPE_LABEL[r.type]];
  if (r.verseLe) metaParts.push(`Versé le ${r.verseLe}`);
  if (r.certitude) metaParts.push(r.certitude);

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.dot} style={{ backgroundColor: couleur }} aria-hidden />
        <div className={styles.body}>
          <p className={styles.label}>{r.label}</p>
          <p className={styles.meta}>{metaParts.join(" · ")}</p>
        </div>
        <div className={styles.amounts}>
          <p className={styles.amountMain}>{formatEur(r.montantMensuel)}</p>
          <p className={styles.amountSub}>/ mois</p>
          <p className={styles.amountSub}>{formatEur(annuel)} / an</p>
        </div>
      </div>

      {isConfirming ? (
        <div className={styles.confirmBar} role="group" aria-label="Confirmer la suppression">
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles.confirmDelete}`}
            disabled={isMutating}
            onClick={onConfirmDelete}
          >
            Supprimer ?
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles.confirmCancel}`}
            disabled={isMutating}
            onClick={onCancelDelete}
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
            onClick={onStartEdit}
            aria-label={`Modifier ${r.label}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            disabled={isMutating}
            onClick={onStartDelete}
            aria-label={`Supprimer ${r.label}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {isEditing && (
        <RevenuFormEdit
          revenu={r}
          membres={membres}
          isSubmitting={isMutating}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      )}
    </li>
  );
}

export function RevenuList({
  revenus,
  membres,
  isLoading,
  isMutating,
  onUpdate,
  onRemove,
  onAddCta,
}: RevenuListProps) {
  const [groupByMembre, setGroupByMembre] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const actifs = useMemo(() => revenus.filter((r) => r.actif), [revenus]);
  const total = useMemo(() => calculerTotalFoyer(actifs), [actifs]);
  const ordreIds = useMemo(() => [COMMUN_MEMBRE.id, ...membres.map((m) => m.id)], [membres]);

  if (isLoading) {
    return (
      <div className={styles.root} aria-busy="true">
        <div className={styles.toolbar}>
          <p className={styles.toolbarTitle}>Tous les revenus du foyer</p>
        </div>
        <div className={styles.scroll}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="my-3 h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const renderRow = (r: Revenu) => (
    <RevenuRow
      key={r.id}
      r={r}
      membres={membres}
      isMutating={isMutating}
      isEditing={editingId === r.id}
      isConfirming={confirmDeleteId === r.id}
      onStartEdit={() => {
        setConfirmDeleteId(null);
        setEditingId(r.id);
      }}
      onStartDelete={() => {
        setEditingId(null);
        setConfirmDeleteId(r.id);
      }}
      onCancelDelete={() => setConfirmDeleteId(null)}
      onConfirmDelete={() => void onRemove(r.id).then(() => setConfirmDeleteId(null))}
      onSave={async (updated) => {
        await onUpdate(r.id, updated);
        setEditingId(null);
      }}
      onCancelEdit={() => setEditingId(null)}
    />
  );

  const contenu =
    actifs.length === 0 ? (
      <div className={styles.empty}>
        <p>Aucun revenu pour le moment.</p>
        {onAddCta && (
          <button type="button" className={styles.emptyCta} onClick={onAddCta}>
            Ajouter un revenu →
          </button>
        )}
      </div>
    ) : !groupByMembre ? (
      <ul>{actifs.map(renderRow)}</ul>
    ) : (
      <div className="space-y-6 py-2">
        {ordreIds.map((mid) => {
          const liste = actifs.filter((r) =>
            isCommunMembreId(mid) ? isCommunMembreId(r.membreId) : r.membreId === mid,
          );
          if (liste.length === 0) return null;
          return (
            <div key={mid}>
              <p className={styles.groupTitle}>{labelPourMembre(mid, membres)}</p>
              <ul className={styles.groupList}>{liste.map(renderRow)}</ul>
            </div>
          );
        })}
      </div>
    );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <h2 className={styles.toolbarTitle}>Tous les revenus du foyer</h2>
        <Button
          type="button"
          variant={groupByMembre ? "default" : "outline"}
          size="sm"
          onClick={() => setGroupByMembre((g) => !g)}
        >
          {groupByMembre ? "Vue liste" : "Grouper par membre"}
        </Button>
      </div>

      <div className={styles.scroll}>{contenu}</div>

      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <span className={styles.footerLabel}>Total foyer (mensuel)</span>
          <span className={styles.footerTotal}>{formatEur(total)}</span>
        </div>
      </div>
    </div>
  );
}
