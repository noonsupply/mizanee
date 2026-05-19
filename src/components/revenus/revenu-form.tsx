"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MembreSelector } from "@/components/revenus/membre-selector";
import { TypeRevenuSelector } from "@/components/revenus/type-revenu-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import type { MembreRevenu } from "@/data/membres";
import { COMMUN_MEMBRE_ID, toApiMembreId, toFormMembreId } from "@/lib/commun-membre";
import { calculerMoyenneMensuelle, MOIS_CLES } from "@/lib/calculs-revenus";
import {
  defaultRevenuFormValues,
  defaultVariableMois,
  revenuFormSchema,
  type RevenuFormValues,
} from "@/lib/validations-revenus";
import type { Revenu, VariationFixe } from "@/types/revenus";

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

const VARIATIONS: { id: VariationFixe; label: string }[] = [
  { id: "stable", label: "Stable" },
  { id: "prime_annuelle", label: "Prime annuelle" },
  { id: "13e", label: "13e mois" },
];

export interface RevenuFormProps {
  membres: MembreRevenu[];
  onAdd: (revenu: Revenu) => void;
  editingRevenu?: Revenu | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
}

function buildRevenu(data: RevenuFormValues): Revenu {
  const id =
    typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `r-${Date.now()}`;
  const base = {
    id,
    membreId: toApiMembreId(data.membreId),
    label: data.label.trim(),
    actif: true as const,
  };

  if (data.type === "fixe") {
    return {
      ...base,
      type: "fixe",
      montantMensuel: data.montantFixe ?? 0,
      verseLe: data.verseLeFixe?.trim() || undefined,
      variationFixe: data.variationFixe,
    };
  }

  if (data.type === "variable") {
    const mp = { ...(data.variableMois ?? {}) };
    return {
      ...base,
      type: "variable",
      montantParMois: mp,
      montantMensuel: calculerMoyenneMensuelle(mp),
    };
  }

  if (data.type === "ponctuel") {
    const mois = data.moisArriveePonctuel ?? "01";
    const montant = data.montantPonctuel ?? 0;
    return {
      ...base,
      type: "ponctuel",
      montantParMois: { [mois]: montant },
      montantMensuel: montant / 12,
      certitude: data.certitude,
      verseLe: mois,
    };
  }

  const loyer = data.loyerNet ?? 0;
  const charges = data.chargesDeduites ?? 0;
  const net = Math.max(0, loyer - charges);
  return {
    ...base,
    type: "locatif",
    montantMensuel: net,
    verseLe: data.verseLeLocatif?.trim() || undefined,
    loyerNet: loyer,
    chargesLocativesDeduites: charges,
    moisAbsenceLocatif: data.moisAbsenceLocatif?.length ? [...data.moisAbsenceLocatif] : undefined,
  };
}

function previewMensuelle(data: RevenuFormValues): number {
  switch (data.type) {
    case "fixe":
      return Math.max(0, data.montantFixe ?? 0);
    case "variable":
      return calculerMoyenneMensuelle(data.variableMois ?? {});
    case "ponctuel":
      return (data.montantPonctuel ?? 0) / 12;
    case "locatif":
      return Math.max(0, (data.loyerNet ?? 0) - (data.chargesDeduites ?? 0));
    default:
      return 0;
  }
}

function revenuToFormValues(r: Revenu): RevenuFormValues {
  const base = defaultRevenuFormValues();
  base.membreId = toFormMembreId(r.membreId);
  base.label = r.label;
  base.type = r.type;
  if (r.type === "fixe") {
    base.montantFixe = r.montantMensuel;
    base.verseLeFixe = r.verseLe ?? "";
    base.variationFixe = r.variationFixe ?? "stable";
  }
  if (r.type === "variable" && r.montantParMois) {
    base.variableMois = { ...r.montantParMois };
  }
  if (r.type === "ponctuel" && r.montantParMois) {
    const mois = Object.keys(r.montantParMois)[0] ?? "01";
    base.moisArriveePonctuel = mois;
    base.montantPonctuel = r.montantParMois[mois] ?? r.montantMensuel * 12;
    base.certitude = r.certitude ?? "certain";
  }
  if (r.type === "locatif") {
    base.loyerNet = r.loyerNet ?? r.montantMensuel;
    base.chargesDeduites = r.chargesLocativesDeduites ?? 0;
    base.verseLeLocatif = r.verseLe ?? "";
    base.moisAbsenceLocatif = r.moisAbsenceLocatif ?? [];
  }
  return base;
}

