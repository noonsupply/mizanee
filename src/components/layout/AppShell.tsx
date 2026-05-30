"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useFoyerStore } from "@/store/useFoyerStore";

export function AppShell({ children }: { children: ReactNode }) {
  const nomFoyer = useFoyerStore((s) => s.nomFoyer);

  return (
    <div className="flex min-h-screen bg-[var(--mz-surface)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-[var(--mz-surface)]">
        <Header foyerName={nomFoyer} />
        <main className="mx-auto w-full max-w-6xl flex-1 bg-[var(--mz-surface)] px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
