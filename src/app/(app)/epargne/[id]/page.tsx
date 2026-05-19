"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useFoyerStore } from "@/store/useFoyerStore";
import { epargneMensuelleProjet, moisRestants, formatEur } from "@/lib/calculs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjetDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const projets = useFoyerStore((s) => s.projets);
  const setProjets = useFoyerStore((s) => s.setProjets);
  const projet = useMemo(() => projets.find((p) => p.id === id), [projets, id]);

  if (!projet) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <p>Projet introuvable.</p>
        <Link href="/epargne" className="mt-4 inline-block text-indigo-600 hover:underline">
          Retour aux projets
        </Link>
      </div>
    );
  }

  const mensuelle = epargneMensuelleProjet(projet);
  const mois = moisRestants(projet.dateObjectif);

  return (
    <div className="space-y-6">
      <Link href="/epargne" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Épargne
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Détail projet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>
            Épargne mensuelle :{" "}
            <span className="font-semibold text-slate-900">{isFinite(mensuelle) ? formatEur(mensuelle) : "—"}</span>
          </p>
          <p className="mt-1">Mois restants : {mois}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Modifier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pe-date">Date cible (mois)</Label>
            <Input
              id="pe-date"
              className="mt-1 max-w-xs"
              type="month"
              value={projet.dateObjectif.slice(0, 7)}
              onChange={(e) => {
                const ym = e.target.value;
                if (!ym) return;
                const dateObjectif = `${ym}-01`;
                setProjets((list) => list.map((p) => (p.id === projet.id ? { ...p, dateObjectif } : p)));
              }}
            />
          </div>
          <div>
            <Label htmlFor="pe-deja">Déjà épargné (€)</Label>
            <Input
              id="pe-deja"
              className="mt-1 max-w-xs"
              type="number"
              min={0}
              step={1}
              value={projet.montantDeja}
              onChange={(e) => {
                const montantDeja = Math.max(0, Number(e.target.value) || 0);
                setProjets((list) => list.map((p) => (p.id === projet.id ? { ...p, montantDeja } : p)));
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
