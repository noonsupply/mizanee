"use client";

import { create } from "zustand";
import type { SavedScenario, Scenario } from "@/types";

interface SimulationState {
  scenarios: SavedScenario[];
  addScenario: (label: string, scenario: Scenario) => void;
  removeScenario: (id: string) => void;
}

let idCounter = 0;

export const useSimulationStore = create<SimulationState>((set) => ({
  scenarios: [],
  addScenario: (label, scenario) =>
    set((s) => ({
      scenarios: [
        ...s.scenarios,
        {
          id: `sc-${++idCounter}`,
          label,
          scenario,
          createdAt: new Date(),
        },
      ],
    })),
  removeScenario: (id) => set((s) => ({ scenarios: s.scenarios.filter((x) => x.id !== id) })),
}));
