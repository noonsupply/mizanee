import { type ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export type AlerteVariant = "warning" | "danger" | "info";

const styles: Record<AlerteVariant, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-slate-50 text-slate-800",
};

export interface AlerteCardProps {
  title: string;
  children?: ReactNode;
  variant?: AlerteVariant;
  className?: string;
}

export function AlerteCard({ title, children, variant = "info", className }: AlerteCardProps) {
  return (
    <div className={cn("rounded-xl border p-4 text-sm", styles[variant], className)}>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 opacity-90">{children}</div>}
    </div>
  );
}
