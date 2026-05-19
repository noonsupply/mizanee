"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MembreSelector } from "@/components/revenus/membre-selector";
import { TypeChargeSelector } from "@/components/charges/type-charge-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { MembreRevenu } from "@/data/membres";
import { COMMUN_MEMBRE_ID, toApiMembreId, toFormMembreId } from "@/lib/commun-membre";
import { calculerMoyenneMensuelleCharge } from "@/lib/calculs-charges";
import { MOIS_CLES } from "@/lib/calculs-revenus";
import {
  chargeFoyerFormSchema,
  defaultChargeFoyerFormValues,
  defaultGrilleMois,
  type ChargeFoyerFormValues,
} from "@/lib/validations-charges";
import type { ChargeFoyer } from "@/types/charges";

const MOIS_LABEL: Record<string, string> = {
  "01": "Janv.",
  "02": "Févr.",
  "03": "Mars",
  "04": "Avr.",
  "05": "Mai",
  "06": "Juin",
  "07": "Juil.",
  "08": "Août",
  "09": "Sept.",
  "10": "Oct.",
  "11": "Nov.",
  "12": "Déc.",
};

export interface ChargeFoyerFormProps {
  membres: MembreRevenu[];
  onAdd: (charge: ChargeFoyer) => void;
  editingCharge?: ChargeFoyer | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
}

function buildCharge(data: ChargeFoyerFormValues): ChargeFoyer {
  const id =
    typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `c-${Date.now()}`;
  const base = {
    id,
    membreId: toApiMembreId(data.membreId),
    label: data.label.trim(),
    actif: true as const,
  };

  if (data.type === "recurrente_fixe") {
    return {
      ...base,
      type: "recurrente_fixe",
      montantMensuel: data.montantFixe ?? 0,
      verseLe: data.verseLeFixe?.trim() || undefined,
    };
  }

  if (data.type === "recurrente_variable" || data.type === "saisonniere") {
    const g = { ...(data.grilleMois ?? {}) };
    return {
      ...base,
      type: data.type,
      montantParMois: g,
      montantMensuel: calculerMoyenneMensuelleCharge(g),
    };
  }

  const mois = data.moisPaiementAnnuel ?? "01";
  const annuel = data.montantAnnuel ?? 0;
  return {
    ...base,
    type: "annuelle",
    montantAnnuel: annuel,
    montantParMois: { [mois]: annuel },
    montantMensuel: annuel / 12,
  };
}

function previewMensuelle(data: ChargeFoyerFormValues): number {
  switch (data.type) {
    case "recurrente_fixe":
      return Math.max(0, data.montantFixe ?? 0);
    case "recurrente_variable":
    case "saisonniere":
      return calculerMoyenneMensuelleCharge(data.grilleMois ?? {});
    case "annuelle":
      return (data.montantAnnuel ?? 0) / 12;
    default:
      return 0;
  }
}

function chargeToFormValues(c: ChargeFoyer): ChargeFoyerFormValues {
  const base = defaultChargeFoyerFormValues(c.membreId);
  base.label = c.label;
  base.type = c.type;
  base.membreId = toFormMembreId(c.membreId);
  if (c.type === "recurrente_fixe") {
    base.montantFixe = c.montantMensuel;
    base.verseLeFixe = c.verseLe ?? "";
  }
  if (c.type === "recurrente_variable" || c.type === "saisonniere") {
    base.grilleMois = { ...(c.montantParMois ?? {}) };
  }
  if (c.type === "annuelle") {
    const mois = c.montantParMois ? Object.keys(c.montantParMois)[0] : "01";
    base.montantAnnuel = c.montantAnnuel ?? c.montantMensuel * 12;
    base.moisPaiementAnnuel = mois ?? "01";
  }
  return base;
}

