"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableShellProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  /** Rendered (in the table card) when there are no rows and not loading. */
  empty?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  skeletonRows?: number;
}

/**
 * Premium table shell on TanStack Table: sticky uppercase header, hover rows,
 * built-in skeleton + empty handling. Columns are plain ColumnDef definitions.
 */
export function DataTableShell<TData>({
  columns,
  data,
  isLoading,
  empty,
  onRowClick,
  skeletonRows = 6,
}: DataTableShellProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase"
            >
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
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
                  "border-b border-border last:border-0 hover:bg-surface-subtle",
                  onRowClick && "cursor-pointer",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!isLoading && data.length === 0 && empty ? (
        <div className="px-4 py-12">{empty}</div>
      ) : null}
    </div>
  );
}