export function RevenuForm({
  membres,
  onAdd,
  editingRevenu,
  isSubmitting = false,
  onCancelEdit,
}: RevenuFormProps) {
  const form = useForm<RevenuFormValues>({
    resolver: zodResolver(revenuFormSchema),
    defaultValues: editingRevenu ? revenuToFormValues(editingRevenu) : defaultRevenuFormValues(membres[0]?.id),
    mode: "onChange",
  });

  const { control, handleSubmit, register, setValue, reset, formState } = form;

  const type = useWatch({ control, name: "type" });
  const watched = useWatch({ control });

  const preview = useMemo(() => {
    const d = (watched ?? defaultRevenuFormValues(membres[0]?.id)) as RevenuFormValues;
    return previewMensuelle(d);
  }, [watched, membres]);

  useEffect(() => {
    if (type === "variable") {
      const cur = form.getValues("variableMois");
      if (!cur || Object.keys(cur).length === 0) {
        setValue("variableMois", defaultVariableMois(), { shouldValidate: false });
      }
    }
  }, [type, form, setValue]);

  return (
    <form
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit((data) => {
        const built = buildRevenu(data);
        if (editingRevenu) built.id = editingRevenu.id;
        onAdd(built);
        reset(defaultRevenuFormValues(membres[0]?.id));
        onCancelEdit?.();
      })}
    >
      <MembreSelector
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
        render={({ field }) => <TypeRevenuSelector selected={field.value} onChange={field.onChange} />}
      />

      <div className="space-y-2">
        <Label htmlFor="revenu-label">{type === "locatif" ? "Libellé du bien" : "Libellé"}</Label>
        <Input
          id="revenu-label"
          placeholder={
            type === "locatif" ? "Ex. Appartement centre-ville" : "Ex. Salaire net, Prime…"
          }
          {...register("label")}
        />
        {formState.errors.label && (
          <p className="text-xs text-rose-600" role="alert">
            {formState.errors.label.message}
          </p>
        )}
      </div>

      {type === "fixe" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="montant-fixe">Montant mensuel (€)</Label>
              <Input id="montant-fixe" type="number" min={0} step={0.01} {...register("montantFixe")} />
              {formState.errors.montantFixe && (
                <p className="text-xs text-rose-600">{formState.errors.montantFixe.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="verse-fixe">Versé le</Label>
              <Input id="verse-fixe" placeholder="Ex. 5 du mois" {...register("verseLeFixe")} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Variation</p>
            <div className="flex flex-wrap gap-2">
              {VARIATIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setValue("variationFixe", v.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    watched?.variationFixe === v.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === "variable" && (
        <div className="space-y-3">
          <Label>Grille sur 12 mois (€)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {MOIS_CLES.map((cle) => (
              <div key={cle} className="space-y-1">
                <Label htmlFor={`vm-${cle}`} className="text-xs text-slate-500">
                  {MOIS_LABEL[cle]}
                </Label>
                <Input
                  id={`vm-${cle}`}
                  type="number"
                  step={0.01}
                  {...register(`variableMois.${cle}` as Path<RevenuFormValues>, { valueAsNumber: true })}
                />
              </div>
            ))}
          </div>
          {formState.errors.variableMois && (
            <p className="text-xs text-rose-600">
              {"message" in formState.errors.variableMois &&
              typeof formState.errors.variableMois.message === "string"
                ? formState.errors.variableMois.message
                : "Saisissez au moins un montant sur la grille"}
            </p>
          )}
        </div>
      )}

      {type === "ponctuel" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="montant-ponctuel">Montant (€)</Label>
            <Input id="montant-ponctuel" type="number" min={0} step={0.01} {...register("montantPonctuel")} />
            {formState.errors.montantPonctuel && (
              <p className="text-xs text-rose-600">{formState.errors.montantPonctuel.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mois-arrivee">Mois d&apos;arrivée</Label>
            <Select id="mois-arrivee" {...register("moisArriveePonctuel")}>
              {MOIS_CLES.map((cle) => (
                <option key={cle} value={cle}>
                  {MOIS_LABEL[cle]}
                </option>
              ))}
            </Select>
            {formState.errors.moisArriveePonctuel && (
              <p className="text-xs text-rose-600">{formState.errors.moisArriveePonctuel.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium text-slate-600">Certitude</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "certain" as const, label: "Certain" },
                  { id: "probable" as const, label: "Probable" },
                  { id: "incertain" as const, label: "Incertain" },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setValue("certitude", c.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    watched?.certitude === c.id
                      ? "border-amber-600 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === "locatif" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loyer-net">Loyer net mensuel (€)</Label>
              <Input id="loyer-net" type="number" min={0} step={0.01} {...register("loyerNet")} />
              {formState.errors.loyerNet && <p className="text-xs text-rose-600">{formState.errors.loyerNet.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="charges-d">Charges déduites (€ / mois)</Label>
              <Input id="charges-d" type="number" min={0} step={0.01} {...register("chargesDeduites")} />
              {formState.errors.chargesDeduites && (
                <p className="text-xs text-rose-600">{formState.errors.chargesDeduites.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="verse-loc">Versé le</Label>
              <Input id="verse-loc" placeholder="Ex. 8 du mois" {...register("verseLeLocatif")} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Mois sans encaissement</p>
            <div className="flex flex-wrap gap-2">
              {MOIS_CLES.map((cle) => {
                const abs = watched?.moisAbsenceLocatif ?? [];
                const on = abs.includes(cle);
                return (
                  <button
                    key={cle}
                    type="button"
                    onClick={() => {
                      const next = on ? abs.filter((x) => x !== cle) : [...abs, cle];
                      setValue("moisAbsenceLocatif", next);
                    }}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                      on ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    {MOIS_LABEL[cle]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm">
        <span className="font-medium text-slate-700">Moy. mensuelle estimée : </span>
        <span className="font-bold text-indigo-900">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
            preview,
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {editingRevenu ? "Enregistrer les modifications" : "Ajouter ce revenu"}
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
