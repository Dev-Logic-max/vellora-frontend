"use client";

import { ArrowUpRight, Check, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Component gallery — renders the core primitives so design changes can be
 * previewed live. Everything here reads the same semantic tokens the rest of
 * the dashboard uses, so editing the palette re-skins this gallery instantly.
 */
export function ComponentsTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Badges & pills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
            <Check className="size-3" /> Active
          </span>
          <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
            Pending
          </span>
          <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger">
            Failed
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Search…" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="With icon" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">KPI tile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active employees
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                1,284
              </span>
              <span className="mb-1 inline-flex items-center gap-0.5 rounded-full bg-success-soft px-1.5 py-0.5 text-xs font-medium text-success">
                <ArrowUpRight className="size-3" /> 12%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Accent swatches & gradient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Swatch className="bg-primary text-primary-foreground" label="Primary" />
            <Swatch className="bg-secondary-accent text-white" label="Secondary" />
            <Swatch className="bg-tertiary-accent text-white" label="Accent" />
            <Swatch className="bg-accent-soft text-accent-strong" label="Soft" />
          </div>
          <div className="surface-brand flex h-20 items-center justify-center rounded-lg text-sm font-medium text-white">
            Brand gradient (chrome / CTAs)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={`flex h-14 w-28 items-center justify-center rounded-lg text-xs font-medium ${className}`}
    >
      {label}
    </div>
  );
}
