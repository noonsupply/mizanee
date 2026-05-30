"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Loader2, Pencil, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEur } from "@/lib/calculs";
import { cn } from "@/components/ui/utils";

export interface SoldeEpargneWidgetProps {
  montant: number;
  updatedAt: Date | null;
  onUpdate: (montant: number) => Promise<void>;
  needsSetup?: boolean;
  /** Intégré dans la grille métriques (sans bordure/ombre propres) */
  embedded?: boolean;
  className?: string;
}

export type SoldeEpargneWidgetHandle = {
  openEdit: () => void;
};

function libelleMiseAJour(updatedAt: Date | null): string {
  if (!updatedAt) return "Jamais mis à jour";
  const days = Math.floor((Date.now() - updatedAt.getTime()) / 86_400_000);
  if (days <= 0) return "Mis à jour aujourd'hui";
  if (days === 1) return "Mis à jour il y a 1 jour";
  return `Mis à jour il y a ${days} jours`;
}

export const SoldeEpargneWidget = forwardRef<SoldeEpargneWidgetHandle, SoldeEpargneWidgetProps>(
  function SoldeEpargneWidget(
    { montant, updatedAt, onUpdate, needsSetup = false, embedded = false, className },
    ref,
  ) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    useImperativeHandle(ref, () => ({
      openEdit: () => {
        setDraft(String(montant));
        setEditing(true);
      },
    }));

    const startEdit = () => {
      setDraft(String(montant));
      setEditing(true);
    };

    const cancel = () => {
      setEditing(false);
      setDraft("");
    };

    const validate = async () => {
      const parsed = Number(draft.replace(/\s/g, "").replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 0) return;
      setSaving(true);
      try {
        await onUpdate(parsed);
        setEditing(false);
      } finally {
        setSaving(false);
      }
    };

    const shellClass = embedded
      ? cn("flex flex-1 flex-col", className)
      : cn("mz-card mz-card-accent p-5", className);

    if (editing) {
      return (
        <section className={shellClass} aria-labelledby="solde-epargne-edit-title">
          <h2 id="solde-epargne-edit-title" className="mz-metric-label">
            Compte épargne
          </h2>
          <p className="mt-1 text-sm text-[var(--mz-ink-muted)]">Mettre à jour le solde actuel</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="min-w-32 flex-1">
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void validate();
                  if (e.key === "Escape") cancel();
                }}
                aria-label="Montant du compte épargne en euros"
                className="text-base font-semibold"
                autoFocus
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={cancel} disabled={saving}>
              Annuler
            </Button>
            <Button type="button" size="sm" onClick={() => void validate()} disabled={saving || draft.trim() === ""}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden /> : null}
              Valider
            </Button>
          </div>
        </section>
      );
    }

    return (
      <section
        id="solde-epargne-widget"
        className={shellClass}
        aria-labelledby="solde-epargne-display-title"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--mz-green-bg)] text-[var(--mz-green)]">
              <PiggyBank className="h-4 w-4" aria-hidden />
            </span>
            <h2 id="solde-epargne-display-title" className="mz-metric-label">
              Compte épargne
            </h2>
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="rounded-md p-1.5 text-[var(--mz-ink-muted)] transition-colors hover:bg-[var(--mz-green-bg)] hover:text-[var(--mz-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mz-green)]"
            aria-label="Modifier le solde épargne"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          {needsSetup ? (
            <span className="badge-warning inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold">
              À renseigner
            </span>
          ) : (
            <p className="mz-metric-value mz-metric-positive">{formatEur(montant)}</p>
          )}
          <p className="text-xs text-[var(--mz-ink-muted)]">{libelleMiseAJour(updatedAt)}</p>
        </div>
      </section>
    );
  },
);
