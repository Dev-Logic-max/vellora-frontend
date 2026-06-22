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

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { ROLE_META, TENANT_ROLES } from "@/features/permissions/roles";
import { cn } from "@/lib/utils";

type Role = "owner" | "hr" | "area_manager" | "store_manager" | "employee";
// Use the central (fixed-color) role catalogue so chips match everywhere.
const ROLES = TENANT_ROLES.map((r) => ({ key: r.key as Role, label: r.label }));

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
          {ROLES.map((r) => {
            const active = role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                  active
                    ? cn(ROLE_META[r.key].tone, "shadow-sm")
                    : "border-transparent text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            );
          })}
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

      {/* ── New & advanced widgets (idea gallery — not yet in the product) ──── */}
      <div className="flex items-center gap-2 pt-2">
        <span className="h-4 w-1 rounded-full bg-accent" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Advanced widgets
        </h3>
        <span className="text-xs text-muted-foreground">
          · New section ideas — charts, heatmaps, calendars &amp; more
        </span>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <TrendChartWidget />
        <RoleDonutWidget />
        <GaugeWidget />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <HeatmapWidget />
        <MiniCalendarWidget />
        <LeaderboardWidget />
      </div>
    </div>
  );
}

/* ── Trend chart (gradient area) ─────────────────────────────────────────────── */
function TrendChartWidget() {
  const data = [42, 55, 48, 63, 60, 72, 80].map((v, i) => ({ d: i, v }));
  return (
    <WidgetCard title="Hours trend">
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="wg-trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--tertiary-accent))" stopOpacity={0.55} />
              <stop offset="55%" stopColor="rgb(var(--accent))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="wg-trend-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(var(--accent))" />
              <stop offset="100%" stopColor="rgb(var(--tertiary-accent))" />
            </linearGradient>
          </defs>
          <RTooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="v"
            stroke="url(#wg-trend-line)"
            strokeWidth={2.5}
            fill="url(#wg-trend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

/* ── Role donut (with legend + center total) ─────────────────────────────────── */
function RoleDonutWidget() {
  const data = [
    { name: "Employees", value: 64, color: ROLE_META.employee.dot },
    { name: "Store mgrs", value: 14, color: ROLE_META.store_manager.dot },
    { name: "Area mgrs", value: 6, color: ROLE_META.area_manager.dot },
    { name: "HR", value: 4, color: ROLE_META.hr.dot },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <WidgetCard title="Team composition">
      <div className="flex items-center gap-3">
        <div className="relative h-[140px] w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={3}
                stroke="rgb(var(--surface))"
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-lg font-semibold text-foreground">
              <CountUp value={total} />
            </span>
            <span className="text-[10px] text-muted-foreground">people</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-foreground">{d.name}</span>
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  );
}

/* ── Radial gauge ────────────────────────────────────────────────────────────── */
function GaugeWidget() {
  const value = 86;
  const data = [{ name: "score", value, fill: "rgb(var(--accent))" }];
  return (
    <WidgetCard title="Coverage score">
      <div className="relative">
        <ResponsiveContainer width="100%" height={150}>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-foreground">
            <CountUp value={value} suffix="%" />
          </span>
          <span className="text-xs text-muted-foreground">on target</span>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ── Attendance heatmap ──────────────────────────────────────────────────────── */
function HeatmapWidget() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  // 5 weeks × 7 days of pseudo intensities.
  const weeks = Array.from({ length: 5 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => ((w * 7 + d) * 37) % 100),
  );
  return (
    <WidgetCard title="Attendance heatmap">
      <div className="space-y-1.5">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground">
          {days.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((v, di) => (
              <span
                key={di}
                title={`${v}%`}
                className="aspect-square rounded-sm"
                style={{ backgroundColor: `rgb(var(--accent) / ${0.12 + (v / 100) * 0.8})` }}
              />
            ))}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ── Mini month calendar ─────────────────────────────────────────────────────── */
function MiniCalendarWidget() {
  const marked = new Set([3, 8, 9, 15, 16, 22, 27]);
  const today = 16;
  return (
    <WidgetCard title="December">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="pb-1 font-medium text-muted-foreground">
            {d}
          </span>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <span
            key={day}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md tabular-nums",
              day === today
                ? "bg-primary font-semibold text-(--accent-foreground,white)"
                : marked.has(day)
                  ? "bg-accent-soft font-medium text-accent-strong"
                  : "text-foreground hover:bg-surface-subtle",
            )}
          >
            {day}
          </span>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ── Leaderboard (rank-colored gradient bars) ────────────────────────────────── */
function LeaderboardWidget() {
  // Gold / silver / bronze for the podium, then theme accent for the rest.
  const rows = [
    { name: "Sara Khan", hrs: 162, pct: 100, from: "#f59e0b", to: "#fcd34d" },
    { name: "Omar Ali", hrs: 148, pct: 91, from: "#64748b", to: "#cbd5e1" },
    { name: "Lina Park", hrs: 134, pct: 83, from: "#b45309", to: "#f59e0b" },
    {
      name: "Dan Reed",
      hrs: 121,
      pct: 75,
      from: "rgb(var(--accent))",
      to: "rgb(var(--tertiary-accent))",
    },
  ];
  const rankCls = ["bg-amber-100 text-amber-700", "bg-slate-200 text-slate-700", "bg-orange-100 text-orange-700"];
  return (
    <WidgetCard title="Top hours this month">
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    rankCls[i] ?? "bg-accent-soft text-accent-strong",
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-foreground">{r.name}</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground">{r.hrs}h</span>
            </div>
            <ProgressBar value={r.pct} from={r.from} to={r.to} />
          </li>
        ))}
      </ul>
    </WidgetCard>
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
  // Each meter uses a gradient fill (lighter → fuller hue) instead of a flat color.
  const rows = [
    { label: "On time", pct: 88, from: "rgb(var(--success) / 0.55)", to: "rgb(var(--success))" },
    { label: "Late", pct: 8, from: "rgb(var(--warning) / 0.55)", to: "rgb(var(--warning))" },
    { label: "Absent", pct: 4, from: "rgb(var(--danger) / 0.55)", to: "rgb(var(--danger))" },
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
            <ProgressBar value={r.pct} from={r.from} to={r.to} />
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
