"use client";

import { useCallback } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({ delay = 200, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * Reads the LIVE accent off `.app-shell` (where `[data-accent]` sets the theme)
 * and paints the popup with real `rgb()` colors. The tooltip portals OUTSIDE
 * `.app-shell`, so Tailwind accent classes / a cached snapshot wouldn't follow
 * the selected theme. Done via a callback ref so it re-reads every time the
 * popup mounts (each open) → always matches the current theme, never stale.
 */
function paintAccent(el: HTMLElement | null) {
  if (!el) return;
  const shell = document.querySelector<HTMLElement>(".app-shell");
  const cs = getComputedStyle(shell ?? document.documentElement);
  const accent = cs.getPropertyValue("--accent").trim() || "79 70 229";
  const strong = cs.getPropertyValue("--accent-strong").trim() || "67 56 202";
  el.style.backgroundImage = `linear-gradient(135deg, rgb(${strong}), rgb(${accent}))`;
  el.style.color = "white";
  el.style.borderColor = `rgb(${accent} / 0.6)`;
  el.style.boxShadow = `0 6px 20px rgb(${accent} / 0.35)`;
}

function TooltipContent({
  className,
  side = "right",
  sideOffset = 8,
  children,
  ref,
  ...props
}: TooltipPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) {
  // Combine our paint ref with any forwarded ref.
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      paintAccent(node);
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="z-50">
        <TooltipPrimitive.Popup
          ref={setRef}
          data-slot="tooltip-content"
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
