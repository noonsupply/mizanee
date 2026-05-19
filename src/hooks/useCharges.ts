"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { isApiDebug, pickPayloadArray } from "@/lib/api-helpers";
import { mapChargeApiToFoyer, mapChargeFoyerToApiInput } from "@/lib/api-mappers";
import { runOptimisticMutation } from "@/lib/optimistic-mutation";
import { useToast } from "@/components/ui/toast";
import type { ChargeApi, CreateChargeInput, UpdateChargeInput } from "@/types/api";
import { isCommunMembreId } from "@/lib/commun-membre";
import type { ChargeCategorie, ChargeUI } from "@/types";
import type { ChargeFoyer } from "@/types/charges";

function foyerToChargeUI(c: ChargeFoyer): ChargeUI {
  return {
    id: c.id,
    label: c.label,
    montant: c.montantMensuel,
    categorie: "AUTRE" as ChargeCategorie,
    type: isCommunMembreId(c.membreId) ? "COMMUNE" : "PERSONNELLE",
    membreId: isCommunMembreId(c.membreId) ? null : c.membreId,
    actif: c.actif,
  };
}

export function useCharges() {
  const { showSuccess, showError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [charges, setCharges] = useState<ChargeApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const snapshotRef = useRef<ChargeApi[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<{ charges: ChargeApi[] }>("/api/charges");
      const list = pickPayloadArray<ChargeApi>(data, "charges");
      if (isApiDebug) console.log("[useCharges] réponse:", data, "count:", list.length);
      setCharges(list);
    } catch (e) {
      if (isApiDebug) console.error("[useCharges] erreur fetch:", e);
      setError(e instanceof Error ? e : new Error("Impossible de charger les charges"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCharges([]);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const chargesFoyer = useMemo(() => charges.map((c) => mapChargeApiToFoyer(c)), [charges]);
  const communes = useMemo(
    () => chargesFoyer.filter((c) => isCommunMembreId(c.membreId) && c.actif),
    [chargesFoyer],
  );
  const personnelles = useMemo(
    () => chargesFoyer.filter((c) => !isCommunMembreId(c.membreId) && c.actif).map(foyerToChargeUI),
    [chargesFoyer],
  );
  const communesUI = useMemo(
    () => chargesFoyer.filter((c) => isCommunMembreId(c.membreId) && c.actif).map(foyerToChargeUI),
    [chargesFoyer],
  );

  const addCharge = useCallback(
    async (charge: ChargeFoyer) => {
      const input = mapChargeFoyerToApiInput(charge) as CreateChargeInput;
      setIsMutating(true);
      snapshotRef.current = charges;
      let created: ChargeFoyer | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          const temp: ChargeApi = {
            id: `temp-${Date.now()}`,
            label: input.label,
            montant: input.montant ?? 0,
            montantParMois: input.montantParMois,
            montantMensuelMoyen: input.montant ?? 0,
            categorie: input.categorie,
            type: input.type ?? "COMMUNE",
            actif: input.actif ?? true,
            membreId: input.membreId ?? null,
          };
          setCharges((prev) => [temp, ...prev]);
          created = mapChargeApiToFoyer(temp);
        },
        rollback: () => setCharges(snapshotRef.current),
        mutate: async () => {
          const data = await api.post<{ charge: ChargeApi }>("/api/charges", input);
          setCharges((prev) => [data.charge, ...prev.filter((c) => !c.id.startsWith("temp-"))]);
          created = mapChargeApiToFoyer(data.charge);
          return created;
        },
        showError,
        successMessage: "Charge ajoutée",
        showSuccess,
      });
      setIsMutating(false);
      return created;
    },
    [charges, showError, showSuccess],
  );

  const updateCharge = useCallback(
    async (id: string, charge: ChargeFoyer) => {
      const input = mapChargeFoyerToApiInput(charge) as UpdateChargeInput;
      setIsMutating(true);
      snapshotRef.current = charges;
      let updated: ChargeFoyer | undefined;
      await runOptimisticMutation({
        applyOptimistic: () => {
          setCharges((prev) =>
            prev.map((c) =>
              c.id === id
                ? {
                    ...c,
                    label: input.label ?? c.label,
                    montant: input.montant ?? c.montant,
                    categorie: input.categorie ?? c.categorie,
                    type: input.type ?? c.type,
                    actif: input.actif ?? c.actif,
                    membreId: input.membreId !== undefined ? input.membreId : c.membreId,
                  }
                : c,
            ),
          );
        },
        rollback: () => setCharges(snapshotRef.current),
        mutate: async () => {
          const data = await api.patch<{ charge: ChargeApi }>(`/api/charges/${id}`, input);
          setCharges((prev) => prev.map((c) => (c.id === id ? data.charge : c)));
          updated = mapChargeApiToFoyer(data.charge);
          return updated;
        },
        showError,
        successMessage: "Charge mise à jour",
        showSuccess,
      });
      setIsMutating(false);
      return updated;
    },
    [charges, showError, showSuccess],
  );

  const removeCharge = useCallback(
    async (id: string) => {
      setIsMutating(true);
      snapshotRef.current = charges;
      await runOptimisticMutation({
        applyOptimistic: () => setCharges((prev) => prev.filter((c) => c.id !== id)),
        rollback: () => setCharges(snapshotRef.current),
        mutate: () => api.delete<{ ok: boolean }>(`/api/charges/${id}`),
        showError,
        successMessage: "Charge supprimée",
        showSuccess,
      });
      setIsMutating(false);
    },
    [charges, showError, showSuccess],
  );

  return {
    charges,
    chargesFoyer,
    communes: communesUI,
    communesFoyer: communes,
    personnelles,
    isLoading,
    error,
    isMutating,
    refresh,
    addCharge,
    updateCharge,
    removeCharge,
  };
}
