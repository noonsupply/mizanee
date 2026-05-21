"use client";

import type { MembreRevenu } from "@/data/membres";
import { ChargeFoyerForm } from "@/components/charges/charge-foyer-form";
import type { ChargeFoyer } from "@/types/charges";
import styles from "./ChargeList.module.css";

export interface ChargeFormEditProps {
  charge: ChargeFoyer;
  membres: MembreRevenu[];
  isSubmitting?: boolean;
  onSave: (charge: ChargeFoyer) => Promise<void>;
  onCancel: () => void;
}

export function ChargeFormEdit({ charge, membres, isSubmitting, onSave, onCancel }: ChargeFormEditProps) {
  return (
    <div className={styles.editPanel}>
      <ChargeFoyerForm
        membres={membres}
        editingCharge={charge}
        isSubmitting={isSubmitting}
        onAdd={(c) => void onSave({ ...c, id: charge.id })}
        onCancelEdit={onCancel}
      />
    </div>
  );
}
