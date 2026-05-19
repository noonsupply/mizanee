"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MembreForm, type MembreFormValues } from "@/components/membres/MembreForm";
import { useMembres } from "@/hooks/useMembres";
import { formatEur } from "@/lib/calculs";
export default function MembreDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { membresUI: membres, isLoading } = useMembres();
  const membre = useMemo(() => membres.find((m) => m.id === id), [membres, id]);

  const [values, setValues] = useState<MembreFormValues | null>(null);

  const effective = membre
    ? values ?? {
        prenom: membre.prenom,
        couleur: membre.couleur,
        emoji: membre.emoji ?? "",
      }
    : null;

  if (isLoading) {
    return <p className="text-sm text-slate-500">Chargement…</p>;
  }

  if (!membre || !effective) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Membre introuvable.</p>
        <Link
          href="/membres"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/membres" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Membres
      </Link>
      <MembreForm
        title={`Profil — ${membre.prenom}`}
        values={effective}
        onChange={(patch) => setValues((v) => ({ ...(v ?? effective), ...patch }))}
        onSubmit={() => undefined}
        submitLabel="Enregistrer (démo)"
      />
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Aperçu</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Revenus actifs : {formatEur(membre.revenus.filter((r) => r.actif).reduce((s, r) => s + r.montant, 0))}</li>
          <li>Charges perso : {formatEur(membre.charges.filter((c) => c.actif).reduce((s, c) => s + c.montant, 0))}</li>
          <li>Reste à vivre (est.) : {formatEur(membre.resteAVivre)}</li>
        </ul>
      </div>
    </div>
  );
}
