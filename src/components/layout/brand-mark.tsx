import { cn } from "@/lib/utils";

/** The solid-accent "V" brand tile (white text on the theme accent). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground shadow-sm",
        className,
      )}
    >
      V
    </span>
  );
}
