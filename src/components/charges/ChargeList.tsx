"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { MembreRevenu } from "@/data/membres";
import { ChargeFormEdit } from "@/components/charges/ChargeFormEdit";
import { couleurPourMembre, isCommunMembreId, labelPourMembre, COMMUN_MEMBRE } from "@/lib/commun-membre";
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

type Vue = "foyer" | "membre";

interface Groupe {
  key: string;
  label: string;
  couleur: string;
  charges: ChargeFoyer[];
  totalMensuel: number;
}

function eurFr(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
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
  const [vue, setVue] = useState<Vue>("foyer");

  const actives = useMemo(() => charges.filter((c) => c.actif), [charges]);
  const total = calculerTotalFoyerChargesMensuel(actives);

  const totalCommun = useMemo(
    () => actives.filter((c) => isCommunMembreId(c.membreId)).reduce((s, c) => s + c.montantMensuel, 0),
    [actives],
  );

  const totauxMembres = useMemo(
    () =>
      membres.map((m) => ({
        membre: m,
        total: actives.filter((c) => c.membreId === m.id).reduce((s, c) => s + c.montantMensuel, 0),
      })),
    [actives, membres],
  );

  const groupes = useMemo<Groupe[]>(() => {
    const commun: Groupe = {
      key: COMMUN_MEMBRE.id,
      label: COMMUN_MEMBRE.label,
      couleur: COMMUN_MEMBRE.couleur,
      charges: actives.filter((c) => isCommunMembreId(c.membreId)),
      totalMensuel: totalCommun,
    };
    const membreGroupes: Groupe[] = totauxMembres
      .map(({ membre, total: t }) => ({
        key: membre.id,
        label: membre.prenom,
        couleur: membre.couleur,
        charges: actives.filter((c) => c.membreId === membre.id),
        totalMensuel: t,
      }))
      .filter((g) => g.charges.length > 0)
      .sort((a, b) => b.totalMensuel - a.totalMensuel);
    return [commun, ...membreGroupes].filter((g) => g.charges.length > 0);
  }, [actives, totalCommun, totauxMembres]);

  const renderRow = (c: ChargeFoyer, hideMembre: boolean) => {
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
              {libelleTypeCharge(c.type)}
              {hideMembre ? "" : ` · ${labelPourMembre(c.membreId, membres)}`}
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
  };

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

      <div className={styles.viewToggle} role="tablist" aria-label="Mode d'affichage">
        <button
          type="button"
          role="tab"
          aria-selected={vue === "foyer"}
          className={`${styles.viewBtn} ${vue === "foyer" ? styles.viewBtnActive : ""}`}
          onClick={() => setVue("foyer")}
        >
          Vue foyer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vue === "membre"}
          className={`${styles.viewBtn} ${vue === "membre" ? styles.viewBtnActive : ""}`}
          onClick={() => setVue("membre")}
        >
          Par membre
        </button>
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
        ) : vue === "foyer" ? (
          <ul>{actives.map((c) => renderRow(c, false))}</ul>
        ) : (
          groupes.map((g) => (
            <section key={g.key} className={styles.groupe}>
              <div className={styles.groupeHeader}>
                <span className={styles.groupeDot} style={{ backgroundColor: g.couleur }} aria-hidden />
                <span className={styles.groupeNom}>{g.label}</span>
                <span className={styles.groupeTotal}>
                  {eurFr(g.totalMensuel)} €/mois · {eurFr(g.totalMensuel * 12)} €/an
                </span>
              </div>
              <ul>{g.charges.map((c) => renderRow(c, true))}</ul>
            </section>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.subtotals}>
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>
              <span className={styles.subtotalDot} style={{ backgroundColor: COMMUN_MEMBRE.couleur }} aria-hidden />
              {COMMUN_MEMBRE.label}
            </span>
            <span>{eurFr(totalCommun)} €/mois</span>
          </div>
          {totauxMembres.map(({ membre, total: t }) => (
            <div key={membre.id} className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>
                <span className={styles.subtotalDot} style={{ backgroundColor: membre.couleur }} aria-hidden />
                {membre.prenom}
              </span>
              <span>{eurFr(t)} €/mois</span>
            </div>
          ))}
        </div>
        <div className={styles.totalFoyer}>
          <span>Total foyer</span>
          <span className={styles.footerTotal}>{eurFr(total)} €/mois</span>
        </div>
      </div>
    </div>
  );
}
