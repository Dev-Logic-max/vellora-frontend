"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useRecruitingInsights } from "@/features/recruiting/recruiting";
import { STAGE_LABELS, STAGE_ORDER } from "@/features/recruiting/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_HUES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function InsightsPanel() {
  const { data, isLoading } = useRecruitingInsights();

  if (isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;

  const funnel = STAGE_ORDER.filter((s) => s !== "rejected").map((stage) => ({
    stage: STAGE_LABELS[stage],
    count: data?.byStage[stage] ?? 0,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Pipeline funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={CHART_HUES[i % CHART_HUES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total candidates</span>
            <span className="font-mono tabular-nums">{data?.total ?? 0}</span>
          </div>
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="flex justify-between">
              <span className="text-muted-foreground">{STAGE_LABELS[stage]}</span>
              <span className="font-mono tabular-nums">{data?.byStage[stage] ?? 0}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
