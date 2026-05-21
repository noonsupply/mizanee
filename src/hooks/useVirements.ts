"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import type { ResumeCommun, Virement, VirementLigne, VirementsPayload, VirementSoldeMembre } from "@/types/virements";

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMois(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y ?? 2026, (m ?? 1) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function libelleMoisYm(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y ?? 2026, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function useVirements(initialMois?: string) {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [mois, setMois] = useState(initialMois ?? moisCourant());
  const [virements, setVirements] = useState<Virement[]>([]);
  const [lignes, setLignes] = useState<VirementLigne[]>([]);
  const [soldes, setSoldes] = useState<Record<string, VirementSoldeMembre>>({});
  const [resumeCommun, setResumeCommun] = useState<ResumeCommun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const applyPayload = useCallback((data: VirementsPayload) => {
    setVirements(data.virements);
    setLignes(data.lignes);
    setSoldes(data.soldes);
    setResumeCommun(data.resumeCommun);
    setMois(data.mois);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<VirementsPayload>(`/api/virements?mois=${encodeURIComponent(mois)}`);
      applyPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Impossible de charger les virements"));
    } finally {
      setIsLoading(false);
    }
  }, [applyPayload, mois]);

  const fetchResumeMois = useCallback(async (targetMois: string) => {
    const data = await api.get<{ resumeCommun: ResumeCommun }>(
      `/api/virements/resume-commun?mois=${encodeURIComponent(targetMois)}`,
    );
    return data.resumeCommun;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setVirements([]);
      setLignes([]);
      setSoldes({});
      setResumeCommun(null);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const saisirVirement = useCallback(
    async (
      input: { membreId: string; mois: string; montantVerse: number; note?: string | null },
      opts?: { silent?: boolean },
    ) => {
      setIsMutating(true);
      const snapshot = { lignes, virements };
      await runOptimisticMutation({
        applyOptimistic: () => {
          setLignes((prev) =>
            prev.map((l) =>
              l.membreId === input.membreId
                ? {
                    ...l,
                    montantVerse: input.montantVerse,
                    ecart: input.montantVerse - l.doitVirer,
                    note: input.note !== undefined ? input.note : l.note,
                  }
                : l,
            ),
          );
        },
        rollback: () => {
          setLignes(snapshot.lignes);
          setVirements(snapshot.virements);
        },
        mutate: async () => {
          const data = await api.post<{ virement: Virement }>("/api/virements", input);
          setVirements((prev) => {
            const others = prev.filter((v) => !(v.membreId === input.membreId && v.mois === input.mois));
            return [...others, data.virement];
          });
          setLignes((prev) =>
            prev.map((l) =>
              l.membreId === input.membreId
                ? { ...l, virementId: data.virement.id, montantVerse: input.montantVerse, ecart: input.montantVerse - l.doitVirer }
                : l,
            ),
          );
          return data.virement;
        },
        showError,
        successMessage: opts?.silent ? undefined : "Virement enregistré",
        showSuccess: opts?.silent ? undefined : showSuccess,
      });
      setIsMutating(false);
    },
    [lignes, virements, showError, showSuccess],
  );

  const updateVirement = useCallback(
    async (id: string, input: { montantVerse?: number; note?: string | null }, opts?: { silent?: boolean }) => {
      setIsMutating(true);
      const snapshot = lignes;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setLignes((prev) =>
            prev.map((l) => {
              if (l.virementId !== id) return l;
              const montantVerse = input.montantVerse ?? l.montantVerse;
              return {
                ...l,
                montantVerse,
                ecart: montantVerse - l.doitVirer,
                note: input.note !== undefined ? input.note : l.note,
              };
            }),
          );
        },
        rollback: () => setLignes(snapshot),
        mutate: async () => {
          const data = await api.patch<{ virement: Virement }>(`/api/virements/${id}`, input);
          return data.virement;
        },
        showError,
        successMessage: opts?.silent ? undefined : "Virement mis à jour",
        showSuccess: opts?.silent ? undefined : showSuccess,
      });
      setIsMutating(false);
    },
    [lignes, showError, showSuccess],
  );

  const removeVirement = useCallback(
    async (id: string) => {
      setIsMutating(true);
      const snapshot = lignes;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setLignes((prev) =>
            prev.map((l) =>
              l.virementId === id
                ? { ...l, montantVerse: 0, ecart: -l.doitVirer, virementId: null, note: null }
                : l,
            ),
          );
        },
        rollback: () => setLignes(snapshot),
        mutate: async () => {
          await api.delete<{ ok: boolean }>(`/api/virements/${id}`);
        },
        showError,
        successMessage: "Virement supprimé",
        showSuccess,
      });
      setIsMutating(false);
    },
    [lignes, showError, showSuccess],
  );

  const goMoisPrecedent = useCallback(() => setMois((m) => shiftMois(m, -1)), []);
  const goMoisSuivant = useCallback(() => setMois((m) => shiftMois(m, 1)), []);

  return {
    mois,
    setMois,
    virements,
    lignes,
    soldes,
    resumeCommun,
    isLoading,
    error,
    isMutating,
    refresh,
    saisirVirement,
    updateVirement,
    removeVirement,
    fetchResumeMois,
    goMoisPrecedent,
    goMoisSuivant,
  };
}
