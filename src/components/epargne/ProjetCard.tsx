"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import { GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { formatEur } from "@/lib/calculs";
import type { ProjetCalcule } from "@/types/projets";

export interface ProjetCardProps {
  projet: ProjetCalcule;
  onDateChange: (id: string, dateYm: string) => void;
  onRemove: (id: string) => void;
  onPrioriteChange: (id: string, priorite: number) => void;
  dragHandleRef?: (el: HTMLElement | null) => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: Record<string, (e: unknown) => void>;
}

const badgePriorite = (p: number) => {
  if (p <= 1) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (p === 2) return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-slate-200 text-slate-700 border-slate-300";
};

const badgeFaisabilite = (f: ProjetCalcule["faisabilite"]) => {
  if (f === "faisable") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (f === "serre") return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-rose-50 text-rose-800 border-rose-200";
};

const couleurEpargne = (f: ProjetCalcule["faisabilite"]) => {
  if (f === "faisable") return "text-emerald-700";
  if (f === "serre") return "text-amber-700";
  return "text-rose-700";
};

export function ProjetCard({
  projet,
  onDateChange,
  onRemove,
  onPrioriteChange,
  dragHandleRef,
  dragAttributes,
  dragListeners,
}: ProjetCardProps) {
  const ep = projet.epargneMensuelleNecessaire;
  const epLabel = Number.isFinite(ep) && ep > 0 ? formatEur(ep) : "—";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-2 border-b border-slate-100 px-3 py-3">
        <button
          type="button"
          ref={dragHandleRef}
          className="mt-0.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Réordonner"
          {...(dragAttributes ?? {})}
          {...(dragListeners ?? {})}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("border font-semibold", badgePriorite(projet.priorite))}>
              P{projet.priorite}
            </Badge>
            <span className="font-semibold text-slate-900">{projet.label}</span>
            <Badge variant="outline" className={cn("border text-xs", badgeFaisabilite(projet.faisabilite))}>
              {projet.faisabilite === "faisable" && "Faisable"}
              {projet.faisabilite === "serre" && "Serré"}
              {projet.faisabilite === "difficile" && "Difficile"}
            </Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(projet.id)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Retirer ${projet.label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 px-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Montant cible</p>
          <p className="text-sm font-bold text-slate-900">{formatEur(projet.montant)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500" htmlFor={`d-${projet.id}`}>
            Date cible
          </label>
          <Input
            id={`d-${projet.id}`}
            type="month"
            className="mt-1"
            value={projet.date}
            onChange={(e) => onDateChange(projet.id, `${e.target.value}`)}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Épargne / mois</p>
          <p className={cn("text-sm font-bold", couleurEpargne(projet.faisabilite))}>{epLabel}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Mois restants</p>
          <p className="text-sm font-semibold text-slate-800">{projet.moisRestants}</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="text-xs font-medium text-slate-500" htmlFor={`pr-${projet.id}`}>
            Priorité
          </label>
          <Select
            id={`pr-${projet.id}`}
            className="mt-1 max-w-xs"
            value={String(projet.priorite)}
            onChange={(e) => onPrioriteChange(projet.id, Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full transition-all"
          style={{
            width: `${projet.progressionPct}%`,
            backgroundColor: projet.color,
          }}
        />
      </div>
    </div>
  );
}
