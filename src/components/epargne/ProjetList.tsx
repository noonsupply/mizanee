"use client";

import { useMemo } from "react";
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
import { ProjetCard } from "@/components/epargne/ProjetCard";
import { ProjetForm } from "@/components/epargne/ProjetForm";
import type { Projet, ProjetCalcule } from "@/types/projets";

function SortableItem({
  projet,
  onDateChange,
  onRemove,
  onPrioriteChange,
}: {
  projet: ProjetCalcule;
  onDateChange: (id: string, dateYm: string) => void;
  onRemove: (id: string) => void;
  onPrioriteChange: (id: string, priorite: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: projet.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <ProjetCard
        projet={projet}
        onDateChange={onDateChange}
        onRemove={onRemove}
        onPrioriteChange={onPrioriteChange}
        dragHandleRef={setActivatorNodeRef}
        dragAttributes={attributes}
        dragListeners={listeners as Record<string, (e: unknown) => void>}
      />
    </div>
  );
}

function stripCalcule(p: ProjetCalcule): Projet {
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

export interface ProjetListProps {
  projets: ProjetCalcule[];
  onReorder: (projets: Projet[]) => void;
  onDateChange: (id: string, dateYm: string) => void;
  onRemove: (id: string) => void;
  onPrioriteChange: (id: string, priorite: number) => void;
  onAdd: (projet: Projet) => void;
  isMutating?: boolean;
}

export function ProjetList({
  projets,
  onReorder,
  onDateChange,
  onRemove,
  onPrioriteChange,
  onAdd,
  isMutating = false,
}: ProjetListProps) {
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tri.findIndex((p) => p.id === active.id);
    const newIndex = tri.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(tri, oldIndex, newIndex);
    const reindexed = moved.map((p, i) => ({ ...stripCalcule(p), priorite: i + 1 }));
    onReorder(reindexed);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Projets (priorité)</h2>
        <p className="text-xs text-slate-500">Glissez l’icône pour réordonner — tout se recalcule en direct.</p>
      </div>
      <div className="max-h-[min(70vh,36rem)] space-y-3 overflow-y-auto p-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tri.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {tri.map((p) => (
              <SortableItem
                key={p.id}
                projet={p}
                onDateChange={onDateChange}
                onRemove={onRemove}
                onPrioriteChange={onPrioriteChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <ProjetForm defaultPriorite={defaultPriorite} onAdd={onAdd} />
    </div>
  );
}
