"use client";

import { Building2, CalendarClock, LineChart, Wallet } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { TypeRevenu } from "@/types/revenus";

export interface TypeRevenuSelectorProps {
  selected: TypeRevenu;
  onChange: (type: TypeRevenu) => void;
}

const CARTES: {
  id: TypeRevenu;
  label: string;
  description: string;
  icon: typeof Wallet;
  ring: string;
  fond: string;
}[] = [
  {
    id: "fixe",
    label: "Fixe",
    description: "Montant stable chaque mois",
    icon: Wallet,
    ring: "border-indigo-500",
    fond: "bg-indigo-50",
  },
  {
    id: "variable",
    label: "Variable",
    description: "Grille mois par mois",
    icon: LineChart,
    ring: "border-sky-500",
    fond: "bg-sky-50",
  },
  {
    id: "ponctuel",
    label: "Ponctuel",
    description: "Entrée exceptionnelle",
    icon: CalendarClock,
    ring: "border-amber-500",
    fond: "bg-amber-50",
  },
  {
    id: "locatif",
    label: "Locatif",
    description: "Revenus immobiliers",
    icon: Building2,
    ring: "border-emerald-600",
    fond: "bg-emerald-50",
  },
];

export function TypeRevenuSelector({ selected, onChange }: TypeRevenuSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">Type de revenu</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARTES.map(({ id, label, description, icon: Icon, ring, fond }) => {
          const actif = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={actif}
              className={cn(
                "flex gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                actif ? cn(ring, fond, "shadow-sm") : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  actif ? "bg-white/80 text-slate-800" : "bg-slate-100 text-slate-600",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{label}</span>
                <span className="mt-0.5 block text-xs text-slate-600">{description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
