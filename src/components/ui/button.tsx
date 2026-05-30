import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-(--mz-green) text-white hover:bg-(--mz-green-deep) shadow-sm active:scale-[0.98]",
  secondary:
    "bg-(--mz-green-bg) text-(--mz-green-deep) border-[0.5px] border-(--mz-green-border) hover:bg-(--mz-green-border)",
  outline: "border border-slate-300 bg-white hover:bg-(--mz-surface) text-(--mz-ink-soft)",
  ghost: "border-[0.5px] border-[#D3D1C7] text-(--mz-ink-soft) hover:bg-(--mz-surface)",
  destructive: "bg-[#FCEBEB] text-[#791F1F] border-[0.5px] border-[#F09595] hover:bg-[#F9DADA]",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-6 text-base rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-[background,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--mz-green) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
