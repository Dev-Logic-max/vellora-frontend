"use client";

import { Banknote, CalendarClock, TrendingDown, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.15}
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="cost" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
