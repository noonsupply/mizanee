"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, Flame, GripVertical, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMembres } from "@/hooks/useMembres";
import { formatEur } from "@/lib/calculs";
import {
  defaultProjetAjoutValues,
  projetAjoutSchemaAvecDateFuture,
  type ProjetAjoutValues,
} from "@/lib/validations-projets";
import type { Projet, ProjetAlloue, StatutAllocation, StatutProjet, UrgenceProjet } from "@/types/projets";
import styles from "./ProjetTable.module.css";

const COULEURS_DEFAUT = ["#7F77DD", "#1D9E75", "#D85A30", "#378ADD", "#D4537E", "#EF9F27", "#5DCAA5"] as const;

function nouvelIdProjet(): string {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  const perf = globalThis.performance;
  const n = typeof perf?.now === "function" ? perf.now() : 0;
  return `p-${Math.round(n)}`;
}

function couleurPourSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COULEURS_DEFAUT[h % COULEURS_DEFAUT.length] ?? "#7F77DD";
}

function stripCalcule(p: ProjetAlloue): Projet {
  return {
    id: p.id,
    label: p.label,
    montant: p.montant,
    date: p.date,
    priorite: p.priorite,
    color: p.color,
    statut: p.statut,
    membreId: p.membreId,
    montantDeja: p.montantDeja,
  };
}

const ALLOCATION_COLOR: Record<StatutAllocation, string> = {
  finance: "#1D9E75",
  partiel: "#EF9F27",
  non_finance: "#E24B4A",
};

function statutClass(s: StatutAllocation): string {
  if (s === "finance") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (s === "partiel") return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-rose-50 text-rose-800 border-rose-200";
}

function statutLabel(s: StatutAllocation): string {
  if (s === "finance") return "Financé";
  if (s === "partiel") return "Partiel";
  return "Non financé";
}

function urgenceClass(u: UrgenceProjet): string {
  if (u === "urgent") return "bg-rose-50 text-rose-800 border-rose-200";
  if (u === "serre") return "bg-amber-50 text-amber-900 border-amber-200";
  if (u === "ok") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function urgenceLabel(u: UrgenceProjet, moisRestants: number): string {
  const enX = `dans ${moisRestants} mois`;
  if (u === "urgent") return `Urgent — ${enX}`;
  if (u === "serre") return `Serré — ${enX}`;
  if (u === "ok") return `OK — ${enX}`;
  return "Lointain";
}

function UrgenceIcon({ urgence }: { urgence: UrgenceProjet }) {
  if (urgence === "urgent") return <Flame className="h-3 w-3" aria-hidden />;
  if (urgence === "serre") return <Clock className="h-3 w-3" aria-hidden />;
  if (urgence === "ok") return <CalendarDays className="h-3 w-3" aria-hidden />;
  return null;
}

interface SortableRowProps {
  projet: ProjetAlloue;
  membreLabel: string;
  onDateChange: (id: string, dateYm: string) => void;
  onRemoveRequest: (projet: ProjetAlloue) => void;
}

function SortableProjetRow({ projet, membreLabel, onDateChange, onRemoveRequest }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: projet.id,
  });
  const allocColor = ALLOCATION_COLOR[projet.statutAllocation];
  const dragStyle = { transform: CSS.Transform.toString(transform), transition };
  const draggingClass = isDragging ? styles.rowDragging : "";

  const gripBtn = (withRef: boolean) => (
    <button
      type="button"
      ref={withRef ? setActivatorNodeRef : undefined}
      className={styles.dragHandle}
      aria-label="Réordonner"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div ref={setNodeRef} style={dragStyle}>
      <div className={`${styles.row} ${draggingClass}`}>
        {gripBtn(true)}
        <div className={styles.projetNom}>
          <div className={styles.projetTitle}>
            <span className={styles.dot} style={{ backgroundColor: projet.color }} aria-hidden />
            <span className={styles.labelBold}>{projet.label}</span>
          </div>
          <p className={styles.sousLabel}>
            {formatEur(projet.montant)} · P{projet.priorite}
            {membreLabel ? ` · ${membreLabel}` : ""}
          </p>
        </div>
        <input
          type="month"
          className={styles.dateInput}
          value={projet.date}
          onChange={(e) => onDateChange(projet.id, e.target.value)}
          aria-label={`Date cible pour ${projet.label}`}
        />
        <span className={`${styles.badge} ${urgenceClass(projet.urgence)}`}>
          <UrgenceIcon urgence={projet.urgence} />
          {urgenceLabel(projet.urgence, projet.moisRestants)}
        </span>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, projet.progressionReelle)}%`, backgroundColor: allocColor }}
            />
          </div>
          <p className={styles.progressText}>
            {formatEur(projet.montantAlloue)} alloués / {formatEur(projet.montant)}
          </p>
        </div>
        <span className={`${styles.badge} ${statutClass(projet.statutAllocation)}`}>
          {statutLabel(projet.statutAllocation)}
        </span>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onRemoveRequest(projet)}
          aria-label={`Supprimer ${projet.label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className={`${styles.card} ${isDragging ? styles.cardDragging : ""}`}>
        <div className={styles.cardTop}>
          {gripBtn(false)}
          <span className={styles.dot} style={{ backgroundColor: projet.color }} aria-hidden />
          <span className={`${styles.labelBold} flex-1`}>{projet.label}</span>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onRemoveRequest(projet)}
            aria-label={`Supprimer ${projet.label}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className={styles.cardMeta}>
          {formatEur(projet.montant)} · P{projet.priorite}
          {membreLabel ? ` · ${membreLabel}` : ""}
        </p>
        <div className={styles.cardRow2}>
          <span>
            <label htmlFor={`date-m-${projet.id}`}>Date:</label>
            <input
              id={`date-m-${projet.id}`}
              type="month"
              className={styles.dateInput}
              value={projet.date}
              onChange={(e) => onDateChange(projet.id, e.target.value)}
            />
          </span>
        </div>
        <div className={styles.cardProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, projet.progressionReelle)}%`, backgroundColor: allocColor }}
            />
          </div>
          <p className={styles.progressText}>
            {formatEur(projet.montantAlloue)} / {formatEur(projet.montant)}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface ProjetTableProps {
  projets: ProjetAlloue[];
  onDateChange: (id: string, dateYm: string) => void;
  onRemove: (id: string) => void;
  onReorder: (projets: Projet[]) => void;
  onAdd: (projet: Projet) => void | Promise<unknown>;
  isLoading?: boolean;
}

