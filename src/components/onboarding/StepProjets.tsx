"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ProjetDraft {
  label: string;
  montant: number;
  dateCible: string;
}

export interface StepProjetsProps {
  projets: ProjetDraft[];
  onChange: (index: number, patch: Partial<ProjetDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onFinish: () => void;
  onSkip?: () => void;
}

export function StepProjets({ projets, onChange, onAdd, onRemove, onBack, onFinish, onSkip }: StepProjetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projets d&apos;épargne</CardTitle>
        <CardDescription>Définissez vos objectifs avec un montant et une date cible.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projets.map((p, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-slate-100 p-4 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-4">
              <Label>Libellé</Label>
              <Input className="mt-1" value={p.label} onChange={(e) => onChange(i, { label: e.target.value })} />
            </div>
            <div className="sm:col-span-3">
              <Label>Objectif (€)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={p.montant}
                onChange={(e) => onChange(i, { montant: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-3">
              <Label>Date cible</Label>
              <Input
                className="mt-1"
                type="month"
                value={p.dateCible.slice(0, 7)}
                onChange={(e) => onChange(i, { dateCible: `${e.target.value}-01` })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="button" variant="outline" size="sm" className="mt-6 w-full" onClick={() => onRemove(i)}>
                Retirer
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={onAdd}>
          Ajouter un projet
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="button" onClick={onFinish}>
            Terminer
          </Button>
          {onSkip && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              Compléter plus tard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
