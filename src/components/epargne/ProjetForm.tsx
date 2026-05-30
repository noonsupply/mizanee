"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  defaultProjetAjoutValues,
  projetAjoutSchemaAvecDateFuture,
  type ProjetAjoutValues,
} from "@/lib/validations-projets";
import type { Projet, StatutProjet } from "@/types/projets";

const COULEURS_DEFAUT = ["#0F6E56", "#1D9E75", "#D85A30", "#378ADD", "#D4537E", "#EF9F27", "#5DCAA5"] as const;

function nouvelIdProjet(): string {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  const perf = globalThis.performance;
  const n = typeof perf?.now === "function" ? perf.now() : 0;
  return `p-${Math.round(n)}`;
}

function couleurPourSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COULEURS_DEFAUT[h % COULEURS_DEFAUT.length] ?? "#0F6E56";
}

export interface ProjetFormProps {
  defaultPriorite: number;
  onAdd: (projet: Projet) => void;
}

export function ProjetForm({ defaultPriorite, onAdd }: ProjetFormProps) {
  const form = useForm<ProjetAjoutValues>({
    resolver: zodResolver(projetAjoutSchemaAvecDateFuture),
    defaultValues: { ...defaultProjetAjoutValues(), priorite: defaultPriorite },
  });

  const { register, handleSubmit, reset, formState } = form;

  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-slate-200 bg-slate-50/80 px-3 py-4"
      onSubmit={handleSubmit((data) => {
        const label = data.label.trim();
        onAdd({
          id: nouvelIdProjet(),
          label,
          montant: data.montant,
          date: data.date,
          priorite: data.priorite,
          color: couleurPourSeed(`${label}|${data.date}|${data.montant}`),
          statut: "en_cours" as StatutProjet,
          montantDeja: 0,
        });
        reset({ ...defaultProjetAjoutValues(), priorite: defaultPriorite });
      })}
    >
      <div className="min-w-[140px] flex-[2] space-y-1">
        <Label htmlFor="pf-label">Libellé</Label>
        <Input id="pf-label" placeholder="Nouveau projet" {...register("label")} />
        {formState.errors.label && <p className="text-xs text-rose-600">{formState.errors.label.message}</p>}
      </div>
      <div className="min-w-[100px] flex-1 space-y-1">
        <Label htmlFor="pf-montant">Montant (€)</Label>
        <Input id="pf-montant" type="number" min={1} step={1} {...register("montant")} />
        {formState.errors.montant && <p className="text-xs text-rose-600">{formState.errors.montant.message}</p>}
      </div>
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label htmlFor="pf-date">Date cible</Label>
        <Input id="pf-date" type="month" {...register("date")} />
        {formState.errors.date && <p className="text-xs text-rose-600">{formState.errors.date.message}</p>}
      </div>
      <div className="min-w-[100px] flex-1 space-y-1">
        <Label htmlFor="pf-prio">Priorité</Label>
        <Select id="pf-prio" {...register("priorite", { valueAsNumber: true })}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" className="shrink-0">
        Ajouter
      </Button>
    </form>
  );
}
