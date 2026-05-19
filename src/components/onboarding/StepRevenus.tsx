"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { RevenuType } from "@/types";

export interface RevenuDraft {
  membreId: string;
  label: string;
  montant: number;
  type: RevenuType;
}

export interface StepRevenusProps {
  revenus: RevenuDraft[];
  membreOptions: { id: string; label: string }[];
  onChange: (index: number, patch: Partial<RevenuDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const types: { value: RevenuType; label: string }[] = [
  { value: "SALAIRE", label: "Salaire" },
  { value: "LOCATIF", label: "Locatif" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "AUTRE", label: "Autre" },
];

export function StepRevenus({ revenus, membreOptions, onChange, onAdd, onRemove, onBack, onNext }: StepRevenusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus</CardTitle>
        <CardDescription>Saisissez les revenus récurrents par membre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {revenus.map((r, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-3">
              <Label>Membre</Label>
              <Select value={r.membreId} onChange={(e) => onChange(i, { membreId: e.target.value })} className="mt-1">
                {membreOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Libellé</Label>
              <Input className="mt-1" value={r.label} onChange={(e) => onChange(i, { label: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Montant (€)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={r.montant}
                onChange={(e) => onChange(i, { montant: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-3">
              <Label>Type</Label>
              <Select value={r.type} onChange={(e) => onChange(i, { type: e.target.value as RevenuType })} className="mt-1">
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-1">
              <Button type="button" variant="outline" size="sm" className="mt-6 w-full" onClick={() => onRemove(i)}>
                ×
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={onAdd}>
          Ajouter un revenu
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="button" onClick={onNext}>
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
