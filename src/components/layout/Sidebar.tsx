"use client";

import Image from "next/image";
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
    <aside className="hidden w-56 shrink-0 flex-col bg-(--mz-ink) md:flex">
      <div className="px-5 py-6">
        <Link href="/dashboard" className="inline-flex items-center">
          <Image
            src="/logo/mizanee-white.svg"
            alt="Mizanee"
            width={120}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-(--mz-radius-md) px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-(--mz-green) text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white/90",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
