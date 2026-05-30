"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { isApiDebug } from "@/lib/api-helpers";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import { EMPTY_FOYER, parseFoyerPayload } from "@/lib/foyer-mapper";
import type { Foyer, PatchFoyerInput } from "@/types/foyer";

export function useFoyer() {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [foyer, setFoyer] = useState<Foyer>(EMPTY_FOYER);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const snapshotRef = useRef<Foyer>(EMPTY_FOYER);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<unknown>("/api/foyer");
      const parsed = parseFoyerPayload(data);
      if (isApiDebug) console.log("[useFoyer] foyer:", parsed);
      setFoyer(parsed);
    } catch (e) {
      if (isApiDebug) console.error("[useFoyer] erreur fetch:", e);
      setError(e instanceof Error ? e : new Error("Impossible de charger le foyer"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setFoyer(EMPTY_FOYER);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const updateSoldeEpargne = useCallback(
    async (montant: number) => {
      if (montant < 0 || Number.isNaN(montant)) {
        showError("Montant invalide");
        return;
      }
      setIsMutating(true);
      snapshotRef.current = foyer;
      const updatedAt = new Date().toISOString();
      await runOptimisticMutation({
        applyOptimistic: () => {
          setFoyer((prev) => ({
            ...prev,
            soldeEpargne: { montant, updatedAt },
          }));
        },
        rollback: () => setFoyer(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<unknown>("/api/foyer/solde-epargne", { montant });
          setFoyer(parseFoyerPayload(data));
        },
        showError,
        successMessage: "Solde épargne mis à jour",
        showSuccess,
      });
      setIsMutating(false);
    },
    [foyer, showError, showSuccess],
  );

  const applySoldeEpargne = useCallback((montant: number) => {
    setFoyer((prev) => ({
      ...prev,
      soldeEpargne: { montant: Math.max(0, montant), updatedAt: new Date().toISOString() },
    }));
  }, []);

  const updateFoyer = useCallback(
    async (input: PatchFoyerInput) => {
      setIsMutating(true);
      snapshotRef.current = foyer;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setFoyer((prev) => ({
            ...prev,
            ...(input.nom !== undefined && { nom: input.nom }),
            ...(input.emoji !== undefined && { emoji: input.emoji }),
          }));
        },
        rollback: () => setFoyer(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<unknown>("/api/foyer", input);
          setFoyer(parseFoyerPayload(data));
        },
        showError,
        successMessage: "Foyer mis à jour",
        showSuccess,
      });
      setIsMutating(false);
    },
    [foyer, showError, showSuccess],
  );

  return {
    foyer,
    isLoading,
    error,
    isMutating,
    refresh,
    updateSoldeEpargne,
    applySoldeEpargne,
    updateFoyer,
  };
}

export function foyerNeedsSoldeEpargne(foyer: Foyer | null | undefined): boolean {
  const solde = foyer?.soldeEpargne;
  if (!solde) return true;
  return solde.montant === 0 && solde.updatedAt === null;
}
