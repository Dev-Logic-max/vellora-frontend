"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type Role = "owner" | "hr" | "area_manager" | "store_manager" | "employee";
const ROLES: { key: Role; label: string }[] = [
  { key: "owner", label: "Owner" },
  { key: "hr", label: "HR" },
  { key: "area_manager", label: "Area Manager" },
  { key: "store_manager", label: "Store Manager" },
  { key: "employee", label: "Employee" },
];

/**
 * Widgets gallery — representative dashboard SECTIONS as each role sees them,
 * with sample data. Theme-reactive (reads the live accent), so the team can
 * judge the real look from one place. Static mockups (no API calls).
 */
export function WidgetsTab() {
  const [role, setRole] = useState<Role>("owner");

  return (
    <div className="space-y-6">
      {/* role filter */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <span className="mr-1 text-sm font-medium text-muted-foreground">Preview as:</span>
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                role === r.key
                  ? "bg-accent-soft text-primary"
                  : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* KPI row — varies by role */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisFor(role).map((k) => (
          <KpiTile key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WeekScheduleWidget />
          {(role === "owner" || role === "hr" || role === "store_manager") && <LeaveApprovalsWidget />}
        </div>
        <div className="space-y-6">
          <AttendanceWidget />
          {role === "employee" ? <MyShiftsWidget /> : <TeamStatusWidget />}
          <ActivityWidget />
        </div>
      </div>
    </div>
  );
}

/* ── KPI tiles ──────────────────────────────────────────────────────────────── */
interface Kpi {
  label: string;
  value: string;
  delta?: string;
  icon: typeof Users;
}
function kpisFor(role: Role): Kpi[] {
  if (role === "employee") {
    return [
      { label: "My hours (wk)", value: "32.5", delta: "+4%", icon: Clock },
      { label: "Shifts left", value: "3", icon: CalendarClock },
      { label: "Leave balance", value: "12d", icon: CalendarCheck },
      { label: "On-time rate", value: "98%", delta: "+1%", icon: CheckCircle2 },
    ];
  }
  return [
    { label: "Active employees", value: "1,284", delta: "+12%", icon: Users },
    { label: "Shifts this week", value: "612", delta: "+5%", icon: CalendarClock },
    { label: "Attendance", value: "96.4%", delta: "+0.8%", icon: CheckCircle2 },
    { label: "Open positions", value: "18", icon: TrendingUp },
  ];
}
function KpiTile({ label, value, delta, icon: Icon }: Kpi) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">{value}</span>
          {delta && (
            <span className="mb-1 inline-flex items-center gap-0.5 rounded-full bg-success-soft px-1.5 py-0.5 text-xs font-medium text-success">
              <ArrowUpRight className="size-3" /> {delta}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Week schedule (shift strip) ────────────────────────────────────────────── */
function WeekScheduleWidget() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shifts: Record<string, { t: string; cls: string }[]> = {
    Mon: [{ t: "Open", cls: "bg-warning-soft text-warning" }, { t: "Cashier", cls: "bg-accent-soft text-primary" }],
    Tue: [{ t: "Floor", cls: "bg-success-soft text-success" }],
    Wed: [{ t: "Cashier", cls: "bg-accent-soft text-primary" }, { t: "Open", cls: "bg-warning-soft text-warning" }],
    Thu: [{ t: "Floor", cls: "bg-success-soft text-success" }],
    Fri: [{ t: "Cashier", cls: "bg-accent-soft text-primary" }, { t: "Close", cls: "bg-success-soft text-success" }],
    Sat: [{ t: "Open", cls: "bg-warning-soft text-warning" }],
    Sun: [],
  };
  return (
    <WidgetCard title="This week's schedule" action="Open scheduler">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d} className="space-y-1.5">
            <p className="text-center text-xs font-medium text-muted-foreground">{d}</p>
            {shifts[d].map((s, i) => (
              <div key={i} className={`rounded-md px-1.5 py-1 text-center text-[11px] font-medium ${s.cls}`}>
                {s.t}
              </div>
            ))}
            {shifts[d].length === 0 && (
              <div className="rounded-md border border-dashed border-border py-1 text-center text-[11px] text-faint">
                —
              </div>
            )}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ── Attendance donut-ish summary ───────────────────────────────────────────── */
function AttendanceWidget() {
  const rows = [
    { label: "On time", pct: 88, color: "var(--color-success)" },
    { label: "Late", pct: 8, color: "var(--color-warning)" },
    { label: "Absent", pct: 4, color: "var(--color-danger)" },
  ];
  return (
    <WidgetCard title="Attendance today">
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-mono text-foreground">{r.pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ── Leave approvals ────────────────────────────────────────────────────────── */
function LeaveApprovalsWidget() {
  const rows = [
    { name: "Sara Khan", type: "Annual · 3d", status: "pending" },
    { name: "Omar Ali", type: "Sick · 1d", status: "pending" },
    { name: "Lina Park", type: "Annual · 5d", status: "active" },
  ];
  return (
    <WidgetCard title="Leave approvals" action="View all">
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-primary">
                {r.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.type}</p>
              </div>
            </div>
            {r.status === "pending" ? (
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline">Deny</Button>
                <Button size="sm">Approve</Button>
              </div>
            ) : (
              <StatusPill status="active" />
            )}
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

/* ── Team status ────────────────────────────────────────────────────────────── */
function TeamStatusWidget() {
  const team = [
    { name: "Ava M.", role: "Cashier", status: "active" },
    { name: "Ben T.", role: "Floor", status: "on_leave" },
    { name: "Cara D.", role: "Manager", status: "active" },
    { name: "Dan R.", role: "Stock", status: "pending" },
  ];
  return (
    <WidgetCard title="Team status">
      <ul className="space-y-2.5">
        {team.map((m) => (
          <li key={m.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-surface-subtle text-[11px] font-semibold text-foreground">
                {m.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="leading-tight">
                <p className="text-sm text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
            </div>
            <StatusPill status={m.status} />
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

/* ── My shifts (employee) ───────────────────────────────────────────────────── */
function MyShiftsWidget() {
  const shifts = [
    { day: "Today", time: "13:00–18:00", store: "Downtown" },
    { day: "Thu", time: "10:00–16:00", store: "Mall" },
    { day: "Sat", time: "09:00–13:00", store: "Downtown" },
  ];
  return (
    <WidgetCard title="My upcoming shifts">
      <ul className="space-y-2">
        {shifts.map((s, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" />
              <span className="font-medium text-foreground">{s.day}</span>
              <span className="text-muted-foreground">{s.time}</span>
            </div>
            <span className="text-xs text-muted-foreground">{s.store}</span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

/* ── Activity feed ──────────────────────────────────────────────────────────── */
function ActivityWidget() {
  const items = [
    { who: "Sara", what: "approved a shift swap", when: "2m" },
    { who: "System", what: "ran attendance sync", when: "1h" },
    { who: "Omar", what: "requested leave", when: "3h" },
  ];
  return (
    <WidgetCard title="Recent activity">
      <ul className="space-y-3">
        {items.map((a, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{a.who}</span> {a.what}
              <span className="ml-1 text-xs text-faint">· {a.when}</span>
            </p>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

function WidgetCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {action && (
          <Button variant="link" size="sm" className="h-auto p-0 text-primary">
            {action}
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
