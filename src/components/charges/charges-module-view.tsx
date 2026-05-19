"use client";

import { useMemo, useState } from "react";
import { ChargeFoyerForm } from "@/components/charges/charge-foyer-form";
import { ChargeListeFoyer } from "@/components/charges/charge-liste-foyer";
import { ChargesStackedChart } from "@/components/charges/charges-stacked-chart";
import { Button } from "@/components/ui/button";
import { useCharges } from "@/hooks/useCharges";
import { useMembres } from "@/hooks/useMembres";
import { membresToSelectorOptions } from "@/lib/membres-options";
import type { ChargeFoyer } from "@/types/charges";

export function ChargesModuleView() {
  const { membres, isLoading: loadingMembres } = useMembres();
  const {
    chargesFoyer,
    isLoading,
    error,
    isMutating,
    refresh,
    addCharge,
    updateCharge,
    removeCharge,
  } = useCharges();
  const [editing, setEditing] = useState<ChargeFoyer | null>(null);

  const membresOpts = useMemo(() => membresToSelectorOptions(membres), [membres]);

  if (isLoading || loadingMembres) {
    return <p className="text-sm text-slate-500">Chargement des charges…</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-rose-600">{error.message}</p>
        <Button type="button" variant="outline" onClick={() => void refresh()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Charges</h1>
        <p className="text-sm text-slate-500">
          Vue foyer : graphique mensuel empilé, formulaire et liste — même logique « Pour qui ? » que les revenus.
        </p>
      </div>

      <section aria-labelledby="charges-chart-title" className="space-y-2">
        <h2 id="charges-chart-title" className="sr-only">
          Graphique des charges par mois
        </h2>
        <ChargesStackedChart charges={chargesFoyer} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <ChargeFoyerForm
          key={editing?.id ?? "new"}
          membres={membresOpts}
          editingCharge={editing}
          isSubmitting={isMutating}
          onAdd={async (c) => {
            if (editing) {
              await updateCharge(editing.id, { ...c, id: editing.id });
              setEditing(null);
            } else {
              await addCharge(c);
            }
          }}
          onCancelEdit={editing ? () => setEditing(null) : undefined}
        />
        <ChargeListeFoyer
          charges={chargesFoyer}
          membres={membresOpts}
          isMutating={isMutating}
          onEdit={setEditing}
          onRemove={(id) => {
            if (window.confirm("Supprimer cette charge ?")) void removeCharge(id);
          }}
        />
      </div>
    </div>
  );
}
