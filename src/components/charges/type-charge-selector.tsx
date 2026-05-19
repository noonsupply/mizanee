"use client";

import { CalendarDays, CloudSun, LineChart, Repeat } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { TypeCharge } from "@/types/charges";

export interface TypeChargeSelectorProps {
  selected: TypeCharge;
  onChange: (type: TypeCharge) => void;
}

const CARTES: {
  id: TypeCharge;
  label: string;
  description: string;
  icon: typeof Repeat;
  ring: string;
  fond: string;
}[] = [
  {
    id: "recurrente_fixe",
    label: "Récurrente fixe",
    description: "Même montant chaque mois",
    icon: Repeat,
    ring: "border-indigo-500",
    fond: "bg-indigo-50",
  },
  {
    id: "recurrente_variable",
    label: "Récurrente variable",
    description: "Montants différents par mois",
    icon: LineChart,
    ring: "border-sky-500",
    fond: "bg-sky-50",
  },
  {
    id: "saisonniere",
    label: "Saisonnière",
    description: "Pic sur certains mois",
    icon: CloudSun,
    ring: "border-amber-500",
    fond: "bg-amber-50",
  },
  {
    id: "annuelle",
    label: "Annuelle",
    description: "Un paiement par an",
    icon: CalendarDays,
    ring: "border-emerald-600",
    fond: "bg-emerald-50",
  },
];

export function TypeChargeSelector({ selected, onChange }: TypeChargeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">Type de charge</p>
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