export function ChargeFoyerForm({
  membres,
  onAdd,
  editingCharge,
  isSubmitting = false,
  onCancelEdit,
}: ChargeFoyerFormProps) {
  const form = useForm<ChargeFoyerFormValues>({
    resolver: zodResolver(chargeFoyerFormSchema),
    defaultValues: editingCharge ? chargeToFormValues(editingCharge) : defaultChargeFoyerFormValues(membres[0]?.id),
    mode: "onChange",
  });

  const { control, handleSubmit, register, setValue, reset, formState } = form;
  const type = useWatch({ control, name: "type" });
  const watched = useWatch({ control });

  const preview = useMemo(() => {
    const d = (watched ?? defaultChargeFoyerFormValues(membres[0]?.id)) as ChargeFoyerFormValues;
    return previewMensuelle(d);
  }, [watched]);

  useEffect(() => {
    if (type === "recurrente_variable" || type === "saisonniere") {
      const cur = form.getValues("grilleMois");
      if (!cur || Object.keys(cur).length === 0) {
        setValue("grilleMois", defaultGrilleMois(), { shouldValidate: false });
      }
    }
  }, [type, form, setValue]);

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit((data) => {
        const built = buildCharge(data);
        if (editingCharge) built.id = editingCharge.id;
        onAdd(built);
        reset(defaultChargeFoyerFormValues(membres[0]?.id));
        onCancelEdit?.();
      })}
    >
      <MembreSelector
        context="charges"
        membres={membres}
        selected={
          watched?.membreId !== undefined
            ? toFormMembreId(watched.membreId)
            : (membres[0]?.id ?? COMMUN_MEMBRE_ID)
        }
        onChange={(id) => setValue("membreId", id)}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => <TypeChargeSelector selected={field.value} onChange={field.onChange} />}
      />

      <div className="space-y-2">
        <Label htmlFor="charge-label">Libellé</Label>
        <Input id="charge-label" placeholder="Ex. Loyer, Électricité…" {...register("label")} />
        {formState.errors.label && (
          <p className="text-xs text-rose-600" role="alert">
            {formState.errors.label.message}
          </p>
        )}
      </div>

      {type === "recurrente_fixe" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="montant-charge-fixe">Montant mensuel (€)</Label>
            <Input id="montant-charge-fixe" type="number" min={0} step={0.01} {...register("montantFixe")} />
            {formState.errors.montantFixe && (
              <p className="text-xs text-rose-600">{formState.errors.montantFixe.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="verse-charge-fixe">Versé le (optionnel)</Label>
            <Input id="verse-charge-fixe" placeholder="Ex. 5 du mois" {...register("verseLeFixe")} />
          </div>
        </div>
      )}

      {(type === "recurrente_variable" || type === "saisonniere") && (
        <div className="space-y-3">
          <Label>Grille sur 12 mois (€)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {MOIS_CLES.map((cle) => (
              <div key={cle} className="space-y-1">
                <Label htmlFor={`cg-${cle}`} className="text-xs text-slate-500">
                  {MOIS_LABEL[cle]}
                </Label>
                <Input
                  id={`cg-${cle}`}
                  type="number"
                  step={0.01}
                  {...register(`grilleMois.${cle}` as Path<ChargeFoyerFormValues>, { valueAsNumber: true })}
                />
              </div>
            ))}
          </div>
          {formState.errors.grilleMois && (
            <p className="text-xs text-rose-600">
              {"message" in formState.errors.grilleMois && typeof formState.errors.grilleMois.message === "string"
                ? formState.errors.grilleMois.message
                : "Saisissez au moins un montant sur la grille"}
            </p>
          )}
        </div>
      )}

      {type === "annuelle" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="montant-annuel">Montant annuel (€)</Label>
            <Input id="montant-annuel" type="number" min={0} step={0.01} {...register("montantAnnuel")} />
            {formState.errors.montantAnnuel && (
              <p className="text-xs text-rose-600">{formState.errors.montantAnnuel.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mois-paiement">Mois de paiement</Label>
            <Select id="mois-paiement" {...register("moisPaiementAnnuel")}>
              {MOIS_CLES.map((cle) => (
                <option key={cle} value={cle}>
                  {MOIS_LABEL[cle]}
                </option>
              ))}
            </Select>
            {formState.errors.moisPaiementAnnuel && (
              <p className="text-xs text-rose-600">{formState.errors.moisPaiementAnnuel.message}</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <span className="font-medium text-slate-700">Moy. mensuelle estimée : </span>
        <span className="font-bold text-slate-900">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
            preview,
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {editingCharge ? "Enregistrer les modifications" : "Ajouter cette charge"}
        </Button>
        {onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isSubmitting}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
