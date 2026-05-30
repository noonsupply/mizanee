"use client";

import { useMemo } from "react";
import {
  debutAnneeCourante,
  formatDateLabelLong,
  formatMoisLabelLong,
  getAujourdhui,
  moisCourantYm,
} from "@/lib/date";

export function useDate() {
  return useMemo(() => {
    const aujourdhui = getAujourdhui();
    return {
      aujourdhui,
      moisCourant: moisCourantYm(aujourdhui),
      moisLabel: formatMoisLabelLong(aujourdhui),
      dateLabel: formatDateLabelLong(aujourdhui),
      anneeEnCours: aujourdhui.getFullYear(),
      debutAnneeCourante: debutAnneeCourante(aujourdhui),
    };
  }, []);
}
