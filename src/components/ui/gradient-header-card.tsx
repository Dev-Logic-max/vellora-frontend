import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Pattern = "dots" | "hexagons" | "grid" | "none";

/**
 * A premium hero header for settings pages: a theme-tinted gradient wash with a
 * subtle background motif (dots / hexagons / grid), a heading + explanatory copy,
 * and an optional leading icon. Intentionally has NO action buttons — actions
 * live in the page's bottom action bar.
 */
export function GradientHeaderCard({
  title,
  description,
  icon,
  pattern = "dots",
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  pattern?: Pattern;
  /** Optional extra content under the description (e.g. quick guide chips). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-accent/20 p-6 sm:p-7",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(var(--accent) / 0.16), rgb(var(--tertiary-accent) / 0.10) 55%, rgb(var(--secondary-accent) / 0.12))",
      }}
    >
      <PatternBg pattern={pattern} />
      <div className="relative z-10 flex items-start gap-4">
        {icon ? (
          <span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-surface/70 text-accent-strong shadow-sm backdrop-blur-sm sm:inline-flex">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="max-w-2xl text-sm text-foreground-2">{description}</p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Low-opacity decorative motif behind the header content. */
function PatternBg({ pattern }: { pattern: Pattern }) {
  if (pattern === "none") return null;
  if (pattern === "hexagons") {
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-10 size-64 text-accent opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const x = 40 + c * 54 + (r % 2) * 27;
            const y = 40 + r * 46;
            return (
              <polygon
                key={`${r}-${c}`}
                points={`${x},${y - 22} ${x + 19},${y - 11} ${x + 19},${y + 11} ${x},${y + 22} ${x - 19},${y + 11} ${x - 19},${y - 11}`}
              />
            );
          }),
        )}
      </svg>
    );
  }
  if (pattern === "grid") {
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full text-accent opacity-[0.06]"
        fill="none"
        stroke="currentColor"
      >
        <defs>
          <pattern id="ghc-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ghc-grid)" />
      </svg>
    );
  }
  // dots — fade in from top-left to bottom-right via a radial mask.
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full text-accent opacity-30"
      style={{
        WebkitMaskImage:
          "radial-gradient(120% 120% at 100% 100%, black 10%, transparent 70%)",
        maskImage: "radial-gradient(120% 120% at 100% 100%, black 10%, transparent 70%)",
      }}
    >
      <defs>
        <pattern id="ghc-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ghc-dots)" />
    </svg>
  );
}
