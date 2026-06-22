"use client";

import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/ui/date-picker";
import { StoreSelect } from "@/components/org/entity-selects";
import { useCompanies } from "@/features/org/companies";
import { useStores } from "@/features/org/stores";
import type { ReportFilters } from "@/features/reports/types";

interface Props {
  filters: ReportFilters;
  onChange: (next: ReportFilters) => void;
}

/** Date-range (store-tz on the server) + store filter bar for the dashboards —
 * uses the platform's custom themed pickers. */
export function ReportsFilters({ filters, onChange }: Props) {
  const { data: stores } = useStores();
  const { data: companies } = useCompanies();

  const range: DateRange | undefined = filters.from
    ? { from: new Date(filters.from), to: filters.to ? new Date(filters.to) : undefined }
    : undefined;

  const onRange = (r: DateRange | undefined) =>
    onChange({
      ...filters,
      from: r?.from ? r.from.toISOString() : undefined,
      to: r?.to ? r.to.toISOString() : undefined,
    });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-[13px] font-medium text-foreground">Date range</label>
        <DateRangePicker value={range} onChange={onRange} className="w-64" />
      </div>
      <div className="space-y-1">
        <label className="text-[13px] font-medium text-foreground">Store</label>
        <StoreSelect
          stores={stores}
          companies={companies}
          value={filters.storeId}
          onChange={(v) => onChange({ ...filters, storeId: v })}
          className="w-56"
        />
      </div>
    </div>
  );
}
