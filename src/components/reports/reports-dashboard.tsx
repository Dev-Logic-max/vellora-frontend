"use client";

import { Banknote, CalendarClock, PieChart as PieIcon, TrendingDown, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useAttendanceReport,
  useHeadcount,
  useLaborCost,
  useTurnover,
} from "@/features/reports/reports";
import { useEmployees } from "@/features/employees/employees";
import { ROLE_META, STAFF_ROLES } from "@/features/permissions/roles";
import type { ReportFilters } from "@/features/reports/types";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportsDashboard({ filters }: { filters: ReportFilters }) {
  const headcount = useHeadcount(filters);
  const attendance = useAttendanceReport(filters);
  const turnover = useTurnover(filters);
  const labor = useLaborCost(filters);

  const loading =
    headcount.isLoading || attendance.isLoading || turnover.isLoading || labor.isLoading;
  const error = headcount.error ?? attendance.error ?? turnover.error ?? labor.error;

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void headcount.refetch();
          void attendance.refetch();
          void turnover.refetch();
          void labor.refetch();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Active employees" value={String(headcount.data?.active ?? 0)} icon={Users} />
        <KpiTile
          label="Hours worked"
          value={String(attendance.data?.totalHours ?? 0)}
          icon={CalendarClock}
        />
        <KpiTile
          label="Turnover rate"
          value={`${turnover.data?.turnoverRate ?? 0}%`}
          icon={TrendingDown}
        />
        <KpiTile
          label="Labor cost"
          value={`$${(labor.data?.totalCost ?? 0).toLocaleString()}`}
          icon={Banknote}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hours worked</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendance.data?.series ?? []}>
                <defs>
                  <linearGradient id="rep-hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgb(var(--accent) / 0.25)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="rgb(var(--accent))"
                  strokeWidth={2.5}
                  fill="url(#rep-hours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor cost</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={labor.data?.series ?? []}>
                <defs>
                  <linearGradient id="rep-cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--tertiary-accent))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "rgb(var(--accent) / 0.06)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgb(var(--accent) / 0.25)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="cost" fill="url(#rep-cost)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workforce composition — users per company role (fixed role colors). */}
      <RoleDistributionCard filters={filters} />
    </div>
  );
}

/** Donut of users by company role (fixed role colors; hover shows the count).
 * Excludes platform super-admins — this is the tenant's workforce. */
function RoleDistributionCard({ filters }: { filters: ReportFilters }) {
  const { data } = useEmployees({
    page: 1,
    pageSize: 200,
    storeId: filters.storeId,
  });

  const counts = new Map<string, number>();
  for (const e of data?.data ?? []) {
    const r = e.membershipRole;
    if (r && STAFF_ROLES.includes(r)) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  const chartData = STAFF_ROLES.filter((r) => (counts.get(r) ?? 0) > 0).map((r) => ({
    name: ROLE_META[r].label,
    value: counts.get(r) ?? 0,
    color: ROLE_META[r].dot,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="size-4 text-accent-strong" /> Workforce by role
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No role data to chart yet.
          </p>
        ) : (
          <div className="grid items-center gap-4 sm:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="rgb(var(--surface))"
                  strokeWidth={2}
                >
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgb(var(--accent) / 0.25)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend with counts */}
            <ul className="space-y-2">
              {chartData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-foreground">{d.name}</span>
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {d.value} · {Math.round((d.value / total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
