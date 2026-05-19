"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useFoyerStore } from "@/store/useFoyerStore";

export function AppShell({ children }: { children: ReactNode }) {
  const nomFoyer = useFoyerStore((s) => s.nomFoyer);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header foyerName={nomFoyer} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
