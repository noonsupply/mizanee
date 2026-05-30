"use client";

import { useMemo } from "react";
import { iter24Mois } from "@/lib/calculs-projets";
import type { ProjetCalcule } from "@/types/projets";
import styles from "./ProjetTimeline.module.css";

function titreMoisCourt(cle: string): string {
  const [y, mo] = cle.split("-").map(Number);
  if (!y || !mo) return "";
  const d = new Date(y, mo - 1, 1);
  const s = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDateLabel(dateYm: string): string {
  const [y, mo] = dateYm.split("-").map(Number);
  if (!y || !mo) return dateYm;
  return new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export interface ProjetTimelineProps {
  projets: ProjetCalcule[];
  nbMois?: number;
}

export function ProjetTimeline({ projets, nbMois = 24 }: ProjetTimelineProps) {
  const mois = useMemo(() => iter24Mois(new Date()).slice(0, nbMois), [nbMois]);
  const actifs = useMemo(() => projets.filter((p) => p.statut === "en_cours"), [projets]);

  const headerTicks = useMemo(() => {
    return mois
      .map((m, i) => ({ ...m, i }))
      .filter((m) => m.i % 3 === 0)
      .map((m) => ({
        label: titreMoisCourt(m.cle),
        leftPct: nbMois <= 1 ? 0 : (m.i / (nbMois - 1)) * 100,
      }));
  }, [mois, nbMois]);

  return (
    <section className={styles.wrapper} aria-label="Timeline des projets">
      <h2 className={styles.title}>Horizon {nbMois} mois</h2>

      <div className={styles.timeline}>
        <div className={styles.monthHeaders} aria-hidden>
          {headerTicks.map((t) => (
            <span key={t.label} className={styles.monthTick} style={{ left: `${t.leftPct}%` }}>
              {t.label}
            </span>
          ))}
        </div>

        <div className={styles.track} aria-hidden />

        {actifs.length === 0 ? (
          <p className={styles.empty}>Aucun projet en cours.</p>
        ) : (
          actifs.map((p) => {
            const widthPct = Math.min(100, Math.max(0, (p.moisRestants / nbMois) * 100));
            const showDateInBar = widthPct > 25;

            return (
              <div key={p.id} className={styles.row}>
                <span className={styles.label} title={p.label}>
                  {p.label}
                </span>
                <div className={styles.barArea}>
                  {widthPct > 0 ? (
                    <div
                      className={styles.bar}
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: p.color,
                      }}
                      title={`${p.label} · ${p.date}`}
                    >
                      {showDateInBar ? formatDateLabel(p.date) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {actifs.length > 0 ? (
        <div className={styles.legend}>
          {actifs.map((p) => (
            <span key={p.id} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: p.color }} aria-hidden />
              {p.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
