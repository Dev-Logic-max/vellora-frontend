"use client";

import type { ReactNode } from "react";
import { ChevronDown, Clock, MapPin, MoreHorizontal, Plus, Search, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
