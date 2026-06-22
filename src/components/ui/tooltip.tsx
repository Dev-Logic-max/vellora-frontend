"use client";

import { useState, type CSSProperties } from "react";
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
 * The tooltip portals OUTSIDE `.app-shell`, so the live dashboard accent (set via
 * `.app-shell[data-accent]`) wouldn't reach it. We copy the resolved accent vars
 * onto the popup so the tooltip matches the SELECTED theme (not the default).
 */
function readAccentVars(): CSSProperties {
  if (typeof document === "undefined") return {};
  const shell = document.querySelector<HTMLElement>(".app-shell");
  if (!shell) return {};
  const cs = getComputedStyle(shell);
  const read = (name: string) => cs.getPropertyValue(name).trim();
  return {
    ["--accent" as string]: read("--accent"),
    ["--accent-strong" as string]: read("--accent-strong"),
    ["--accent-soft" as string]: read("--accent-soft"),
    ["--accent-foreground" as string]: read("--accent-foreground"),
  };
}

/** Copies the live `.app-shell` accent vars once (client-side) — no setState in
 * an effect (React-Compiler lint), read lazily in the state initializer. */
function useActiveAccentVars(): CSSProperties {
  const [vars] = useState<CSSProperties>(readAccentVars);
  return vars;
}

function TooltipContent({
  className,
  side = "right",
  sideOffset = 8,
  children,
  style,
  ...props
}: TooltipPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) {
  const accentVars = useActiveAccentVars();
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // Light, theme-tinted tooltip (accent-soft fill + accent text + accent
            // border) with a soft accent shadow — premium, never a heavy/dark block.
            "rounded-lg border border-(--accent)/30 bg-(--accent-soft) px-2.5 py-1.5 text-xs font-semibold text-(--accent-strong) shadow-[0_6px_20px_rgb(var(--accent)/0.28)] transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            className,
          )}
          style={{ ...accentVars, ...style }}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
