"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./month-picker.module.css";

export interface MonthPickerProps {
  /** Valeur au format `YYYY-MM` */
  value: string;
  onChange: (value: string) => void;
  /** Mois minimum sélectionnable, format `YYYY-MM` (les mois antérieurs sont désactivés) */
  minMois?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const MOIS_COURTS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString("fr-FR", { month: "short" }),
);

function parseYm(value: string): { year: number; month: number } | null {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  return { year: y, month: m - 1 };
}

function rang(year: number, month: number): number {
  return year * 12 + month;
}

function libelle(value: string): string {
  const p = parseYm(value);
  if (!p) return "Choisir…";
  return new Date(p.year, p.month, 1).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

const POPOVER_H = 300;

export function MonthPicker({
  value,
  onChange,
  minMois,
  ariaLabel,
  id,
  className,
  disabled = false,
}: MonthPickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const selected = useMemo(() => parseYm(value), [value]);
  const minRang = useMemo(() => {
    const p = minMois ? parseYm(minMois) : null;
    return p ? rang(p.year, p.month) : null;
  }, [minMois]);

  const [viewYear, setViewYear] = useState<number>(selected?.year ?? new Date().getFullYear());
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 240,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < POPOVER_H + 8 && rect.top > POPOVER_H;
    const top = openUp ? rect.top - POPOVER_H - 4 : rect.bottom + 4;
    let left = rect.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    setCoords({ top, left, width });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => reposition();
    const onResize = () => reposition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, reposition]);

  const toggle = () => {
    if (disabled) return;
    if (!open) setViewYear(selected?.year ?? new Date().getFullYear());
    setOpen((o) => !o);
  };

  const choisir = (monthIndex: number) => {
    onChange(`${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`${styles.trigger} ${className ?? ""}`}
        onClick={toggle}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span className={styles.triggerLabel}>{libelle(value)}</span>
      </button>

      {mounted && open
        ? createPortal(
            <div
              ref={popoverRef}
              className={styles.popover}
              role="dialog"
              style={{ top: coords.top, left: coords.left, width: coords.width }}
            >
              <div className={styles.header}>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => setViewYear((y) => y - 1)}
                  aria-label="Année précédente"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <span className={styles.year}>{viewYear}</span>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => setViewYear((y) => y + 1)}
                  aria-label="Année suivante"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className={styles.grid}>
                {MOIS_COURTS.map((m, i) => {
                  const estSelectionne = selected?.year === viewYear && selected?.month === i;
                  const desactive = minRang !== null && rang(viewYear, i) < minRang;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.cell} ${estSelectionne ? styles.cellActif : ""}`}
                      onClick={() => choisir(i)}
                      disabled={desactive}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
