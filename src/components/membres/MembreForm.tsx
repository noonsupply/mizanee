"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MembreAvatar } from "@/components/membres/MembreAvatar";

export interface MembreFormValues {
  prenom: string;
  couleur: string;
  emoji: string;
}

export interface MembreFormProps {
  values: MembreFormValues;
  onChange: (patch: Partial<MembreFormValues>) => void;
  onSubmit: () => void;
  submitLabel?: string;
  title?: string;
}

export function MembreForm({
  values,
  onChange,
  onSubmit,
  submitLabel = "Enregistrer",
  title = "Membre",
}: MembreFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <MembreAvatar prenom={values.prenom || "?"} couleur={values.couleur} emoji={values.emoji} size="lg" />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Prénom, couleur et emoji de l&apos;avatar.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="membre-prenom">Prénom</Label>
            <Input id="membre-prenom" value={values.prenom} onChange={(e) => onChange({ prenom: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="membre-couleur">Couleur</Label>
            <Input
              id="membre-couleur"
              type="color"
              className="h-10 cursor-pointer p-1"
              value={values.couleur}
              onChange={(e) => onChange({ couleur: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="membre-emoji">Emoji</Label>
            <Input
              id="membre-emoji"
              value={values.emoji}
              onChange={(e) => onChange({ emoji: e.target.value })}
              maxLength={4}
            />
          </div>
        </div>
        <Button type="button" onClick={onSubmit} disabled={!values.prenom.trim()}>
          {submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
