"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface StepFoyerProps {
  nom: string;
  onNomChange: (value: string) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export function StepFoyer({ nom, onNomChange, onNext, onSkip }: StepFoyerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nom du foyer</CardTitle>
        <CardDescription>Comment souhaitez-vous appeler votre espace ? Ex. Famille Dupont, Chez nous 🏠</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foyer-nom">Nom</Label>
          <Input
            id="foyer-nom"
            value={nom}
            onChange={(e) => onNomChange(e.target.value)}
            placeholder="Mon foyer"
            autoComplete="organization"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onNext} disabled={!nom.trim()}>
            Continuer
          </Button>
          {onSkip && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              Plus tard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
