"use client";

import { AlertTriangle } from "lucide-react";

export interface AlerteBannerProps {
  alerte?: { message: string; excedent: number };
}

export function AlerteBanner({ alerte }: AlerteBannerProps) {
  if (!alerte) return null;
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <p className="text-sm leading-relaxed">{alerte.message}</p>
    </div>
  );
}
