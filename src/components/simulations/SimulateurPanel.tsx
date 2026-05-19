"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Scenario, ScenarioModification } from "@/types";
import { personnes } from "@/data/foyer";
import { totalEpargneMensuelle, formatEur } from "@/lib/calculs";
import type { ProjetEpargne } from "@/data/foyer";

export interface SimulateurPanelProps {
  projets: ProjetEpargne[];
  onSaveScenario?: (label: string, scenario: Scenario) => void;
}

export function SimulateurPanel({ projets, onSaveScenario }: SimulateurPanelProps) {
  const [membreId, setMembreId] = useState<string>(personnes[0]?.id ?? "");
  const [type, setType] = useState<ScenarioModification["type"]>("SALAIRE");
  const [valeur, setValeur] = useState(0);
  const [label, setLabel] = useState("Mon scénario");

  const baseEpargne = useMemo(() => totalEpargneMensuelle(projets), [projets]);
  const delta = type === "CHARGE_SUPPRIMEE" ? valeur : type === "SALAIRE" ? valeur * 0.15 : -Math.abs(valeur);
  const simule = Math.max(0, baseEpargne - delta);

  const scenario: Scenario = useMemo(
    () => ({
      label,
      modifications: [
        {
          membreId,
          type,
          valeur,
          debut: new Date(),
          fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      ],
    }),
    [label, membreId, type, valeur],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulateur « et si… »</CardTitle>
        <CardDescription>
          Ajustez un levier pour estimer l&apos;effet sur l&apos;épargne mensuelle totale (approximation locale).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Membre</Label>
            <Select value={membreId} onChange={(e) => setMembreId(e.target.value)}>
              {personnes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as ScenarioModification["type"])}>
              <option value="SALAIRE">Variation salaire</option>
              <option value="CHARGE_NOUVELLE">Nouvelle charge</option>
              <option value="CHARGE_SUPPRIMEE">Charge supprimée</option>
              <option value="CONGE">Congé / baisse revenus</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Montant (€ / mois)</Label>
            <Input type="number" value={valeur} onChange={(e) => setValeur(Number(e.target.value))} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nom du scénario</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-800">Épargne mensuelle cible (indicatif)</p>
          <p className="mt-2 text-slate-600">
            Actuel: <span className="font-bold text-slate-900">{formatEur(baseEpargne)}</span>
          </p>
          <p className="text-slate-600">
            Simulé: <span className="font-bold text-indigo-700">{formatEur(simule)}</span>
          </p>
        </div>

        {onSaveScenario && (
          <Button type="button" onClick={() => onSaveScenario(label, scenario)} disabled={!label.trim()}>
            Sauvegarder le scénario
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
