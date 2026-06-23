"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";

import { EntityAvatar } from "@/components/ui/entity-avatar";
import { cn } from "@/lib/utils";

export interface RichOption {
  value: string;
  /** Primary line. */
  title: string;
  /** Small secondary line under the title (e.g. company name). */
  subtitle?: string;
  /** Optional avatar image/logo; falls back to themed initials. */
  imageUrl?: string | null;
  /** Optional custom leading node (e.g. a flag). Overrides the avatar when set. */
  leading?: ReactNode;
  /** Right-aligned slot (e.g. "# employees" or a role tag). */
  trailing?: ReactNode;
  /** Text used for search matching (defaults to title + subtitle). */
  searchText?: string;
  /** When true, the option is shown but cannot be selected (e.g. taken store). */
  disabled?: boolean;
}

interface RichSelectProps {
  options: RichOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Searchable single-select that renders each option richly: themed avatar +
 * title + subtitle on the left and a trailing slot on the right. Backs the
 * Store / Company / Employee pickers (UI-2). Closes on outside-click / Escape.
 */
export function RichSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  allowClear = true,
  className,
  disabled,
}: RichSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      (o.searchText ?? `${o.title} ${o.subtitle ?? ""}`).toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            {selected.leading ?? (
              <EntityAvatar
                name={selected.title}
                src={selected.imageUrl}
                className="size-6 rounded-md"
                textClassName="text-[10px]"
              />
            )}
            <span className="truncate">{selected.title}</span>
          </span>
        ) : (
          <span className="truncate text-muted-foreground">{placeholder}</span>
        )}
        <span className="flex items-center gap-1">
          {allowClear && selected ? (
            <X
              className="size-3.5 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          ) : null}
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="scrollbar-none max-h-72 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">{emptyText}</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    disabled={o.disabled}
                    onClick={() => {
                      if (o.disabled) return;
                      onChange(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left",
                      o.disabled ? "cursor-not-allowed opacity-55" : "hover:bg-muted",
                    )}
                  >
                    {o.leading ?? (
                      <EntityAvatar
                        name={o.title}
                        src={o.imageUrl}
                        className="size-8 rounded-lg"
                      />
                    )}
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-medium text-foreground">{o.title}</span>
                      {o.subtitle ? (
                        <span className="truncate text-xs text-muted-foreground">{o.subtitle}</span>
                      ) : null}
                    </span>
                    {o.trailing ? <span className="shrink-0">{o.trailing}</span> : null}
                    {o.value === value ? <Check className="size-4 shrink-0 text-primary" /> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
