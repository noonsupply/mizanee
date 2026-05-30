"use client";

import { useMemo } from "react";
import { formatEur } from "@/lib/calculs";
import { useRevenus } from "@/hooks/useRevenus";
import { useCharges } from "@/hooks/useCharges";
import { UserMenu } from "@/components/layout/UserMenu";
import { NavMobile } from "@/components/layout/NavMobile";

export interface HeaderProps {
  foyerName?: string;
}

export function Header({ foyerName = "Foyer Finance" }: HeaderProps) {
  const { revenus: revenusList, isLoading: loadingRevenus } = useRevenus();
  const { chargesFoyer, isLoading: loadingCharges } = useCharges();

  const totalRevenus = useMemo(
    () => revenusList.filter((r) => r.actif).reduce((s, r) => s + (r.montantMensuel ?? 0), 0),
    [revenusList],
  );

  const totalCharges = useMemo(
    () => chargesFoyer.filter((c) => c.actif).reduce((s, c) => s + (c.montantMensuel ?? 0), 0),
    [chargesFoyer],
  );

  const solde = totalRevenus - totalCharges;
  const isLoading = loadingRevenus || loadingCharges;

  return (
    <header className="bg-(--mz-ink) text-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <NavMobile />
          <div className="min-w-0 md:hidden">
            <h1 className="truncate text-base font-bold">{foyerName}</h1>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold tracking-tight">{foyerName}</h1>
            <p className="text-xs text-white/45">Vue d&apos;ensemble</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden text-right text-sm sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/45">Revenus</p>
            <p className="font-semibold text-(--mz-green-light)">{isLoading ? "—" : formatEur(totalRevenus)}</p>
          </div>
          <div className="hidden text-right text-sm sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/45">Charges</p>
            <p className="font-semibold text-[#F09595]">{isLoading ? "—" : formatEur(totalCharges)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-[10px] uppercase tracking-wider text-white/45">Solde</p>
            <p className={`font-semibold ${solde >= 0 ? "text-(--mz-green-light)" : "text-[#F09595]"}`}>
              {isLoading ? "—" : formatEur(solde)}
            </p>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
