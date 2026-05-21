"use client";

import type { MembreRevenu } from "@/data/membres";
import { RevenuForm } from "@/components/revenus/revenu-form";
import type { Revenu } from "@/types/revenus";
import styles from "./RevenuList.module.css";

export interface RevenuFormEditProps {
  revenu: Revenu;
  membres: MembreRevenu[];
  isSubmitting?: boolean;
  onSave: (revenu: Revenu) => Promise<void>;
  onCancel: () => void;
}

export function RevenuFormEdit({ revenu, membres, isSubmitting, onSave, onCancel }: RevenuFormEditProps) {
  return (
    <div className={styles.editPanel}>
      <RevenuForm
        membres={membres}
        editingRevenu={revenu}
        isSubmitting={isSubmitting}
        onAdd={(r) => void onSave({ ...r, id: revenu.id })}
        onCancelEdit={onCancel}
      />
    </div>
  );
}
