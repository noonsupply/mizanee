import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-[var(--mz-radius-md)] border-[0.5px] border-[#D3D8D5] bg-white px-3 py-2 text-sm text-[var(--mz-ink)] placeholder:text-[var(--mz-ink-muted)] focus-visible:outline-none focus-visible:border-[var(--mz-green)] focus-visible:ring-[3px] focus-visible:ring-[rgba(15,110,86,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
