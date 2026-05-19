"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MembreRevenu } from "@/data/membres";
import { COMMUN_MEMBRE, couleurPourMembre, isCommunMembreId, labelPourMembre } from "@/lib/commun-membre";
import { calculerAnnuelEstime, calculerTotalFoyer } from "@/lib/calculs-revenus";
import { formatEur } from "@/lib/calculs";
import type { Revenu, TypeRevenu } from "@/types/revenus";

export interface RevenuListProps {
  revenus: Revenu[];
  membres: MembreRevenu[];
  onRemove: (id: string) => void;
  onEdit?: (revenu: Revenu) => void;
  isMutating?: boolean;
}

const TYPE_LABEL: Record<TypeRevenu, string> = {
  fixe: "Fixe",
  variable: "Variable",
  ponctuel: "Ponctuel",
  locatif: "Locatif",
};

function ligneRevenu(
  r: Revenu,
  membres: MembreRevenu[],
  onRemove: (id: string) => void,
  onEdit?: (revenu: Revenu) => void,
  isMutating?: boolean,
) {
  const couleur = couleurPourMembre(r.membreId, membres);
  const annuel = calculerAnnuelEstime(r);
  const metaParts = [TYPE_LABEL[r.type]];
  if (r.verseLe) metaParts.push(`Versé le ${r.verseLe}`);
  if (r.certitude) metaParts.push(r.certitude);

  return (
    <li key={r.id} className="group flex items-start gap-3 py-3">
      <span
        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: couleur }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{r.label}</p>
        <p className="text-xs text-slate-500">{metaParts.join(" · ")}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-900">{formatEur(r.montantMensuel)}</p>
        <p className="text-xs text-slate-500">/ mois</p>
        <p className="mt-0.5 text-xs font-medium text-slate-600">{formatEur(annuel)} / an</p>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(r)}
            disabled={isMutating}
            className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Modifier ${r.label}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(r.id)}
          disabled={isMutating}
          className="mt-0.5 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`Supprimer ${r.label}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

export function RevenuList({ revenus, membres, onRemove, onEdit, isMutating }: RevenuListProps) {
  const [groupByMembre, setGroupByMembre] = useState(false);
  const actifs = useMemo(() => revenus.filter((r) => r.actif), [revenus]);
  const total = useMemo(() => calculerTotalFoyer(actifs), [actifs]);

  const ordreIds = useMemo(() => [COMMUN_MEMBRE.id, ...membres.map((m) => m.id)], [membres]);

  const contenu = useMemo(() => {
    if (actifs.length === 0) {
      return <p className="py-8 text-center text-sm text-slate-500">Aucun revenu pour le moment.</p>;
    }
    if (!groupByMembre) {
      return (
        <ul className="divide-y divide-slate-100">
          {actifs.map((r) => ligneRevenu(r, membres, onRemove, onEdit, isMutating))}
        </ul>
      );
    }
    return (
      <div className="space-y-6">
        {ordreIds.map((mid) => {
          const liste = actifs.filter((r) =>
            isCommunMembreId(mid) ? isCommunMembreId(r.membreId) : r.membreId === mid,
          );
          if (liste.length === 0) return null;
          return (
            <div key={mid}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {labelPourMembre(mid, membres)}
              </p>
              <ul className="rounded-lg border border-slate-100 bg-slate-50/50 px-3">
                {liste.map((r) => ligneRevenu(r, membres, onRemove, onEdit, isMutating))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }, [actifs, groupByMembre, membres, onRemove, onEdit, isMutating, ordreIds]);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Tous les revenus du foyer</h2>
        <Button
          type="button"
          variant={groupByMembre ? "default" : "outline"}
          size="sm"
          onClick={() => setGroupByMembre((g) => !g)}
        >
          {groupByMembre ? "Vue liste" : "Grouper par membre"}
        </Button>
      </div>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-4">{contenu}</div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Total foyer (mensuel)</span>
          <span className="text-lg font-bold text-emerald-700">{formatEur(total)}</span>
        </div>
      </div>
    </div>
  );
}
