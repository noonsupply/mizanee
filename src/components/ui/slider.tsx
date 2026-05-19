"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(({ className, label, id, ...props }, ref) => {
  const inputId = id ?? label?.replace(/\s/g, "-").toLowerCase();
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
        {...props}
      />
    </div>
  );
});
Slider.displayName = "Slider";
