"use client";

import { create } from "zustand";
import { projetsEpargneInitiaux } from "@/data/foyer";
import type { ProjetEpargne } from "@/data/foyer";

export interface FoyerState {
  nomFoyer: string;
  setNomFoyer: (nom: string) => void;
  projets: ProjetEpargne[];
  setProjets: (next: ProjetEpargne[] | ((prev: ProjetEpargne[]) => ProjetEpargne[])) => void;
}

export const useFoyerStore = create<FoyerState>((set) => ({
  nomFoyer: "Foyer Finance",
  setNomFoyer: (nom) => set({ nomFoyer: nom }),
  projets: projetsEpargneInitiaux,
  setProjets: (next) =>
    set((s) => ({
      projets: typeof next === "function" ? next(s.projets) : next,
    })),
}));
