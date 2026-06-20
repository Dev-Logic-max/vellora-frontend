"use client";

import { useStores } from "@/features/org/stores";
import type { ReportFilters } from "@/features/reports/types";

interface Props {
  filters: ReportFilters;
  onChange: (next: ReportFilters) => void;
}

const inputCls =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none";

/** Date-range (store-tz on the server) + store filter bar for the dashboards. */
export function ReportsFilters({ filters, onChange }: Props) {
  const { data: stores } = useStores();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-[13px] font-medium text-foreground">From</label>
        <input
          type="date"
          className={inputCls}
          value={filters.from?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({ ...filters, from: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </div>
      <div className="space-y-1">
        <label className="text-[13px] font-medium text-foreground">To</label>
        <input
          type="date"
          className={inputCls}
          value={filters.to?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({ ...filters, to: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </div>
      <div className="space-y-1">
        <label className="text-[13px] font-medium text-foreground">Store</label>
        <select
          className={inputCls}
          value={filters.storeId ?? ""}
          onChange={(e) => onChange({ ...filters, storeId: e.target.value || undefined })}
        >
          <option value="">All stores</option>
          {stores?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
