import { cn } from "@/components/ui/utils";

export interface StepIndicatorProps {
  current: number;
  total?: number;
  labels?: string[];
}

export function StepIndicator({ current, total = 5, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
        <span>
          Étape {current} / {total}
        </span>
        {labels && labels[current - 1] && <span className="text-indigo-600">{labels[current - 1]}</span>}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div
              key={step}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                done && "bg-indigo-600",
                active && "bg-indigo-400",
                !done && !active && "bg-slate-200",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
