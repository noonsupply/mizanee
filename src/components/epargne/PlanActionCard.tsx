"use client";

import { useMemo } from "react";
import { CalendarDays, Clock, Flame } from "lucide-react";
import { formatEur } from "@/lib/calculs";
import type { ProjetAlloue, UrgenceProjet } from "@/types/projets";
import styles from "./PlanActionCard.module.css";

export interface PlanActionCardProps {
  projetsAlloues: ProjetAlloue[];
}

function formatDateCible(dateYm: string): string {
  const [y, mo] = dateYm.split("-").map(Number);
  if (!y || !mo) return dateYm;
  const s = new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return s;
}

function badgeClass(u: UrgenceProjet): string {
  if (u === "urgent") return styles.badgeUrgent;
  if (u === "serre") return styles.badgeSerre;
  if (u === "ok") return styles.badgeOk;
  return styles.badgeLointain;
}

function badgeLabel(u: UrgenceProjet): string {
  if (u === "urgent") return "Urgent";
  if (u === "serre") return "Serré";
  if (u === "ok") return "OK";
  return "Lointain";
}

function UrgenceIcon({ urgence }: { urgence: UrgenceProjet }) {
  if (urgence === "urgent") return <Flame className="h-3 w-3" aria-hidden />;
  if (urgence === "serre") return <Clock className="h-3 w-3" aria-hidden />;
  if (urgence === "ok") return <CalendarDays className="h-3 w-3" aria-hidden />;
  return null;
}

function messagePour(p: ProjetAlloue): string {
  if (p.statutAllocation === "finance") {
    return "Financé — rien à faire ce mois";
  }
  if (p.statutAllocation === "partiel") {
    return `Épargner ${formatEur(p.epargneMensuelleRequise)}/mois pour combler le manque avant ${formatDateCible(p.date)}`;
  }
  return `Épargner ${formatEur(p.epargneMensuelleRequise)}/mois minimum sur ${p.moisRestants} mois`;
}

export function PlanActionCard({ projetsAlloues }: PlanActionCardProps) {
  const ordre = useMemo(
    () =>
      [...projetsAlloues].sort((a, b) => {
        if (a.moisRestants !== b.moisRestants) return a.moisRestants - b.moisRestants;
        return a.priorite - b.priorite;
      }),
    [projetsAlloues],
  );

  return (
    <section className={styles.card} aria-label="Plan d'action du mois">
      <p className={styles.title}>Que faire ce mois-ci ?</p>
      <p className={styles.subtitle}>Effort d&apos;épargne par projet pour rester dans les temps</p>

      <div className={styles.list}>
        {ordre.length === 0 ? (
          <p className={styles.empty}>Aucun projet pour le moment.</p>
        ) : (
          ordre.map((p) => (
            <div key={p.id} className={styles.line}>
              <span className={styles.dot} style={{ backgroundColor: p.color }} aria-hidden />
              <div className={styles.body}>
                <p className={styles.label}>{p.label}</p>
                <p className={styles.message}>{messagePour(p)}</p>
              </div>
              <span className={`${styles.badge} ${badgeClass(p.urgence)}`}>
                <UrgenceIcon urgence={p.urgence} />
                {badgeLabel(p.urgence)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
