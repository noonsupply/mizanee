"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { isApiDebug, pickPayloadArray } from "@/lib/api-helpers";
import { mapRevenuApiToUi, mapRevenuUiToApiInput } from "@/lib/api-mappers";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import type { CreateRevenuInput, RevenuApi, UpdateRevenuInput } from "@/types/api";
import type { Revenu } from "@/types/revenus";

export function useRevenus() {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [raw, setRaw] = useState<RevenuApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const snapshotRef = useRef<RevenuApi[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ revenus: RevenuApi[] }>("/api/revenus");
      const list = pickPayloadArray<RevenuApi>(data, "revenus");
      if (isApiDebug) console.log("[useRevenus] réponse:", data, "count:", list.length);
      setRaw(list);
    } catch (e) {
      if (isApiDebug) console.error("[useRevenus] erreur fetch:", e);
      setError(e instanceof Error ? e : new Error("Impossible de charger les revenus"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setRaw([]);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const revenus = useMemo(() => raw.map(mapRevenuApiToUi), [raw]);

  const addRevenu = useCallback(
    async (revenu: Revenu) => {
      const input = mapRevenuUiToApiInput(revenu) as CreateRevenuInput;
      setIsMutating(true);
      snapshotRef.current = raw;
      let created: Revenu | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          const temp: RevenuApi = {
            id: `temp-${Date.now()}`,
            ...input,
            membreId: input.membreId ?? null,
            actif: input.actif ?? true,
          };
          setRaw((prev) => [temp, ...prev]);
          created = mapRevenuApiToUi(temp);
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.post<{ revenu: RevenuApi }>("/api/revenus", input);
          setRaw((prev) => [data.revenu, ...prev.filter((r) => !r.id.startsWith("temp-"))]);
          created = mapRevenuApiToUi(data.revenu);
          return created;
        },
        showError,
        successMessage: "Revenu ajouté",
        showSuccess,
      });
      setIsMutating(false);
      return created;
    },
    [raw, showError, showSuccess],
  );

  const updateRevenu = useCallback(
    async (id: string, revenu: Revenu) => {
      const input = mapRevenuUiToApiInput(revenu) as UpdateRevenuInput;
      setIsMutating(true);
      snapshotRef.current = raw;
      let updated: Revenu | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setRaw((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    label: input.label ?? r.label,
                    montant: input.montant ?? r.montant,
                    type: input.type ?? r.type,
                    actif: input.actif ?? r.actif,
                  }
                : r,
            ),
          );
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ revenu: RevenuApi }>(`/api/revenus/${id}`, input);
          setRaw((prev) => prev.map((r) => (r.id === id ? data.revenu : r)));
          updated = mapRevenuApiToUi(data.revenu);
          return updated;
        },
        showError,
        successMessage: "Revenu mis à jour",
        showSuccess,
      });
      setIsMutating(false);
      return updated;
    },
    [raw, showError, showSuccess],
  );

  const removeRevenu = useCallback(
    async (id: string) => {
      setIsMutating(true);
      snapshotRef.current = raw;
      await runOptimisticMutation({
        applyOptimistic: () => setRaw((prev) => prev.filter((r) => r.id !== id)),
        rollback: () => setRaw(snapshotRef.current),
        mutate: () => api.delete<{ ok: boolean }>(`/api/revenus/${id}`),
        showError,
        successMessage: "Revenu supprimé",
        showSuccess,
      });
      setIsMutating(false);
    },
    [raw, showError, showSuccess],
  );

  return {
    revenus,
    raw,
    isLoading,
    error,
    isMutating,
    refresh,
    addRevenu,
    updateRevenu,
    removeRevenu,
  };
}
