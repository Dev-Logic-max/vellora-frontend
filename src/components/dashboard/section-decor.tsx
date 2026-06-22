import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type DecorKind = "dots" | "hexagons" | "bubbles";

/**
 * Wraps a dashboard section with a theme-tinted background motif that sits ABOVE
 * the wrapper's own background but BEHIND the content:
 *  - "dots": a dot field that fades IN toward the bottom-right (directional).
 *  - "hexagons": a honeycomb outline emerging from the bottom-right.
 *  - "bubbles": two large soft accent bubbles anchored bottom-right.
 * The motif layer is at z-0 (NOT a negative z, which would hide it behind the
 * wrapper's background); content rides above via `relative z-10`. Theme-reactive
 * (live `--accent`/`--tertiary-accent`), decorative (aria-hidden), motion-safe.
 */
export function SectionDecor({
  kind,
  className,
  children,
}: {
  kind: DecorKind;
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

function Decor({ kind }: { kind: DecorKind }) {
  if (kind === "hexagons") {
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 size-full text-accent opacity-25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{
          WebkitMaskImage: "radial-gradient(120% 120% at 100% 100%, black 5%, transparent 70%)",
          maskImage: "radial-gradient(120% 120% at 100% 100%, black 5%, transparent 70%)",
        }}
      >
        <defs>
          <pattern id="dash-hex" width="48" height="42" patternUnits="userSpaceOnUse">
            <polygon points="24,2 45,14 45,38 24,50 3,38 3,14" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-hex)" />
      </svg>
    );
  }

  if (kind === "bubbles") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <span
          className="absolute -right-12 -bottom-16 size-64 rounded-full opacity-25 blur-2xl"
          style={{ backgroundColor: "rgb(var(--accent))" }}
        />
        <span
          className="absolute right-28 -bottom-8 size-36 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: "rgb(var(--tertiary-accent))" }}
        />
      </div>
    );
  }

  // dots — fade in toward the bottom-right (clearly visible there).
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 size-full text-accent opacity-70"
      style={{
        WebkitMaskImage: "radial-gradient(125% 125% at 100% 100%, black 0%, transparent 62%)",
        maskImage: "radial-gradient(125% 125% at 100% 100%, black 0%, transparent 62%)",
      }}
    >
      <defs>
        <pattern id="dash-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dash-dots)" />
    </svg>
  );
}
