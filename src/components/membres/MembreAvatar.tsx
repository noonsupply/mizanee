import { cn } from "@/components/ui/utils";

export interface MembreAvatarProps {
  prenom: string;
  couleur: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
};

export function MembreAvatar({ prenom, couleur, emoji, size = "md", className }: MembreAvatarProps) {
  const initial = prenom.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-inner ring-2 ring-white",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: couleur }}
      title={prenom}
    >
      {emoji?.trim() ? <span className="leading-none">{emoji}</span> : initial}
    </div>
  );
}
