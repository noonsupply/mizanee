"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

const links = [
  { href: "/dashboard", label: "Synthèse" },
  { href: "/revenus", label: "Revenus" },
  { href: "/charges", label: "Charges" },
  { href: "/epargne", label: "Épargne" },
  { href: "/projection", label: "Projection" },
  { href: "/simulations", label: "Simulations" },
  { href: "/membres", label: "Membres" },
  { href: "/settings", label: "Réglages" },
];

export function NavMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10"
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/40" aria-label="Fermer" onClick={() => setOpen(false)} />
          <nav className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col gap-1 border-r border-slate-200 bg-white p-4 pt-16 shadow-xl">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
