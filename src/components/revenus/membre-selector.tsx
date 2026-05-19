"use client";

import { cn } from "@/components/ui/utils";
import { COMMUN_MEMBRE, type MembreSelectionId } from "@/lib/commun-membre";
import type { MembreRevenu } from "@/data/membres";

export type { MembreSelectionId };

export interface MembreSelectorProps {
  membres: MembreRevenu[];
  selected: MembreSelectionId;
  onChange: (membreId: MembreSelectionId) => void;
  context?: "revenus" | "charges";
}

function initiale(prenom: string): string {
  const t = prenom.trim();
  if (t.length === 0) return "?";
  return t.slice(0, 1).toUpperCase();
}

export function MembreSelector({ membres, selected, onChange, context = "revenus" }: MembreSelectorProps) {
  const labelId = context === "charges" ? "charges-membre-selector-label" : "revenus-membre-selector-label";
  const options = [
    ...membres.map((m) => ({
      id: m.id,
      label: m.prenom,
      couleur: m.couleur,
      emoji: undefined as string | undefined,
      commun: false as const,
    })),
    {
      id: COMMUN_MEMBRE.id,
      label: COMMUN_MEMBRE.label,
      couleur: COMMUN_MEMBRE.couleur,
      emoji: COMMUN_MEMBRE.emoji,
      commun: true as const,
    },
  ];

  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <p id={labelId} className="text-sm font-medium text-slate-800">
        Pour qui ?
      </p>
      <MembreSelectorButtons options={options} selected={selected} onChange={onChange} context={context} />
    </div>
  );
}

function MembreSelectorButtons({
  options,
  selected,
  onChange,
  context,
}: {
  options: Array<{
    id: string;
    label: string;
    couleur: string;
    emoji?: string;
    commun: boolean;
  }>;
  selected: string;
  onChange: (id: string) => void;
  context: "revenus" | "charges";
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={isSelected}
            aria-label={
              opt.commun
                ? context === "charges"
                  ? "Charge commune au foyer"
                  : "Revenu commun au foyer"
                : context === "charges"
                  ? `Charge pour ${opt.label}`
                  : `Revenu pour ${opt.label}`
            }
            className={cn(
              "flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
              isSelected ? "border-current bg-white shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300",
            )}
            style={
              isSelected
                ? {
                    borderColor: opt.couleur,
                    boxShadow: `0 0 0 1px ${opt.couleur}33`,
                  }
                : undefined
            }
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: opt.couleur }}
            >
              {opt.emoji ?? initiale(opt.label)}
            </span>
            <span className="text-xs font-semibold text-slate-800">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
