"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import { LayoutDashboard, Wallet, PiggyBank, LineChart, FlaskConical, Users, Settings, Coins } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Synthèse", icon: LayoutDashboard },
  { href: "/revenus", label: "Revenus", icon: Coins },
  { href: "/charges", label: "Charges", icon: Wallet },
  { href: "/epargne", label: "Épargne", icon: PiggyBank },
  { href: "/projection", label: "Projection", icon: LineChart },
  { href: "/simulations", label: "Simulations", icon: FlaskConical },
  { href: "/membres", label: "Membres", icon: Users },
  { href: "/settings", label: "Réglages", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="px-4 py-5">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-slate-900">
          Foyer Finance
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">Budget du foyer</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
