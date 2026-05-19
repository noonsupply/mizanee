"use client";

import { Pencil, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatEur } from "@/lib/calculs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MembreAvatar } from "@/components/membres/MembreAvatar";
import type { MembreUI } from "@/types";

export interface MembreCardProps {
  membre: MembreUI;
  isMutating?: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function MembreCard({
  membre,
  isMutating = false,
  onEdit,
  onDeactivate,
  onDelete,
}: MembreCardProps) {
  const revenuTotal = membre.revenus.filter((r) => r.actif).reduce((s, r) => s + r.montant, 0);
  const chargeTotal = membre.charges.filter((c) => c.actif).reduce((s, c) => s + c.montant, 0);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <MembreAvatar prenom={membre.prenom} couleur={membre.couleur} emoji={membre.emoji} size="lg" />
        <div className="min-w-0 flex-1">
          <MembreTitleRow membre={membre} />
          <p className="text-sm text-slate-500">Prorata charges communes : {membre.prorata}%</p>
        </div>
        <MembreActionsBlock
          membreId={membre.id}
          actif={membre.actif}
          isMutating={isMutating}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
        />
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-slate-100 bg-slate-50/50 pt-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Revenus</p>
          <p className="text-lg font-bold text-emerald-700">{formatEur(revenuTotal)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Charges perso</p>
          <p className="text-lg font-bold text-rose-700">{formatEur(chargeTotal)}</p>
        </div>
        <ResteBlock reste={membre.resteAVivre} />
      </CardContent>
    </Card>
  );
}

function MembreTitleRow({ membre }: { membre: MembreUI }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="truncate text-lg font-semibold text-slate-900">{membre.prenom}</h3>
      {membre.actif === false && <Badge variant="secondary">Inactif</Badge>}
    </div>
  );
}

function MembreActionsBlock({
  membreId,
  actif,
  isMutating,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  membreId: string;
  actif?: boolean;
  isMutating: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
      <Link
        href={`/membres/${membreId}`}
        className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
      >
        Profil
      </Link>
      <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={isMutating} aria-label="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      {actif !== false && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDeactivate}
          disabled={isMutating}
          aria-label="Désactiver"
        >
          <Power className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDelete}
        disabled={isMutating}
        className="text-rose-600 hover:bg-rose-50"
        aria-label="Supprimer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function ResteBlock({ reste }: { reste: number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">Reste à vivre (est.)</p>
      <p className={`text-lg font-bold ${reste >= 0 ? "text-indigo-700" : "text-rose-700"}`}>{formatEur(reste)}</p>
    </div>
  );
}
