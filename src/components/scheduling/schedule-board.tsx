"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Plus,
  Send,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverageStrip } from "@/components/scheduling/coverage-strip";
import { MonthGrid } from "@/components/scheduling/month-grid";
import { RosterCalendar } from "@/components/scheduling/roster-calendar";
import { ShiftSheet } from "@/components/scheduling/shift-sheet";
import { TemplatesPanel } from "@/components/scheduling/templates-panel";
import { TimeGrid } from "@/components/scheduling/time-grid";
import { ApiError } from "@/lib/api";
import { useStores } from "@/features/org/stores";
import {
  usePublishShifts,
  useShifts,
  useUpdateShift,
} from "@/features/scheduling/scheduling";
import { SHIFT_STATUS_OPTIONS } from "@/features/scheduling/status";
import { useCalendarStyle } from "@/features/scheduling/calendar-style";
import { shiftIso, weekDates, ymd } from "@/lib/schedule-time";
import type { Shift, ShiftStatus } from "@/features/scheduling/types";

type View = "day" | "week" | "month";

const VIEW_TABS: SegmentedTab<View>[] = [
  { value: "day", label: "Day", icon: CalendarClock },
  { value: "week", label: "Week", icon: Columns3 },
  { value: "month", label: "Month", icon: CalendarDays },
];

