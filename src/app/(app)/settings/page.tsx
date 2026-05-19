"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFoyerStore } from "@/store/useFoyerStore";

export default function SettingsFoyerPage() {
  const nomFoyer = useFoyerStore((s) => s.nomFoyer);
  const setNomFoyer = useFoyerStore((s) => s.setNomFoyer);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Réglages foyer</h1>
        <p className="text-sm text-slate-500">Nom affiché dans l&apos;en-tête (démo locale).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Foyer</CardTitle>
          <CardDescription>Modifier le nom du foyer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom-foyer">Nom du foyer</Label>
            <Input id="nom-foyer" value={nomFoyer} onChange={(e) => setNomFoyer(e.target.value)} />
          </div>
          <Button type="button" onClick={() => undefined}>
            Enregistrer (démo)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
