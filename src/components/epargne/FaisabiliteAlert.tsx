import { AlerteCard } from "@/components/dashboard/AlerteCard";

export interface FaisabiliteAlertProps {
  message: string;
  suggestion?: string;
  variant?: "warning" | "danger";
  className?: string;
}

export function FaisabiliteAlert({ message, suggestion, variant = "danger", className }: FaisabiliteAlertProps) {
  return (
    <AlerteCard title={message} variant={variant === "danger" ? "danger" : "warning"} className={className}>
      {suggestion && <p>{suggestion}</p>}
    </AlerteCard>
  );
}
