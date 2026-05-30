"use client";

import { useMemo, useRef } from "react";
import { ChargeFoyerForm } from "@/components/charges/charge-foyer-form";
import { ChargeList } from "@/components/charges/ChargeList";
import { ChargesStackedChart } from "@/components/charges/charges-stacked-chart";
import { Button } from "@/components/ui/button";
import { useCharges } from "@/hooks/useCharges";
import { useMembres } from "@/hooks/useMembres";
import { membresToSelectorOptions } from "@/lib/membres-options";

export function ChargesModuleView() {
  const formRef = useRef<HTMLDivElement>(null);
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
        <ChargesStackedChart charges={chargesFoyer} membres={membresOpts} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div ref={formRef}>
          <ChargeFoyerForm membres={membresOpts} isSubmitting={isMutating} onAdd={(c) => addCharge(c)} />
        </div>
        <ChargeList
          charges={chargesFoyer}
          membres={membresOpts}
          isMutating={isMutating}
          onUpdate={async (id, c) => {
            await updateCharge(id, c);
          }}
          onRemove={async (id) => {
            await removeCharge(id);
          }}
          onAddCta={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      </div>
    </div>
  );
}
