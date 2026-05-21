"use client";

import { useCallback, useMemo, useState } from "react";
import { MembreCard } from "@/components/membres/MembreCard";
import { MembreForm, type MembreFormValues } from "@/components/membres/MembreForm";
import { RepartitionSlider } from "@/components/membres/RepartitionSlider";
import { CompteCommunResume } from "@/components/membres/CompteCommunResume";
import { VirementCard } from "@/components/membres/VirementCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useCharges } from "@/hooks/useCharges";
import { useMembres } from "@/hooks/useMembres";
import { useRevenus } from "@/hooks/useRevenus";
import { useVirements } from "@/hooks/useVirements";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import type { MembreUI } from "@/types";
import styles from "./membres.module.css";

type PanelMode = "closed" | "add" | "edit";

export default function MembresPage() {
  const { raw: revenusRaw } = useRevenus();
  const { charges } = useCharges();
  const {
    membresUI,
    isLoading: loadingMembres,
    error: errorMembres,
    isMutating: mutatingMembres,
    refresh: refreshMembres,
    addMembre,
    updateMembre,
    deactivateMembre,
    removeMembre,
  } = useMembres({ revenus: revenusRaw, charges });

  const {
    mois,
    lignes,
    soldes,
    resumeCommun,
    isLoading: loadingVirements,
    error: errorVirements,
    isMutating: mutatingVirements,
    refresh: refreshVirements,
    saisirVirement,
    updateVirement,
    goMoisPrecedent,
    goMoisSuivant,
  } = useVirements();

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

  const totalCommunes = useMemo(() => resumeCommun?.chargesCommunes ?? 0, [resumeCommun]);

  const prorataPercent = useMemo(() => {
    const base: Record<string, number> = {};
    membresUI.forEach((m) => {
      base[m.id] = prorataLocal[m.id] ?? m.prorata;
    });
    return base;
  }, [membresUI, prorataLocal]);

  const debouncedProrata = useDebouncedCallback((membreId: string, percent: number) => {
    void updateMembre(membreId, { prorata: percent }).then(() => void refreshVirements());
  }, 500);

  const handleSaveMontant = useCallback(
    async (ligne: (typeof lignes)[0], montantVerse: number) => {
      if (ligne.virementId) {
        await updateVirement(ligne.virementId, { montantVerse }, { silent: true });
      } else {
        await saisirVirement(
          { membreId: ligne.membreId, mois, montantVerse, note: ligne.note },
          { silent: true },
        );
      }
    },
    [mois, saisirVirement, updateVirement],
  );

  const handleSaveNote = useCallback(
    async (ligne: (typeof lignes)[0], note: string | null) => {
      if (ligne.virementId) {
        await updateVirement(ligne.virementId, { note }, { silent: true });
      } else {
        await saisirVirement(
          { membreId: ligne.membreId, mois, montantVerse: ligne.montantVerse, note },
          { silent: true },
        );
      }
    },
    [mois, saisirVirement, updateVirement],
  );

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

  if (loadingMembres) {
    return <p className="text-sm text-slate-500">Chargement des membres…</p>;
  }

  if (errorMembres) {
    return (
      <ErrorRetryState
        message={errorMembres.message}
        onRetry={() => {
          void refreshMembres();
          void refreshVirements();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membres</h1>
          <p className="text-sm text-slate-500">Profils, reste à vivre, prorata et compte commun.</p>
        </div>
        <Button type="button" onClick={openAdd} disabled={mutatingMembres}>
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
            isMutating={mutatingMembres}
            onEdit={() => openEdit(m)}
            onDeactivate={() => setConfirmDeactivate(m)}
            onDelete={() => setConfirmDelete(m)}
          />
        ))}
      </div>

      <hr className="border-slate-200" />

      <section className="space-y-4" aria-labelledby="compte-commun-title">
        <h2 id="compte-commun-title" className="text-lg font-bold text-slate-900">
          Compte commun
        </h2>

        {loadingVirements && (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className={styles.virementGrid}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        )}

        {errorVirements && !loadingVirements && (
          <ErrorRetryState message={errorVirements.message} onRetry={() => void refreshVirements()} />
        )}

        {resumeCommun && !loadingVirements && !errorVirements && (
          <>
            <CompteCommunResume
              resume={resumeCommun}
              onMoisPrecedent={goMoisPrecedent}
              onMoisSuivant={goMoisSuivant}
            />
            <div className={styles.virementGrid}>
              {lignes.map((ligne) => (
                <VirementCard
                  key={ligne.membreId}
                  ligne={ligne}
                  mois={mois}
                  solde={soldes[ligne.membreId]}
                  disabled={mutatingVirements}
                  onSaveMontant={(montant) => handleSaveMontant(ligne, montant)}
                  onSaveNote={(note) => handleSaveNote(ligne, note)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        title="Désactiver ce membre ?"
        description={`${confirmDeactivate?.prenom} ne sera plus pris en compte dans les calculs actifs.`}
        confirmLabel="Désactiver"
        variant="danger"
        isLoading={mutatingMembres}
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
        isLoading={mutatingMembres}
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
