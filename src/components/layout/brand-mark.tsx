import { cn } from "@/lib/utils";

/** The indigo "V" tile used as the app brand mark on the dark rail. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-rail-active font-display text-base font-bold text-rail-active-foreground",
        className,
      )}
    >
      V
    </span>
  );
}
