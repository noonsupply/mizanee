import { type HTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-transparent bg-indigo-100 text-indigo-800",
  secondary: "border-transparent bg-slate-100 text-slate-800",
  outline: "border-slate-300 text-slate-700",
  destructive: "border-transparent bg-rose-100 text-rose-800",
  success: "border-transparent bg-emerald-100 text-emerald-800",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
