"use client";

import { useMemo, useRef } from "react";
import { RevenuForm } from "@/components/revenus/revenu-form";
import { RevenuList } from "@/components/revenus/revenu-list";
import { Button } from "@/components/ui/button";
import { useMembres } from "@/hooks/useMembres";
import { useRevenus } from "@/hooks/useRevenus";
import { membresToSelectorOptions } from "@/lib/membres-options";

export default function RevenusPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const { membres, isLoading: loadingMembres } = useMembres();
  const { revenus, isLoading, error, isMutating, refresh, addRevenu, updateRevenu, removeRevenu } = useRevenus();

  const membresOpts = useMemo(() => membresToSelectorOptions(membres), [membres]);

  if (isLoading || loadingMembres) {
    return <p className="text-sm text-slate-500">Chargement des revenus…</p>;
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
        <h1 className="text-xl font-bold text-slate-900">Revenus</h1>
        <p className="text-sm text-slate-500">Vue foyer : tous les revenus au même endroit, différenciés par membre.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div ref={formRef}>
          <RevenuForm membres={membresOpts} isSubmitting={isMutating} onAdd={(r) => addRevenu(r)} />
        </div>
        <RevenuList
          revenus={revenus}
          membres={membresOpts}
          isMutating={isMutating}
          onUpdate={async (id, r) => {
            await updateRevenu(id, r);
          }}
          onRemove={async (id) => {
            await removeRevenu(id);
          }}
          onAddCta={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      </div>
    </div>
  );
}
