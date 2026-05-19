"use client";

import { formatEur, totalChargesMensuelles, totalRevenus } from "@/lib/calculs";
import { UserMenu } from "@/components/layout/UserMenu";
import { NavMobile } from "@/components/layout/NavMobile";

export interface HeaderProps {
  foyerName?: string;
}

export function Header({ foyerName = "Foyer Finance" }: HeaderProps) {
  const revenus = totalRevenus();
  const charges = totalChargesMensuelles();
  const solde = revenus - charges;

  return (
    <header className="border-b border-slate-200 bg-slate-800 text-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <NavMobile />
          <div className="min-w-0 md:hidden">
            <h1 className="truncate text-base font-bold">{foyerName}</h1>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold tracking-tight">{foyerName}</h1>
            <p className="text-xs text-slate-400">Vue d&apos;ensemble</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden text-right text-sm sm:block">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Revenus</p>
            <p className="font-bold text-emerald-400">{formatEur(revenus)}</p>
          </div>
          <div className="hidden text-right text-sm sm:block">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Charges</p>
            <p className="font-bold text-rose-400">{formatEur(charges)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Solde</p>
            <p className={`font-bold ${solde >= 0 ? "text-indigo-300" : "text-rose-400"}`}>{formatEur(solde)}</p>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
