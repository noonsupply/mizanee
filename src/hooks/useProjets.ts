"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { isApiDebug, pickPayloadArray } from "@/lib/api-helpers";
import { mapProjetApiToUi, mapProjetUiToApiInput } from "@/lib/api-mappers";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import { useFoyer } from "@/hooks/useFoyer";
import { resteAVivre } from "@/lib/calculs";
import { allouerSolde, calculerPlanAction, enrichirProjet } from "@/lib/calculs-projets";
import { EPARGNE_MENSUELLE } from "@/lib/epargne-constants";
import type { ProjetApi, UpdateProjetInput } from "@/types/api";
import type { Projet } from "@/types/projets";

function dateYmToIso(dateYm: string): string {
  const [y, m] = dateYm.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, 1).toISOString();
}

export function useProjets() {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { foyer } = useFoyer();
  const [raw, setRaw] = useState<ProjetApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const snapshotRef = useRef<ProjetApi[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ projets: ProjetApi[] }>("/api/projets");
      const list = pickPayloadArray<ProjetApi>(data, "projets");
      if (isApiDebug) console.log("[useProjets] réponse:", data, "count:", list.length);
      setRaw(list);
    } catch (e) {
      if (isApiDebug) console.error("[useProjets] erreur fetch:", e);
      setError(e instanceof Error ? e : new Error("Impossible de charger les projets"));
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

  const projets = useMemo(() => raw.map(mapProjetApiToUi), [raw]);

  const soldeDisponible = foyer?.soldeEpargne?.montant ?? 0;
  const resteDisponible = useMemo(() => resteAVivre(EPARGNE_MENSUELLE), []);

  const projetsCalcules = useMemo(
    () => projets.map((p) => enrichirProjet(p, resteDisponible)),
    [projets, resteDisponible],
  );

  const projetsAlloues = useMemo(
    () => allouerSolde(projetsCalcules, soldeDisponible),
    [projetsCalcules, soldeDisponible],
  );

  const planAction = useMemo(() => calculerPlanAction(projetsAlloues), [projetsAlloues]);

  const stats = useMemo(
    () => ({
      soldeDisponible,
      projetsFinances: projetsAlloues.filter((p) => p.statutAllocation === "finance").length,
      projetUrgent: projetsAlloues.find((p) => p.urgence === "urgent"),
      totalObjectifs: projets.reduce((acc, p) => acc + p.montant, 0),
      epargneTotaleRequise: projetsAlloues.reduce((acc, p) => acc + p.epargneMensuelleRequise, 0),
    }),
    [projetsAlloues, projets, soldeDisponible],
  );

  const addProjet = useCallback(
    async (projet: Projet) => {
      const input = mapProjetUiToApiInput(projet);
      setIsMutating(true);
      snapshotRef.current = raw;
      let created: Projet | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          const temp: ProjetApi = {
            id: `temp-${Date.now()}`,
            label: input.label,
            montant: input.montant,
            dateCible: input.dateCible,
            epargneMensuelle: 0,
            priorite: input.priorite ?? raw.length + 1,
            statut: input.statut ?? "EN_COURS",
            couleur: input.couleur ?? "#378ADD",
            emoji: input.emoji ?? null,
          };
          setRaw((prev) => [...prev, temp].sort((a, b) => a.priorite - b.priorite));
          created = mapProjetApiToUi(temp);
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.post<{ projet: ProjetApi }>("/api/projets", input);
          setRaw((prev) =>
            [...prev.filter((p) => !p.id.startsWith("temp-")), data.projet].sort(
              (a, b) => a.priorite - b.priorite,
            ),
          );
          created = mapProjetApiToUi(data.projet);
          return created;
        },
        showError,
        successMessage: "Projet ajouté",
        showSuccess,
      });
      setIsMutating(false);
      return created;
    },
    [raw, showError, showSuccess],
  );

  const updateProjet = useCallback(
    async (id: string, patch: Partial<Projet> & { date?: string }) => {
      const existing = projets.find((p) => p.id === id);
      if (!existing) return undefined;
      const merged = { ...existing, ...patch };
      const input: UpdateProjetInput = {
        ...mapProjetUiToApiInput(merged),
        ...(patch.date ? { dateCible: dateYmToIso(patch.date) } : {}),
      };
      setIsMutating(true);
      snapshotRef.current = raw;
      let updated: Projet | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setRaw((prev) =>
            prev.map((p) => {
              if (p.id !== id) return p;
              return {
                ...p,
                ...(patch.label !== undefined && { label: patch.label }),
                ...(patch.montant !== undefined && { montant: patch.montant }),
                ...(patch.date !== undefined && { dateCible: dateYmToIso(patch.date) }),
                ...(patch.priorite !== undefined && { priorite: patch.priorite }),
              };
            }),
          );
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ projet: ProjetApi }>(`/api/projets/${id}`, input);
          setRaw((prev) => prev.map((p) => (p.id === id ? data.projet : p)));
          updated = mapProjetApiToUi(data.projet);
          return updated;
        },
        showError,
        successMessage: patch.date ? "Date mise à jour" : "Projet mis à jour",
        showSuccess,
      });
      setIsMutating(false);
      return updated;
    },
    [projets, raw, showError, showSuccess],
  );

  const removeProjet = useCallback(
    async (id: string) => {
      setIsMutating(true);
      snapshotRef.current = raw;
      await runOptimisticMutation({
        applyOptimistic: () => setRaw((prev) => prev.filter((p) => p.id !== id)),
        rollback: () => setRaw(snapshotRef.current),
        mutate: () => api.delete<{ ok: boolean }>(`/api/projets/${id}`),
        showError,
        successMessage: "Projet supprimé",
        showSuccess,
      });
      setIsMutating(false);
    },
    [raw, showError, showSuccess],
  );

  const terminerProjet = useCallback(
    async (id: string, dateDepense?: string): Promise<number | undefined> => {
      setIsMutating(true);
      snapshotRef.current = raw;
      let nouveauSolde: number | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setRaw((prev) => prev.map((p) => (p.id === id ? { ...p, statut: "ATTEINT" } : p)));
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ projet: ProjetApi; nouveauSoldeEpargne: number }>(
            `/api/projets/${id}/terminer`,
            dateDepense ? { dateDepense } : {},
          );
          setRaw((prev) => prev.map((p) => (p.id === id ? data.projet : p)));
          nouveauSolde = data.nouveauSoldeEpargne;
          return data;
        },
        showError,
        successMessage: "Projet terminé — solde épargne mis à jour",
        showSuccess,
      });
      setIsMutating(false);
      return nouveauSolde;
    },
    [raw, showError, showSuccess],
  );

  const reorderProjets = useCallback(
    async (ordered: Projet[]) => {
      const items = ordered.map((p, i) => ({ id: p.id, priorite: i + 1 }));
      setIsMutating(true);
      snapshotRef.current = raw;
      await runOptimisticMutation({
        applyOptimistic: () => {
          const byId = new Map(items.map((it) => [it.id, it.priorite]));
          setRaw((prev) =>
            [...prev]
              .map((p) => ({ ...p, priorite: byId.get(p.id) ?? p.priorite }))
              .sort((a, b) => a.priorite - b.priorite),
          );
        },
        rollback: () => setRaw(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ projets: ProjetApi[] }>("/api/projets/reorder", { items });
          setRaw(data.projets);
          return data.projets.map(mapProjetApiToUi);
        },
        showError,
        successMessage: "Priorités mises à jour",
        showSuccess,
      });
      setIsMutating(false);
    },
    [raw, showError, showSuccess],
  );

  return {
    projets,
    projetsCalcules,
    projetsAlloues,
    planAction,
    stats,
    raw,
    isLoading,
    error,
    isMutating,
    refresh,
    addProjet,
    updateProjet,
    removeProjet,
    terminerProjet,
    reorderProjets,
  };
}
