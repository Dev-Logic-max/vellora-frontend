"use client";

import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  PlaneTakeoff,
  ScanLine,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";

import { cn } from "@/lib/utils";

const NAV: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Employees", icon: Users },
  { label: "Scheduling", icon: CalendarDays },
  { label: "Attendance", icon: ScanLine },
  { label: "Leave", icon: PlaneTakeoff },
  { label: "Recruiting", icon: Briefcase },
  { label: "Reports", icon: BarChart3 },
];

const KPIS = [
  { label: "Headcount", value: "248", delta: "+12", up: true },
  { label: "Present today", value: "214", delta: "86%", up: true },
  { label: "On leave", value: "9", delta: "−2", up: false },
  { label: "Open shifts", value: "5", delta: "+1", up: false },
];

const CHART = [
  { d: "Mon", v: 82 },
  { d: "Tue", v: 88 },
  { d: "Wed", v: 79 },
  { d: "Thu", v: 91 },
  { d: "Fri", v: 86 },
  { d: "Sat", v: 72 },
  { d: "Sun", v: 68 },
];

const MINI_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MINI_ROWS = [
  [1, 1, 0, 2, 2, 0, 0],
  [0, 2, 2, 1, 0, 1, 1],
  [2, 0, 1, 1, 1, 2, 0],
];
const CELL = ["bg-muted", "bg-primary/30", "bg-warning/40"];

export function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 shadow-foreground/5 ring-foreground/5">
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto w-full max-w-xs truncate rounded-md bg-background px-3 py-1 text-center text-[11px] text-muted-foreground ring-1 ring-border">
          app.vellora.com/dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col border-r border-border bg-background/60 p-3 sm:flex">
          <span className="px-2 font-display text-base font-semibold tracking-tight text-primary">
            Vellora
          </span>
          <nav className="mt-4 space-y-0.5">
            {NAV.map(({ label, icon: Icon, active }) => (
              <span
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </span>
            ))}
          </nav>
          <span className="mt-auto flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
            <Settings className="size-3.5" />
            Settings
          </span>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Dashboard</p>
              <p className="text-[10px] text-muted-foreground">Tuesday, June 16 · 3 stores</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground sm:flex">
                <Search className="size-3" />
                Search…
              </span>
              <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Bell className="size-3" />
              </span>
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                AR
              </span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {KPIS.map(({ label, value, delta, up }) => (
              <div key={label} className="rounded-xl border border-border bg-background/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-lg font-semibold text-foreground">
                    {value}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      up ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + mini schedule */}
          <div className="mt-3 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[10px] font-medium text-muted-foreground">
                Attendance · this week
              </p>
              <div className="mt-1 h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="velloraArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="d"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "var(--muted)" }}
                      interval={0}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#velloraArea)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-[10px] font-medium text-muted-foreground">
                This week&apos;s shifts
              </p>
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-7 gap-1">
                  {MINI_DAYS.map((d, i) => (
                    <span key={i} className="text-center text-[8px] text-muted-foreground">
                      {d}
                    </span>
                  ))}
                </div>
                {MINI_ROWS.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7 gap-1">
                    {row.map((cell, ci) => (
                      <span key={ci} className={cn("h-3.5 rounded-sm", CELL[cell])} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
