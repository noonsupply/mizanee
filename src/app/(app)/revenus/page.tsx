"use client";

import { useMemo, useState } from "react";
import { RevenuForm } from "@/components/revenus/revenu-form";
import { RevenuList } from "@/components/revenus/revenu-list";
import { Button } from "@/components/ui/button";
import { useMembres } from "@/hooks/useMembres";
import { useRevenus } from "@/hooks/useRevenus";
import { membresToSelectorOptions } from "@/lib/membres-options";
import type { Revenu } from "@/types/revenus";

export default function RevenusPage() {
  const { membres, isLoading: loadingMembres } = useMembres();
  const { revenus, isLoading, error, isMutating, refresh, addRevenu, updateRevenu, removeRevenu } =
    useRevenus();
  const [editing, setEditing] = useState<Revenu | null>(null);

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
      {revenus.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Aucun revenu enregistré. Ajoutez le premier via le formulaire.
        </p>
      )}
      <RevenusGrid
        editing={editing}
        membresOpts={membresOpts}
        isMutating={isMutating}
        revenus={revenus}
        onSave={async (r) => {
          if (editing) {
            await updateRevenu(editing.id, { ...r, id: editing.id });
            setEditing(null);
          } else {
            await addRevenu(r);
          }
        }}
        onCancelEdit={() => setEditing(null)}
        onEdit={setEditing}
        onRemove={(id) => {
          if (window.confirm("Supprimer ce revenu ?")) void removeRevenu(id);
        }}
      />
    </div>
  );
}

function RevenusGrid({
  editing,
  membresOpts,
  isMutating,
  revenus,
  onSave,
  onCancelEdit,
  onEdit,
  onRemove,
}: {
  editing: Revenu | null;
  membresOpts: ReturnType<typeof membresToSelectorOptions>;
  isMutating: boolean;
  revenus: Revenu[];
  onSave: (r: Revenu) => Promise<void>;
  onCancelEdit: () => void;
  onEdit: (r: Revenu) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-2">
        <RevenuForm
          key={editing?.id ?? "new"}
          membres={membresOpts}
          editingRevenu={editing}
          isSubmitting={isMutating}
          onAdd={(r) => void onSave(r)}
          onCancelEdit={editing ? onCancelEdit : undefined}
        />
      </div>
      <RevenuList
        revenus={revenus}
        membres={membresOpts}
        isMutating={isMutating}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  );
}
