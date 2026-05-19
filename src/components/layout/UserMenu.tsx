"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = user?.name ?? user?.email?.split("@")[0] ?? "Compte";

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-white hover:bg-white/10"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="hidden max-w-[120px] truncate sm:inline">{label}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            href="/settings/profil"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            Profil
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
