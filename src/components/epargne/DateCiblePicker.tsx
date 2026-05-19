"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface DateCiblePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  id?: string;
  label?: string;
}

export function DateCiblePicker({ value, onChange, id = "date-cible", label = "Date cible" }: DateCiblePickerProps) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </Label>
      <Input
        id={id}
        type="month"
        value={value.slice(0, 7)}
        onChange={(e) => onChange(`${e.target.value}-01`)}
        className="text-sm"
      />
    </div>
  );
}
