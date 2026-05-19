"use client";

import { Slider } from "@/components/ui/slider";
import { formatEur } from "@/lib/calculs";
import type { MembreUI } from "@/types";

export interface RepartitionSliderProps {
  membres: MembreUI[];
  prorataPercent: Record<string, number>;
  onProrataChange: (membreId: string, percent: number) => void;
  totalCommunes: number;
}

export function RepartitionSlider({ membres, prorataPercent, onProrataChange, totalCommunes }: RepartitionSliderProps) {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Prorata manuel</h3>
        <p className="text-xs text-slate-500">Ajustez le % de charges communes par membre (les valeurs sont indicatives).</p>
      </div>
      {membres.map((m) => {
        const pct = prorataPercent[m.id] ?? m.prorata;
        const part = Math.round((pct / 100) * totalCommunes);
        return (
          <div key={m.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{m.prenom}</span>
              <span className="text-slate-600">
                {pct}% — {formatEur(part)}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={pct}
              onChange={(e) => onProrataChange(m.id, Number(e.target.value))}
              aria-label={`Prorata ${m.prenom}`}
            />
          </div>
        );
      })}
    </div>
  );
}
