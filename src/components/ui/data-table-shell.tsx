"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  FilterModal,
  hasActiveFilters,
  type FilterField,
  type FilterValues,
} from "@/components/ui/filter-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Column meta the shell understands. Set `isActions: true` on an action column
 * so its header renders an "Actions" label (right-aligned) instead of blank. */
export interface DataTableColumnMeta {
  isActions?: boolean;
  /** Override the header alignment (defaults left, or right for actions). */
  align?: "left" | "right" | "center";
}

export interface TableToolbarConfig {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter fields → renders a Filter button + centered modal. */
  filters?: FilterField[];
  filterValues?: FilterValues;
  onFilterChange?: (values: FilterValues) => void;
  /** Extra controls rendered between search and the Filter button. */
  extra?: React.ReactNode;
}

export interface TablePaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Plural noun for the count line, e.g. "employees", "requests". */
  itemLabel?: string;
}

interface DataTableShellProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  /** Rendered (in the table card) when there are no rows and not loading. */
  empty?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  skeletonRows?: number;
  /** Premium toolbar above the table (search + filters + reset). */
  toolbar?: TableToolbarConfig;
  /** Themed pager + "Showing X–Y of Z" line below the table. */
  pagination?: TablePaginationConfig;
}

function alignClass(align?: "left" | "right" | "center") {
  return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

/**
 * Premium table shell on TanStack Table: optional search/filter toolbar, themed
 * header tint, hover rows, skeleton + empty handling, and a themed pager with a
 * "Showing X–Y of Z" line. Columns are plain ColumnDef definitions; set
 * `meta.isActions` on an action column to label its header "Actions".
 */
export function DataTableShell<TData>({
  columns,
  data,
  isLoading,
  empty,
  onRowClick,
  skeletonRows = 6,
  toolbar,
  pagination,
}: DataTableShellProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const filtersActive =
    toolbar?.filterValues != null && hasActiveFilters(toolbar.filterValues);

  return (
    <div className="space-y-3">
      {toolbar ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={toolbar.searchValue}
              onChange={(e) => toolbar.onSearchChange(e.target.value)}
              placeholder={toolbar.searchPlaceholder ?? "Search…"}
              className="h-9 w-full rounded-lg border border-border bg-background pr-9 pl-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {/* Instant reset (appears once filters are applied). */}
            {filtersActive && toolbar.onFilterChange ? (
              <button
                type="button"
                aria-label="Reset filters"
                title="Reset filters"
                onClick={() => toolbar.onFilterChange?.({})}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="size-4" />
              </button>
            ) : null}
          </div>

          {toolbar.extra}

          {toolbar.filters && toolbar.filters.length > 0 && toolbar.onFilterChange ? (
            <FilterModal
              fields={toolbar.filters}
              values={toolbar.filterValues ?? {}}
              onApply={toolbar.onFilterChange}
            />
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="table-header-tint-strong border-b border-accent/20 text-left text-xs tracking-wide text-foreground-2 uppercase"
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const align = meta?.align ?? (meta?.isActions ? "right" : "left");
                  return (
                    <th
                      key={header.id}
                      className={cn("px-4 py-3 font-semibold", alignClass(align))}
                    >
                      {meta?.isActions
                        ? "Actions"
                        : header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`s-${i}`} className="border-b border-border last:border-0">
                  {columns.map((_col, ci) => (
                    <td key={ci} className="px-4 py-3">
                      <Skeleton className="h-5 w-24" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "group border-b border-border transition-colors last:border-0 hover:bg-accent-soft/30",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                    const align = meta?.align ?? (meta?.isActions ? "right" : "left");
                    return (
                      <td
                        key={cell.id}
                        className={cn("px-4 py-3 align-middle", alignClass(align))}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>

        {!isLoading && data.length === 0 && empty ? (
          <div className="px-4 py-12">{empty}</div>
        ) : null}
      </div>

      {pagination && pagination.total > 0 ? <TablePagination {...pagination} /> : null}
    </div>
  );
}

function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = "results",
}: TablePaginationConfig) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Compact page-number window around the current page.
  const pages = pageWindow(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row">
      <p className="text-muted-foreground tabular-nums">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="size-8 border-border hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent-strong"
        >
          <ChevronLeft />
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums transition-colors",
                p === page
                  ? "border-accent/40 bg-accent-soft text-accent-strong shadow-accent-sm"
                  : "border-border text-muted-foreground hover:border-accent/30 hover:bg-accent-soft/40 hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="size-8 border-border hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent-strong"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

/** Page numbers with ellipses: 1 … p-1 p p+1 … N (windowed). */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
