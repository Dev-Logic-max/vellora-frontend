"use client";

import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  User,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePlatformDesign } from "@/features/design/design";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";

/**
 * Component gallery — the building blocks used across the platform, grouped by
 * purpose and rendered live so design/theme changes preview instantly. Includes
 * a Shifts section (the app's signature surface).
 */
export function ComponentsTab() {
  return (
    <div className="space-y-6">
      <Section title="Actions" description="Buttons, dropdowns and quick actions.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus className="size-4" /> Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">
            <Trash2 className="size-4" /> Delete
          </Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Options <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" variant="ghost" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </Section>

      <Section title="Forms & inputs" description="Fields, search, toggles and selects.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Full name</label>
            <Input placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search anything…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Disabled</label>
            <Input placeholder="Read only" disabled />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">Native select</label>
            <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Store manager</option>
              <option>HR</option>
              <option>Employee</option>
            </select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-foreground">Email notifications</p>
              <p className="text-xs text-muted-foreground">Send shift reminders to staff.</p>
            </div>
            <Switch defaultChecked />
          </div>
          {/* Slider (native range, accent-tinted) */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[13px] font-medium text-foreground">Coverage target</label>
            <input
              type="range"
              defaultValue={70}
              className="accent-primary h-2 w-full cursor-pointer"
              aria-label="Coverage target"
            />
          </div>
        </div>
      </Section>

      <Section title="Data display" description="Badges, status pills, avatars and chips.">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <StatusPill status="active" />
          <StatusPill status="pending" />
          <StatusPill status="on_leave" />
          <StatusPill status="suspended" />
          <StatusPill status="deleted" />
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-primary">
            <User className="size-3" /> Assigned
          </span>
        </div>
        <div className="mt-4 flex -space-x-2">
          {["A", "B", "C", "D"].map((c, i) => (
            <span
              key={c}
              className="flex size-9 items-center justify-center rounded-full border-2 border-surface text-xs font-semibold text-white"
              style={{ backgroundColor: `var(--color-chart-${i + 1})` }}
            >
              {c}
            </span>
          ))}
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-surface bg-surface-subtle text-xs font-semibold text-muted-foreground">
            +6
          </span>
        </div>
      </Section>

      <Section title="Feedback & overlays" description="Modals, banners and progress.">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>Open modal</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve this shift?</DialogTitle>
                <DialogDescription>
                  The employee will be notified and the schedule updated.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <DialogClose render={<Button />}>Approve</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex-1 rounded-lg border border-accent-soft bg-accent-soft/60 p-3 text-sm text-primary">
            Heads up — your trial ends in 5 days.
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Onboarding progress</span>
            <span className="font-mono">68%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
          </div>
        </div>
      </Section>

      <Section
        title="Tabs"
        description="Module sub-tabs / segmented controls. Pick a style in Layout → Tab style; the active one is marked here."
      >
        <TabsShowcase />
      </Section>

      <Section
        title="Error pages"
        description="What users see when something fails — session expiry, denied access, not found, rate-limited, or a server error."
      >
        <ErrorShowcase />
      </Section>

      <Section
        title="Loaders"
        description="Skeletons, spinners and loading animations used while data is fetching."
      >
        <LoaderShowcase />
      </Section>

      <Section title="Shifts" description="The signature scheduling surface.">
        <ShiftShowcase />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Shift blocks (status-colored) + a coverage strip — the scheduling DNA. */
function ShiftShowcase() {
  const blocks = [
    { label: "Open", time: "09:00–13:00", status: "planning", cls: "bg-warning-soft text-warning border-warning/30" },
    { label: "Cashier", time: "13:00–18:00", status: "assigned", cls: "bg-accent-soft text-primary border-primary/30" },
    { label: "Floor", time: "10:00–16:00", status: "approved", cls: "bg-success-soft text-success border-success/30" },
    { label: "Cancelled", time: "18:00–22:00", status: "cancelled", cls: "bg-danger-soft text-danger border-danger/30" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b) => (
          <div key={b.label} className={`rounded-lg border p-3 ${b.cls}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{b.label}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                {b.status}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
              <Clock className="size-3" /> {b.time}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs opacity-80">
              <MapPin className="size-3" /> Downtown
            </div>
          </div>
        ))}
      </div>
      {/* coverage strip */}
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Coverage by hour</p>
        <div className="flex h-16 items-end gap-1 rounded-lg border border-border bg-surface p-2">
          {[40, 55, 70, 85, 95, 80, 65, 75, 90, 60, 45, 35].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${h}%`, backgroundColor: `rgb(var(--accent) / ${0.35 + h / 200})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tabs (with-icons vs text-only) ──────────────────────────────────────── */
const DEMO_TABS: SegmentedTab<string>[] = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "people", label: "People", icon: Users },
  { value: "schedule", label: "Schedule", icon: CalendarDays },
];

function TabsShowcase() {
  const { data } = usePlatformDesign();
  const iconsOn = data?.prefs?.tabsIcons ?? true;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TabsVariant title="With icons" active={iconsOn} wrapperClass="tabs-with-icons" />
      <TabsVariant title="Text only" active={!iconsOn} wrapperClass="tabs-no-icons" />
    </div>
  );
}

function TabsVariant({
  title,
  active,
  wrapperClass,
}: {
  title: string;
  active: boolean;
  wrapperClass: string;
}) {
  // Local, self-contained tab state so the preview is interactive but isolated.
  const [pill, setPill] = useState("overview");
  const [line, setLine] = useState("overview");
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border bg-surface p-4",
        active ? "border-transparent ring-2 ring-primary" : "border-border",
        wrapperClass,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {active ? <span className="text-xs font-medium text-primary">Active</span> : null}
      </div>
      <SegmentedTabs
        tabs={DEMO_TABS}
        value={pill}
        onValueChange={setPill}
        layoutGroup={`demo-pill-${wrapperClass}`}
      />
      <SegmentedTabs
        tabs={DEMO_TABS}
        value={line}
        onValueChange={setLine}
        variant="line"
        layoutGroup={`demo-line-${wrapperClass}`}
      />
    </div>
  );
}

/* ── Error pages ─────────────────────────────────────────────────────────── */
function ErrorShowcase() {
  const samples: { label: string; error: unknown }[] = [
    { label: "Session expired (401)", error: new ApiError(401, "Your session has expired.") },
    { label: "Access denied (403)", error: new ApiError(403, "Platform access required.") },
    { label: "Not found (404)", error: new ApiError(404, "This item doesn't exist.") },
    { label: "Rate limited (429)", error: new ApiError(429, "Too many requests.") },
    { label: "Server error (500)", error: new ApiError(500, "Something went wrong on our end.") },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {samples.map((s) => (
        <div key={s.label} className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {s.label}
          </p>
          <ErrorState error={s.error} onRetry={() => {}} className="py-10" />
        </div>
      ))}
    </div>
  );
}

/* ── Loaders ─────────────────────────────────────────────────────────────── */
function LoaderShowcase() {
  return (
    <div className="space-y-6">
      {/* Skeletons */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Skeletons</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Card skeleton */}
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          {/* List/table skeleton */}
          <div className="space-y-2.5 rounded-xl border border-border bg-surface p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spinners + animations */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Spinners &amp; animations
        </p>
        <div className="flex flex-wrap items-center gap-8 rounded-xl border border-border bg-surface p-6">
          {/* Lucide spinner */}
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-7 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Spinner</span>
          </div>
          {/* Ring spinner */}
          <div className="flex flex-col items-center gap-2">
            <span className="size-7 animate-spin rounded-full border-2 border-accent-soft border-t-primary" />
            <span className="text-xs text-muted-foreground">Ring</span>
          </div>
          {/* Bouncing dots */}
          <div className="flex flex-col items-center gap-2">
            <span className="flex items-center gap-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="size-2 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </span>
            <span className="text-xs text-muted-foreground">Dots</span>
          </div>
          {/* Pulsing bar */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
              <span className="block h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Progress (indeterminate)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
