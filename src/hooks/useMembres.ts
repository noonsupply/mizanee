"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { isApiDebug, pickPayloadArray } from "@/lib/api-helpers";
import { buildMembresUI } from "@/lib/api-mappers";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import type { ChargeApi, CreateMembreInput, Membre, RevenuApi, UpdateMembreInput } from "@/types/api";
import type { MembreUI } from "@/types";

export function useMembres(options?: {
  revenus?: RevenuApi[];
  charges?: ChargeApi[];
}) {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [membres, setMembres] = useState<Membre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const snapshotRef = useRef<Membre[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ membres: Membre[] }>("/api/membres");
      const list = pickPayloadArray<Membre>(data, "membres");
      if (isApiDebug) console.log("[useMembres] réponse:", data, "count:", list.length);
      setMembres(list);
    } catch (e) {
      if (isApiDebug) console.error("[useMembres] erreur fetch:", e);
      setError(e instanceof Error ? e : new Error("Impossible de charger les membres"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setMembres([]);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const membresUI = useMemo(() => {
    if (options?.revenus && options?.charges) {
      return buildMembresUI(membres, options.revenus, options.charges);
    }
    return buildMembresUI(membres, [], []);
  }, [membres, options?.revenus, options?.charges]);

  const addMembre = useCallback(
    async (input: CreateMembreInput) => {
      const tempId = `temp-${Date.now()}`;
      setIsMutating(true);
      snapshotRef.current = membres;
      let created: Membre | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          const temp: Membre = {
            id: tempId,
            prenom: input.prenom,
            couleur: input.couleur ?? "#378ADD",
            emoji: input.emoji ?? null,
            actif: true,
            prorata: input.prorata ?? 0,
            foyerId: "",
          };
          setMembres((prev) => [...prev, temp]);
        },
        rollback: () => setMembres(snapshotRef.current),
        mutate: async () => {
          const data = await api.post<{ membre: Membre }>("/api/membres", input);
          setMembres((prev) => prev.map((m) => (m.id === tempId ? data.membre : m)));
          created = data.membre;
          return data.membre;
        },
        showError,
        successMessage: "Membre ajouté",
        showSuccess,
      });
      setIsMutating(false);
      return created;
    },
    [membres, showError, showSuccess],
  );

  const updateMembre = useCallback(
    async (id: string, input: UpdateMembreInput) => {
      setIsMutating(true);
      snapshotRef.current = membres;
      let updated: Membre | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setMembres((prev) => prev.map((m) => (m.id === id ? { ...m, ...input } : m)));
        },
        rollback: () => setMembres(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ membre: Membre }>(`/api/membres/${id}`, input);
          setMembres((prev) => prev.map((m) => (m.id === id ? data.membre : m)));
          updated = data.membre;
          return data.membre;
        },
        showError,
        successMessage: "Membre mis à jour",
        showSuccess,
      });
      setIsMutating(false);
      return updated;
    },
    [membres, showError, showSuccess],
  );

  const deactivateMembre = useCallback(
    async (id: string) => {
      setIsMutating(true);
      snapshotRef.current = membres;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setMembres((prev) => prev.map((m) => (m.id === id ? { ...m, actif: false } : m)));
        },
        rollback: () => setMembres(snapshotRef.current),
        mutate: () => api.delete<{ membre: Membre }>(`/api/membres/${id}`),
        showError,
        successMessage: "Membre désactivé",
        showSuccess,
      });
      setIsMutating(false);
    },
    [membres, showError, showSuccess],
  );

  const removeMembre = useCallback(
    async (id: string) => {
      setIsMutating(true);
      snapshotRef.current = membres;
      await runOptimisticMutation({
        applyOptimistic: () => setMembres((prev) => prev.filter((m) => m.id !== id)),
        rollback: () => setMembres(snapshotRef.current),
        mutate: () =>
          api.delete<{ deleted: boolean }>(`/api/membres/${id}/permanent`, { confirm: true }),
        showError,
        successMessage: "Membre supprimé définitivement",
        showSuccess,
      });
      setIsMutating(false);
    },
    [membres, showError, showSuccess],
  );

  return {
    membres,
    membresUI,
    isLoading,
    error,
    isMutating,
    refresh,
    addMembre,
    updateMembre,
    deactivateMembre,
    removeMembre,
  };
}
