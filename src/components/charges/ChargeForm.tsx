"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ChargeCategorie, ChargeType } from "@/types";

export interface ChargeFormValues {
  label: string;
  montant: number;
  categorie: ChargeCategorie;
  type: ChargeType;
  membreId?: string;
}

export interface ChargeFormProps {
  values: ChargeFormValues;
  onChange: (patch: Partial<ChargeFormValues>) => void;
  onSubmit: () => void;
  membreOptions?: { id: string; label: string }[];
  submitLabel?: string;
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

export function ChargeForm({
  values,
  onChange,
  onSubmit,
  membreOptions = [],
  submitLabel = "Ajouter la charge",
}: ChargeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle charge</CardTitle>
        <CardDescription>Commune ou personnelle, avec catégorie.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="charge-label">Libellé</Label>
          <Input id="charge-label" value={values.label} onChange={(e) => onChange({ label: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="charge-montant">Montant (€)</Label>
          <Input
            id="charge-montant"
            type="number"
            min={0}
            value={values.montant}
            onChange={(e) => onChange({ montant: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={values.categorie} onChange={(e) => onChange({ categorie: e.target.value as ChargeCategorie })}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={values.type}
            onChange={(e) => onChange({ type: e.target.value as ChargeType, membreId: undefined })}
          >
            <option value="COMMUNE">Commune</option>
            <option value="PERSONNELLE">Personnelle</option>
          </Select>
        </div>
        {values.type === "PERSONNELLE" && membreOptions.length > 0 && (
          <div className="space-y-2">
            <Label>Membre</Label>
            <Select
              value={values.membreId ?? membreOptions[0]?.id}
              onChange={(e) => onChange({ membreId: e.target.value })}
            >
              {membreOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="sm:col-span-2">
          <Button type="button" onClick={onSubmit} disabled={!values.label.trim()}>
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