export function ProjetTable({
  projets,
  onDateChange,
  onRemove,
  onReorder,
  onAdd,
  isLoading = false,
}: ProjetTableProps) {
  const { membres } = useMembres();
  const [deleteTarget, setDeleteTarget] = useState<ProjetAlloue | null>(null);

  const membreParId = useMemo(() => {
    const m = new Map<string, string>();
    for (const mb of membres) {
      if (mb.actif) m.set(mb.id, mb.prenom);
    }
    return m;
  }, [membres]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tri = useMemo(
    () => [...projets].sort((a, b) => a.priorite - b.priorite || a.date.localeCompare(b.date)),
    [projets],
  );

  const defaultPriorite = useMemo(() => {
    if (tri.length === 0) return 1;
    return Math.min(10, Math.max(...tri.map((p) => p.priorite)) + 1);
  }, [tri]);

  const form = useForm<ProjetAjoutValues>({
    resolver: zodResolver(projetAjoutSchemaAvecDateFuture),
    defaultValues: { ...defaultProjetAjoutValues(), priorite: defaultPriorite },
  });

  const { register, handleSubmit, reset, formState } = form;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = tri.findIndex((p) => p.id === active.id);
      const newIndex = tri.findIndex((p) => p.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const moved = arrayMove(tri, oldIndex, newIndex);
      const reindexed = moved.map((p, i) => ({ ...stripCalcule(p), priorite: i + 1 }));
      onReorder(reindexed);
    },
    [tri, onReorder],
  );

  const submitAdd = useCallback(
    async (data: ProjetAjoutValues) => {
      const label = data.label.trim();
      await onAdd({
        id: nouvelIdProjet(),
        label,
        montant: data.montant,
        date: data.date,
        priorite: data.priorite,
        color: couleurPourSeed(`${label}|${data.date}|${data.montant}`),
        statut: "en_cours" as StatutProjet,
        montantDeja: 0,
      });
      reset({ ...defaultProjetAjoutValues(), priorite: defaultPriorite });
      document.getElementById("pt-label")?.focus();
    },
    [defaultPriorite, onAdd, reset],
  );

  const onSubmitAdd = handleSubmit(submitAdd);

  const membreLabel = (p: ProjetAlloue) => (p.membreId ? (membreParId.get(p.membreId) ?? "") : "Commun");

  return (
    <section className={styles.wrapper} aria-label="Projets d'épargne">
      <div className={styles.headerRow}>
        <span aria-hidden />
        <span>Projet</span>
        <span>Échéance</span>
        <span>Urgence</span>
        <span>Progression réelle</span>
        <span>Statut</span>
        <span aria-hidden />
      </div>

      <div className={styles.list}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tri.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {tri.map((p) => (
                <SortableProjetRow
                  key={p.id}
                  projet={p}
                  membreLabel={membreLabel(p)}
                  onDateChange={onDateChange}
                  onRemoveRequest={setDeleteTarget}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
        {!isLoading && tri.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Aucun projet. Ajoutez-en un ci-dessous.</p>
        ) : null}
      </div>

      <form className={styles.form} onSubmit={(e) => void onSubmitAdd(e)}>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="pt-label">
            Nom du projet
          </label>
          <input
            id="pt-label"
            className={styles.formInput}
            placeholder="Nouveau projet"
            {...register("label")}
          />
          {formState.errors.label ? <p className={styles.formError}>{formState.errors.label.message}</p> : null}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="pt-montant">
            Montant €
          </label>
          <input id="pt-montant" type="number" min={1} step={1} className={styles.formInput} {...register("montant")} />
          {formState.errors.montant ? <p className={styles.formError}>{formState.errors.montant.message}</p> : null}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="pt-date">
            Date cible
          </label>
          <input id="pt-date" type="month" className={styles.formInput} {...register("date")} />
          {formState.errors.date ? <p className={styles.formError}>{formState.errors.date.message}</p> : null}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel} htmlFor="pt-prio">
            Priorité
          </label>
          <select id="pt-prio" className={styles.formInput} {...register("priorite", { valueAsNumber: true })}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                P{n}
              </option>
            ))}
          </select>
        </div>
        <div className={`${styles.formField} ${styles.formSubmit}`}>
          <button type="submit" className={styles.addBtn} disabled={formState.isSubmitting}>
            Ajouter
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le projet"
        description={deleteTarget ? `Supprimer ${deleteTarget.label} ?` : ""}
        confirmLabel="Supprimer"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onRemove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </section>
  );
}
