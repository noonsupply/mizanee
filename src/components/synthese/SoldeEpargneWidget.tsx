"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEur } from "@/lib/calculs";
import { cn } from "@/components/ui/utils";

export interface SoldeEpargneWidgetProps {
  montant: number;
  updatedAt: Date | null;
  onUpdate: (montant: number) => Promise<void>;
  needsSetup?: boolean;
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
  function SoldeEpargneWidget({ montant, updatedAt, onUpdate, needsSetup = false, className }, ref) {
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

    if (editing) {
      return (
        <section
          className={cn(
            "rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-4 shadow-sm",
            className,
          )}
          aria-labelledby="solde-epargne-edit-title"
        >
          <h2 id="solde-epargne-edit-title" className="text-sm font-medium text-slate-800">
            💰 Mettre à jour le solde épargne
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="min-w-[8rem] flex-1">
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
          <Button type="button" variant="outline" size="sm" onClick={cancel} disabled={saving}>
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
        className={cn(
          "rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/50 to-white p-4 shadow-sm",
          className,
        )}
        aria-labelledby="solde-epargne-display-title"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 id="solde-epargne-display-title" className="text-sm font-medium text-slate-800">
            💰 Compte épargne
          </h2>
          <button
            type="button"
            onClick={startEdit}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-violet-100 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Modifier le solde épargne"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          {needsSetup ? (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-900">
              À renseigner
            </span>
          ) : (
            <p className="text-2xl font-bold tracking-tight text-slate-900">{formatEur(montant)}</p>
          )}
          <p className="text-xs text-slate-500">{libelleMiseAJour(updatedAt)}</p>
        </div>
      </section>
    );
  },
);
