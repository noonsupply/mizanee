"use client";

import { useCallback, useMemo, useState } from "react";
import { MembreCard } from "@/components/membres/MembreCard";
import { MembreForm, type MembreFormValues } from "@/components/membres/MembreForm";
import { RepartitionSlider } from "@/components/membres/RepartitionSlider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useCharges } from "@/hooks/useCharges";
import { useMembres } from "@/hooks/useMembres";
import { useRevenus } from "@/hooks/useRevenus";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { isCommunMembreId } from "@/lib/commun-membre";
import type { MembreUI } from "@/types";

type PanelMode = "closed" | "add" | "edit";

export default function MembresPage() {
  const { raw: revenusRaw } = useRevenus();
  const { charges, chargesFoyer } = useCharges();
  const {
    membresUI,
    isLoading,
    error,
    isMutating,
    refresh,
    addMembre,
    updateMembre,
    deactivateMembre,
    removeMembre,
  } = useMembres({ revenus: revenusRaw, charges });

  const [panel, setPanel] = useState<PanelMode>("closed");
  const [formValues, setFormValues] = useState<MembreFormValues>({
    prenom: "",
    couleur: "#378ADD",
    emoji: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prorataLocal, setProrataLocal] = useState<Record<string, number>>({});
  const [confirmDeactivate, setConfirmDeactivate] = useState<MembreUI | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MembreUI | null>(null);

  const totalCommunes = chargesFoyer
    .filter((c) => isCommunMembreId(c.membreId) && c.actif)
    .reduce((s, c) => s + c.montantMensuel, 0);

  const prorataPercent = useMemo(() => {
    const base: Record<string, number> = {};
    membresUI.forEach((m) => {
      base[m.id] = prorataLocal[m.id] ?? m.prorata;
    });
    return base;
  }, [membresUI, prorataLocal]);

  const debouncedProrata = useDebouncedCallback((membreId: string, percent: number) => {
    void updateMembre(membreId, { prorata: percent });
  }, 500);

  const openAdd = () => {
    setEditingId(null);
    setFormValues({ prenom: "", couleur: "#378ADD", emoji: "" });
    setPanel("add");
  };

  const openEdit = (m: MembreUI) => {
    setEditingId(m.id);
    setFormValues({ prenom: m.prenom, couleur: m.couleur, emoji: m.emoji ?? "" });
    setPanel("edit");
  };

  const handleFormSubmit = async () => {
    if (!formValues.prenom.trim()) return;
    if (panel === "add") {
      await addMembre({
        prenom: formValues.prenom.trim(),
        couleur: formValues.couleur,
        emoji: formValues.emoji || null,
      });
    } else if (editingId) {
      await updateMembre(editingId, {
        prenom: formValues.prenom.trim(),
        couleur: formValues.couleur,
        emoji: formValues.emoji || null,
      });
    }
    setPanel("closed");
  };

  const handleProrataChange = useCallback(
    (id: string, v: number) => {
      setProrataLocal((o) => ({ ...o, [id]: v }));
      debouncedProrata(id, v);
    },
    [debouncedProrata],
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">Chargement des membres…</p>;
  }

  if (error) {
    return (
      <ErrorRetryState message={error.message} onRetry={() => void refresh()} />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membres</h1>
          <p className="text-sm text-slate-500">Profils, reste à vivre et prorata des charges communes.</p>
        </div>
        <Button type="button" onClick={openAdd} disabled={isMutating}>
          Ajouter un membre
        </Button>
      </div>

      {panel !== "closed" && (
        <MembreForm
          title={panel === "add" ? "Nouveau membre" : "Modifier le membre"}
          submitLabel={panel === "add" ? "Ajouter" : "Enregistrer"}
          values={formValues}
          onChange={(patch) => setFormValues((v) => ({ ...v, ...patch }))}
          onSubmit={() => void handleFormSubmit()}
        />
      )}

      <RepartitionSlider
        membres={membresUI.filter((m) => m.actif !== false)}
        prorataPercent={prorataPercent}
        onProrataChange={handleProrataChange}
        totalCommunes={totalCommunes}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {membresUI.map((m) => (
          <MembreCard
            key={m.id}
            membre={m}
            isMutating={isMutating}
            onEdit={() => openEdit(m)}
            onDeactivate={() => setConfirmDeactivate(m)}
            onDelete={() => setConfirmDelete(m)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        title="Désactiver ce membre ?"
        description={`${confirmDeactivate?.prenom} ne sera plus pris en compte dans les calculs actifs.`}
        confirmLabel="Désactiver"
        variant="danger"
        isLoading={isMutating}
        onCancel={() => setConfirmDeactivate(null)}
        onConfirm={() => {
          if (confirmDeactivate) void deactivateMembre(confirmDeactivate.id);
          setConfirmDeactivate(null);
        }}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Supprimer ${confirmDelete?.prenom} ?`}
        description="Cette action est irréversible. Supprimer ce membre supprimera aussi tous ses revenus et charges associés."
        confirmLabel="Supprimer définitivement"
        variant="danger"
        isLoading={isMutating}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) void removeMembre(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

function ErrorRetryState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm text-rose-600">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}