export function ScheduleBoard() {
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string | undefined>();
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(new Date());
  const [status, setStatus] = useState<ShiftStatus | "">("");
  const [boardError, setBoardError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [draftSlot, setDraftSlot] = useState<{ date?: string; hour?: number }>({});
  const [sheetKey, setSheetKey] = useState(0);

  const update = useUpdateShift();
  const publish = usePublishShifts();
  const calendarStyle = useCalendarStyle();

  const activeStore = stores?.find((s) => s.id === storeId) ?? stores?.[0];
  const effectiveStoreId = storeId ?? activeStore?.id;
  const tz = activeStore?.timezone ?? "UTC";

  // Visible days + query range.
  const { days, from, to, weekStart } = useMemo(() => {
    if (view === "month") {
      const gStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
      const gEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
      return {
        days: [] as string[],
        from: `${ymd(gStart)}T00:00:00.000Z`,
        to: `${ymd(gEnd)}T23:59:59.999Z`,
        weekStart: ymd(startOfWeek(anchor, { weekStartsOn: 1 })),
      };
    }
    const ds = view === "week" ? weekDates(anchor) : [ymd(anchor)];
    return {
      days: ds,
      from: `${ds[0]}T00:00:00.000Z`,
      to: `${ds[ds.length - 1]}T23:59:59.999Z`,
      weekStart: weekDates(anchor)[0],
    };
  }, [view, anchor]);

  const { data: shifts, isLoading } = useShifts(
    { storeId: effectiveStoreId, from, to, status: status || undefined },
    Boolean(effectiveStoreId),
  );

  const move = (shift: Shift, dayDelta: number, minuteDelta: number) => {
    setBoardError(null);
    update
      .mutateAsync({
        id: shift.id,
        input: {
          storeId: shift.storeId,
          startsAtUtc: shiftIso(shift.startsAtUtc, dayDelta, minuteDelta),
          endsAtUtc: shiftIso(shift.endsAtUtc, dayDelta, minuteDelta),
        },
      })
      .catch((e) => setBoardError(e instanceof ApiError ? e.message : "Move failed."));
  };

  const resize = (shift: Shift, minutesDelta: number) => {
    const newEnd = shiftIso(shift.endsAtUtc, 0, minutesDelta);
    if (new Date(newEnd) <= new Date(shift.startsAtUtc)) return;
    setBoardError(null);
    update
      .mutateAsync({
        id: shift.id,
        input: { storeId: shift.storeId, endsAtUtc: newEnd },
      })
      .catch((e) => setBoardError(e instanceof ApiError ? e.message : "Resize failed."));
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setDraftSlot({});
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  };
  const openCreate = (date?: string, hour?: number) => {
    setEditing(null);
    setDraftSlot({ date, hour });
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  };

  const shiftAnchor = (dir: 1 | -1) => {
    if (view === "month") setAnchor((a) => addMonths(a, dir));
    else if (view === "week") setAnchor((a) => addDays(a, dir * 7));
    else setAnchor((a) => addDays(a, dir));
  };

  const rangeLabel =
    view === "month"
      ? format(anchor, "MMMM yyyy")
      : view === "week"
        ? `${days[0]} → ${days[days.length - 1]}`
        : format(anchor, "EEEE, MMM d");

  const storeOptions =
    stores?.map((s) => ({ value: s.id, label: s.name, hint: s.code ?? undefined })) ?? [];

  const doPublish = () => {
    if (!effectiveStoreId) return;
    setBoardError(null);
    publish
      .mutateAsync({ storeId: effectiveStoreId, from, to })
      .catch((e) => setBoardError(e instanceof ApiError ? e.message : "Publish failed."));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scheduling"
        description="Plan shifts across the week — drag to move, drag the edge to resize."
        actions={
          <div className="flex items-center gap-2">
            {effectiveStoreId ? (
              <TemplatesPanel
                storeId={effectiveStoreId}
                weekStart={weekStart}
                trigger={
                  <Button variant="outline">
                    <CalendarRange />
                    Templates
                  </Button>
                }
              />
            ) : null}
            <Button variant="outline" onClick={doPublish} disabled={publish.isPending}>
              <Send />
              Publish
            </Button>
            <Button onClick={() => openCreate(days[0])} disabled={!effectiveStoreId}>
              <Plus />
              New shift
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <SegmentedTabs tabs={VIEW_TABS} value={view} onValueChange={setView} layoutGroup="schedule-view" />
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => shiftAnchor(-1)}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => shiftAnchor(1)}>
              <ChevronRight />
            </Button>
          </div>
          <span className="text-sm font-medium text-foreground tabular-nums">{rangeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Combobox
            className="w-48"
            options={storeOptions}
            value={effectiveStoreId}
            onChange={(v) => setStoreId(v)}
            placeholder="Select store"
            allowClear={false}
          />
          <SelectField
            id="shift-status-filter"
            className="w-40"
            placeholder="All statuses"
            options={SHIFT_STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as ShiftStatus | "")}
          />
        </div>
      </div>

      {boardError ? (
        <div className="flex items-center justify-between rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {boardError}
          <button onClick={() => setBoardError(null)} className="font-medium">
            Dismiss
          </button>
        </div>
      ) : null}

      {!effectiveStoreId ? (
        <EmptyState
          icon={CalendarRange}
          title="Select a store"
          description="Pick a store to start planning its shifts."
        />
      ) : isLoading ? (
        <Skeleton className="h-[520px] w-full" />
      ) : calendarStyle === "roster" ? (
        <RosterCalendar
          view={view}
          anchor={anchor}
          days={days}
          shifts={shifts ?? []}
          tz={tz}
          onShiftClick={openEdit}
          onEmptyClick={(date, hour) => openCreate(date, hour)}
          onDayClick={(date) => {
            setAnchor(new Date(`${date}T00:00:00`));
            setView("day");
          }}
        />
      ) : view === "month" ? (
        <MonthGrid
          month={anchor}
          shifts={shifts ?? []}
          tz={tz}
          onDayClick={(date) => {
            setAnchor(new Date(`${date}T00:00:00`));
            setView("day");
          }}
        />
      ) : (
        <div className="scrollbar-none max-h-[640px] overflow-y-auto">
          <TimeGrid
            days={days}
            shifts={shifts ?? []}
            tz={tz}
            onShiftClick={openEdit}
            onMove={move}
            onResize={resize}
            onEmptyClick={(date, hour) => openCreate(date, hour)}
          />
        </div>
      )}

      {view !== "month" && effectiveStoreId ? (
        <CoverageStrip storeId={effectiveStoreId} days={days} />
      ) : null}

      {effectiveStoreId ? (
        <ShiftSheet
          key={sheetKey}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          storeId={effectiveStoreId}
          shift={editing}
          defaultDate={draftSlot.date}
          defaultHour={draftSlot.hour}
        />
      ) : null}
    </div>
  );
}
