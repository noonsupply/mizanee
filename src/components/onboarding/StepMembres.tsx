"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MembreAvatar } from "@/components/membres/MembreAvatar";

export interface MembreDraft {
  prenom: string;
  couleur: string;
  emoji: string;
}

export interface StepMembresProps {
  membres: MembreDraft[];
  onChange: (index: number, patch: Partial<MembreDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepMembres({ membres, onChange, onAdd, onRemove, onBack, onNext }: StepMembresProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres du foyer</CardTitle>
        <CardDescription>Ajoutez chaque personne avec un prénom, une couleur et un emoji.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {membres.map((m, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-end">
              <MembreAvatar prenom={m.prenom || "?"} couleur={m.couleur} emoji={m.emoji} size="md" />
              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor={`prenom-${i}`}>Prénom</Label>
                  <Input
                    id={`prenom-${i}`}
                    value={m.prenom}
                    onChange={(e) => onChange(i, { prenom: e.target.value })}
                    placeholder="Alex"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`couleur-${i}`}>Couleur</Label>
                  <Input
                    id={`couleur-${i}`}
                    type="color"
                    className="h-10 w-full cursor-pointer p-1"
                    value={m.couleur}
                    onChange={(e) => onChange(i, { couleur: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`emoji-${i}`}>Emoji</Label>
                  <Input
                    id={`emoji-${i}`}
                    value={m.emoji}
                    onChange={(e) => onChange(i, { emoji: e.target.value })}
                    placeholder="🙂"
                    maxLength={4}
                  />
                </div>
              </div>
              {membres.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => onRemove(i)}>
                  Retirer
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={onAdd}>
          Ajouter un membre
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="button" onClick={onNext} disabled={membres.some((m) => !m.prenom.trim())}>
            Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
