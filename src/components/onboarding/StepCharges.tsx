"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ChargeCategorie, ChargeType } from "@/types";

export interface ChargeDraft {
  label: string;
  montant: number;
  categorie: ChargeCategorie;
  type: ChargeType;
  membreId?: string;
}

export interface StepChargesProps {
  charges: ChargeDraft[];
  membreOptions: { id: string; label: string }[];
  onChange: (index: number, patch: Partial<ChargeDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const categories: ChargeCategorie[] = [
  "LOGEMENT",
  "ALIMENTATION",
  "TRANSPORT",
  "EDUCATION",
  "LOISIRS",
  "SANTE",
  "ABONNEMENTS",
  "AUTRE",
];

export function StepCharges({ charges, membreOptions, onChange, onAdd, onRemove, onBack, onNext }: StepChargesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Charges</CardTitle>
        <CardDescription>Ajoutez les charges communes puis les charges personnelles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {charges.map((c, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-3">
              <Label>Libellé</Label>
              <Input className="mt-1" value={c.label} onChange={(e) => onChange(i, { label: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Montant</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={c.montant}
                onChange={(e) => onChange(i, { montant: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Catégorie</Label>
              <Select
                className="mt-1"
                value={c.categorie}
                onChange={(e) => onChange(i, { categorie: e.target.value as ChargeCategorie })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Type</Label>
              <Select
                className="mt-1"
                value={c.type}
                onChange={(e) => onChange(i, { type: e.target.value as ChargeType, membreId: undefined })}
              >
                <option value="COMMUNE">Commune</option>
                <option value="PERSONNELLE">Personnelle</option>
              </Select>
            </div>
            {c.type === "PERSONNELLE" && (
              <div className="sm:col-span-2">
                <Label>Membre</Label>
                <Select
                  className="mt-1"
                  value={c.membreId ?? membreOptions[0]?.id}
                  onChange={(e) => onChange(i, { membreId: e.target.value })}
                >
                  {membreOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="sm:col-span-1">
              <Button type="button" variant="outline" size="sm" className="mt-6 w-full" onClick={() => onRemove(i)}>
                ×
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={onAdd}>
          Ajouter une charge
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
