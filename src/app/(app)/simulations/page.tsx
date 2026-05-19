"use client";

import { useMemo } from "react";
import { SimulateurPanel } from "@/components/simulations/SimulateurPanel";
import { ScenarioCard } from "@/components/simulations/ScenarioCard";
import { ImpactChart } from "@/components/simulations/ImpactChart";
import { useFoyerStore } from "@/store/useFoyerStore";
import { useSimulationStore } from "@/store/useSimulationStore";
import { epargneMensuelleProjet, totalEpargneMensuelle } from "@/lib/calculs";

export default function SimulationsPage() {
  const projets = useFoyerStore((s) => s.projets);
  const scenarios = useSimulationStore((s) => s.scenarios);
  const addScenario = useSimulationStore((s) => s.addScenario);
  const removeScenario = useSimulationStore((s) => s.removeScenario);

  const base = useMemo(() => totalEpargneMensuelle(projets), [projets]);

  const { labels, avant, apres } = useMemo(() => {
    if (projets.length === 0) {
      return {
        labels: ["Épargne totale"],
        avant: [base],
        apres: [Math.max(0, Math.round(base * 0.95))],
      };
    }
    const labels = projets.map((p) => p.label);
    const avant = projets.map((p) => {
      const m = epargneMensuelleProjet(p);
      return isFinite(m) ? m : 0;
    });
    const apres = avant.map((v) => Math.max(0, Math.round(v * 0.95)));
    return { labels, avant, apres };
  }, [projets, base]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Simulations</h1>
        <p className="text-sm text-slate-500">Scénarios « et si… » et comparaison indicative.</p>
      </div>
      <SimulateurPanel projets={projets} onSaveScenario={addScenario} />
      <ImpactChart labels={labels} avant={avant} apres={apres} />
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Scénarios enregistrés</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.length === 0 && <p className="text-sm text-slate-500">Aucun scénario sauvegardé.</p>}
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} onDelete={removeScenario} />
          ))}
        </div>
      </div>
    </div>
  );
}
