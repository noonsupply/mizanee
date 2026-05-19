"use client";

import { personnes } from "@/data/foyer";
import {
  totalChargesCommunes,
  totalChargesP1,
  totalChargesP2,
  repartitionProrata,
  formatEur,
} from "@/lib/calculs";
import { useCharges } from "@/hooks/useCharges";
import { ChargesList } from "@/components/charges/ChargesList";
import { ChargesBarChart } from "@/components/charges/ChargesBarChart";
import { ChargeForm, type ChargeFormValues } from "@/components/charges/ChargeForm";
import { useState } from "react";

export default function ChargesView() {
  const { communes, personnelles } = useCharges();
  const communesTotal = totalChargesCommunes();
  const p1Total = totalChargesP1();
  const p2Total = totalChargesP2();
  const prorata = repartitionProrata();
  const p1 = personnes.find((p) => p.id === "P1")!;
  const p2 = personnes.find((p) => p.id === "P2")!;

  const [draft, setDraft] = useState<ChargeFormValues>({
    label: "",
    montant: 0,
    categorie: "AUTRE",
    type: "COMMUNE",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Détail des charges</h2>
        <p className="text-sm text-slate-500">Répartition mensuelle par catégorie</p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <h3 className="mb-3 text-sm font-semibold text-indigo-800">Répartition prorata salaires</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600">{p1.nom}</p>
            <p className="text-xl font-bold text-indigo-900">{formatEur(prorata.P1)}</p>
            <p className="mt-0.5 text-xs text-indigo-600">
              {Math.round((p1.revenu / (p1.revenu + p2.revenu)) * 100)}% du total communes
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600">{p2.nom}</p>
            <p className="text-xl font-bold text-indigo-900">{formatEur(prorata.P2)}</p>
            <p className="mt-0.5 text-xs text-indigo-600">
              {Math.round((p2.revenu / (p1.revenu + p2.revenu)) * 100)}% du total communes
            </p>
          </div>
        </div>
        <p className="mt-3 border-t border-indigo-200 pt-3 text-xs text-indigo-700">
          Total communes: <span className="font-bold">{formatEur(communesTotal)}</span>
        </p>
      </div>

      <ChargesBarChart
        title="Montants par bloc"
        labels={["Communes", p1.nom, p2.nom]}
        values={[communesTotal, p1Total, p2Total]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChargesList
          title="Charges communes"
          subtitle="Partagées au prorata"
          charges={communes}
          accent="slate"
          total={communesTotal}
        />
        <ChargesList
          title={p1.nom}
          subtitle="Charges personnelles"
          charges={personnelles.filter((c) => c.membreId === "P1")}
          accent="rose"
          total={p1Total}
          totalLabel="Moy. mensuelle"
        />
        <ChargesList
          title={p2.nom}
          subtitle="Charges personnelles"
          charges={personnelles.filter((c) => c.membreId === "P2")}
          accent="indigo"
          total={p2Total}
        />
      </div>

      <ChargeForm
        values={draft}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        membreOptions={personnes.map((p) => ({ id: p.id, label: p.nom }))}
        onSubmit={() => undefined}
        submitLabel="Enregistrer (démo)"
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Bilan charges</h3>
        <div className="space-y-2">
          {[
            { label: "Communes", value: communesTotal, color: "text-slate-700" },
            { label: `${p1.nom} perso`, value: p1Total, color: "text-rose-700" },
            { label: `${p2.nom} perso`, value: p2Total, color: "text-indigo-700" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between border-b border-slate-100 py-2">
              <span className={`text-sm ${row.color}`}>{row.label}</span>
              <span className={`text-sm font-semibold ${row.color}`}>{formatEur(row.value)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <span className="font-bold text-slate-900">Total mensuel</span>
            <span className="font-bold text-slate-900">{formatEur(communesTotal + p1Total + p2Total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
