"use client";

import { LayoutGrid, Search, Table2 } from "lucide-react";

import { FilterModal, type FilterField, type FilterValues } from "@/components/ui/filter-modal";
import { cn } from "@/lib/utils";

export type ListView = "cards" | "table";

interface ListToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Current view + setter. When omitted, the view toggle is hidden. */
  view?: ListView;
  onViewChange?: (v: ListView) => void;
  /** Filter fields — only rendered when `showFilter` is true (e.g. > 8 items). */
  filters?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (v: FilterValues) => void;
  showFilter?: boolean;
  /** Extra controls (e.g. a "New" button) rendered on the right. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * A premium toolbar SECTION: a theme-tinted panel holding the search box, an
 * optional Filter button (shown only when there's enough data to warrant it), a
 * cards/table view toggle, and optional right-side actions. Used at the top of
 * list pages (companies, admin tenants, …).
 */
export function ListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  view,
  onViewChange,
  filters,
  filterValues,
  onFilterChange,
  showFilter = false,
  actions,
  className,
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-accent/15 p-3 shadow-sm sm:flex-row sm:items-center",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(var(--accent) / 0.07), rgb(var(--surface) / 1) 60%)",
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-border bg-surface pr-3 pl-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <div className="flex items-center gap-2">
        {showFilter && filters && filters.length > 0 && onFilterChange ? (
          <FilterModal fields={filters} values={filterValues ?? {}} onApply={onFilterChange} />
        ) : null}

        {view && onViewChange ? (
          <ViewToggle view={view} onViewChange={onViewChange} />
        ) : null}

        {actions}
      </div>
    </div>
  );
}

/** Segmented cards/table toggle with the signature accent active state. */
function ViewToggle({
  view,
  onViewChange,
}: {
  view: ListView;
  onViewChange: (v: ListView) => void;
}) {
  const items: { value: ListView; icon: typeof LayoutGrid; label: string }[] = [
    { value: "cards", icon: LayoutGrid, label: "Card view" },
    { value: "table", icon: Table2, label: "Table view" },
  ];
  return (
    <div className="flex items-center rounded-xl border border-border bg-surface p-0.5">
      {items.map((it) => {
        const on = view === it.value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onViewChange(it.value)}
            aria-label={it.label}
            aria-pressed={on}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
              on
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent-soft hover:text-accent-strong",
            )}
          >
            <it.icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
