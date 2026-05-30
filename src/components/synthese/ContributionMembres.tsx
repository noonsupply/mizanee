"use client";

import { formatEur } from "@/lib/calculs";
import type { SyntheseCommunLigne, SyntheseMembreLigne } from "@/types/synthese";
import { cn } from "@/components/ui/utils";

export interface ContributionMembresProps {
  membres: SyntheseMembreLigne[];
  commun: SyntheseCommunLigne;
  totalChargesCommunes: number;
}

function initiales(prenom: string): string {
  const parts = prenom.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return prenom.slice(0, 2).toUpperCase();
}

export function ContributionMembres({ membres, commun, totalChargesCommunes }: ContributionMembresProps) {
  const showCommun = commun.charges > 0 || commun.revenus > 0;

  return (
    <div className="mz-card p-5">
      <h2 className="text-sm font-semibold text-[var(--mz-ink)]">Contributions membres</h2>
      <p className="mt-0.5 text-xs text-[var(--mz-ink-muted)]">
        Charges communes totales :{" "}
        <span className="font-semibold text-[var(--mz-ink-soft)]">{formatEur(totalChargesCommunes)}</span>
      </p>

      {showCommun && (
        <div className="badge-warning mt-4 rounded-[var(--mz-radius-md)] px-3 py-3">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: commun.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-[var(--mz-ink)]">{commun.label}</span>
                {commun.revenus > 0 && (
                  <span className="text-sm text-[var(--mz-ink-muted)]">{formatEur(commun.revenus)} revenus</span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--mz-ink-muted)]">
                Charges communes : <span className="font-medium text-[var(--mz-ink-soft)]">{formatEur(commun.charges)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-5">
        {membres.map((m) => (
          <li key={m.id}>
            <MembreContributionRow membre={m} />
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {membres.map((m) => {
          const tendu = m.resteAVivreNet < 300;
          const critique = m.resteAVivreNet < 150;
          return (
            <div
              key={`rav-${m.id}`}
              className={cn(
                "rounded-[var(--mz-radius-md)] p-3",
                critique ? "badge-danger" : tendu ? "badge-warning" : "badge-success",
              )}
            >
              <p className="text-xs font-medium text-[var(--mz-ink-muted)]">Reste à vivre net · {m.prenom}</p>
              <p
                className={cn(
                  "mt-1 text-lg font-bold",
                  critique ? "text-[#791F1F]" : tendu ? "text-[#633806]" : "text-[var(--mz-green-deep)]",
                )}
                role="status"
                aria-label={`Reste à vivre net ${m.prenom} ${formatEur(m.resteAVivreNet)}`}
              >
                {formatEur(m.resteAVivreNet)}
              </p>
              <p className="mt-1 text-[11px] opacity-80">Après perso, commun (prorata) et épargne imputée</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MembreContributionRow({ membre: m }: { membre: SyntheseMembreLigne }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner"
        style={{ backgroundColor: m.color }}
        aria-hidden
      >
        {initiales(m.prenom)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-semibold text-[var(--mz-ink)]">{m.prenom}</span>
          <span className="text-sm text-[var(--mz-ink-muted)]">
            {formatEur(m.revenus)} · <span>{m.partFoyerPct}% du foyer</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--mz-ink-muted)]">
          Part charges communes : <span className="font-medium text-[var(--mz-ink-soft)]">{formatEur(m.chargesCommunes)}</span>
        </p>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[#E0E8E4]"
          role="progressbar"
          aria-valuenow={m.prorata}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Prorata salaires ${m.prenom}`}
        >
          <div className="h-full rounded-full transition-all" style={{ width: `${m.prorata}%`, backgroundColor: m.color }} />
        </div>
      </div>
    </div>
  );
}
