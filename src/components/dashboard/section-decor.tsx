import { type ReactNode } from "react";

import type { SectionPattern } from "@/features/design/types";
import { cn } from "@/lib/utils";

/**
 * Wraps a dashboard section with the selected theme-tinted motif (chosen in
 * Design → Layout) that sits ABOVE the wrapper's own background but BEHIND the
 * content:
 *  - "glance": a soft accent glow only (no pattern).
 *  - "dots": a dot field fading in toward the bottom-right.
 *  - "hexagons": a honeycomb outline emerging from the bottom-right.
 *  - "squares": a line grid fading in toward the bottom-right.
 * The motif layer is at z-0 (NOT a negative z, which would hide it behind the
 * wrapper's bg); content rides above via `relative z-10`. Theme-reactive,
 * decorative (aria-hidden), motion-safe.
 */
export function SectionDecor({
  kind,
  className,
  children,
}: {
  kind: SectionPattern;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <Decor kind={kind} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

const MASK = "radial-gradient(125% 125% at 100% 100%, black 0%, transparent 62%)";

function Decor({ kind }: { kind: SectionPattern }) {
  // A soft accent glow shared by all variants (anchored bottom-right).
  const glow = (
    <span
      aria-hidden
      className="pointer-events-none absolute -right-12 -bottom-16 z-0 size-64 rounded-full opacity-25 blur-2xl"
      style={{ backgroundColor: "rgb(var(--accent))" }}
    />
  );

  if (kind === "glance") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {glow}
        <span
          className="absolute right-24 -bottom-8 size-36 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: "rgb(var(--tertiary-accent))" }}
        />
      </div>
    );
  }

  if (kind === "hexagons") {
    return (
      <>
        {glow}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 size-full text-accent opacity-25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        >
          <defs>
            <pattern id="dash-hex" width="48" height="42" patternUnits="userSpaceOnUse">
              <polygon points="24,2 45,14 45,38 24,50 3,38 3,14" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dash-hex)" />
        </svg>
      </>
    );
  }

  if (kind === "squares") {
    return (
      <>
        {glow}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 size-full text-accent opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        >
          <defs>
            <pattern id="dash-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dash-grid)" />
        </svg>
      </>
    );
  }

  // dots
  return (
    <>
      {glow}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 size-full text-accent opacity-70"
        style={{ WebkitMaskImage: MASK, maskImage: MASK }}
      >
        <defs>
          <pattern id="dash-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-dots)" />
      </svg>
    </>
  );
}
