"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  BarChart3,
  Building2,
  Camera,
  Clock,
  DollarSign,
  Hash,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  Settings2,
  Star,
  Store as StoreIcon,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
} from "recharts";
import { toast } from "sonner";

import { StoreConfigSheet } from "@/components/stores/store-config-sheet";
import { StoreDeleteRequest } from "@/components/stores/store-delete-request";
import { StoreEditDialog } from "@/components/stores/store-edit-dialog";
import { CapacityBar } from "@/components/stores/capacity-bar";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Flag } from "@/components/ui/flag";
import { Input } from "@/components/ui/input";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { categoryByKey } from "@/features/org/categories";
import { countryCode, countryName } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";
import {
  useCreateActivity,
  useStore,
  useStoreActivities,
  useStoreAnalytics,
  useUpdateStore,
} from "@/features/org/stores";
import { useImageUpload, type ImageKind } from "@/features/media/media";
import { useCurrentUser } from "@/features/session/use-current-user";
import type { Store } from "@/features/org/types";

type Tab = "overview" | "analytics" | "team" | "activities" | "configuration";

const TABS: SegmentedTab<Tab>[] = [
  { value: "overview", label: "Overview", icon: StoreIcon },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "team", label: "Team & shifts", icon: Users },
  { value: "activities", label: "Activities", icon: LayoutGrid },
  { value: "configuration", label: "Configuration", icon: Settings2 },
];

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: store, isLoading } = useStore(id);
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const canManage = me?.role === "owner" || me?.role === "hr" || Boolean(me?.platformRole);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!store) return <p className="text-sm text-destructive">Store not found.</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/stores"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Stores
      </Link>

      <StoreHero
        store={store}
        canManage={canManage}
        onEdit={() => setEditOpen(true)}
        onConfigure={() => setConfigOpen(true)}
      />

      <div className="scrollbar-thin overflow-x-auto pb-1">
        <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="store-detail" />
      </div>

      <div className="mt-1">
        {tab === "overview" ? <OverviewTab store={store} /> : null}
        {tab === "analytics" ? <AnalyticsTab storeId={store.id} /> : null}
        {tab === "team" ? <TeamTab store={store} /> : null}
        {tab === "activities" ? <ActivitiesTab storeId={store.id} canManage={canManage} /> : null}
        {tab === "configuration" ? (
          <ConfigurationTab store={store} canManage={canManage} onConfigure={() => setConfigOpen(true)} />
        ) : null}
      </div>

      {canManage ? (
        <>
          <StoreEditDialog store={store} open={editOpen} onOpenChange={setEditOpen} />
          <StoreConfigSheet store={store} open={configOpen} onOpenChange={setConfigOpen} />
        </>
      ) : null}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function StoreHero({
  store,
  canManage,
  onEdit,
  onConfigure,
}: {
  store: Store;
  canManage: boolean;
  onEdit: () => void;
  onConfigure: () => void;
}) {
  const cc = countryCode(store.country);
  const category = categoryByKey(store.category);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="relative h-40 w-full sm:h-52">
        {store.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div
            className={cn(
              "size-full bg-linear-to-br",
              category?.gradient ?? "from-indigo-500/85 to-violet-600/85",
            )}
            style={
              category
                ? {
                    backgroundImage: `url(/categories/${category.key}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
        )}
        <span className="absolute inset-0 bg-black/20" />

        {canManage ? (
          <ImageUploadButton
            store={store}
            kind="store-banner"
            className="absolute top-3 right-3"
            label="Change banner"
          />
        ) : null}
        {canManage ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <HeroIcon icon={Pencil} label="Edit store" onClick={onEdit} />
            <HeroIcon icon={Settings2} label="Configure" onClick={onConfigure} />
          </div>
        ) : null}
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative -mt-12">
              <EntityAvatar
                name={store.name}
                src={store.logoUrl}
                className="size-24 rounded-2xl ring-4 ring-surface"
                textClassName="text-3xl"
              />
              {canManage ? (
                <ImageUploadButton
                  store={store}
                  kind="store-logo"
                  className="absolute -right-1 -bottom-1"
                  iconOnly
                  label="Change logo"
                />
              ) : null}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-foreground">{store.name}</h1>
                {store.headStore ? (
                  <Star className="size-5 fill-amber-400 text-amber-400" />
                ) : null}
                {cc ? <Flag code={cc} className="h-4 w-6 rounded-[3px] shadow-sm" /> : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPill status={store.status} />
                {store.code ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-2.5 py-0.5 font-mono text-xs text-foreground-2">
                    <Hash className="size-3" />
                    {store.code}
                  </span>
                ) : null}
                {category ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-foreground-2 capitalize">
                    <category.icon className="size-3" />
                    {category.label}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {canManage ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Pencil />
                Edit
              </Button>
              <Button variant="outline" onClick={onConfigure}>
                <Settings2 />
                Configure
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ImageUploadButton({
  store,
  kind,
  className,
  iconOnly,
  label,
}: {
  store: Store;
  kind: ImageKind;
  className?: string;
  iconOnly?: boolean;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useImageUpload();
  const update = useUpdateStore(store.id);
  const busy = upload.isPending || update.isPending;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const publicUrl = await upload.mutateAsync({ file, kind });
      await update.mutateAsync(kind === "store-banner" ? { bannerUrl: publicUrl } : { logoUrl: publicUrl });
      toast.success(kind === "store-banner" ? "Banner updated." : "Logo updated.");
    } catch {
      toast.error("Upload failed. Check storage configuration.");
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-black/35 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/50 disabled:opacity-60",
          iconOnly && "size-8 justify-center px-0",
          className,
        )}
      >
        <Camera className="size-3.5" />
        {iconOnly ? null : busy ? "Uploading…" : label}
      </button>
    </>
  );
}

function HeroIcon({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-white/30 bg-black/35 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <Icon className="size-4" />
          </button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function OverviewTab({ store }: { store: Store }) {
  const { data: a } = useStoreAnalytics(store.id);
  const cc = countryCode(store.country);
  const location = [store.address, store.city, store.state, countryName(cc) ?? store.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Revenue (mtd)"
          value={a ? money(a.revenueMtd, a.currency) : "—"}
          change={a?.revenueChangePct}
        />
        <MetricCard
          icon={Wallet}
          label="Profit (mtd)"
          value={a ? money(a.profitMtd, a.currency) : "—"}
          change={a?.profitChangePct}
          tone="emerald"
        />
        <MetricCard
          icon={Users}
          label="Visitors (mtd)"
          value={a ? a.visitorsMtd.toLocaleString() : "—"}
          change={a?.visitorsChangePct}
        />
        <MetricCard icon={Star} label="Team" value={String(store.employeeCount ?? 0)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail icon={Hash} label="Store code" value={store.code} mono />
        <Detail icon={Building2} label="Capacity" value={`${store.employeeCount ?? 0} / ${store.capacity}`} />
        <Detail icon={Clock} label="Timezone" value={store.timezone} />
        <Detail icon={MapPin} label="Location" value={location} />
        <Detail
          icon={ActivityIcon}
          label="Shifts this week"
          value={a ? String(a.shiftsThisWeek) : "—"}
        />
        <Detail icon={Receipt} label="Avg basket" value={a ? money(a.avgBasket, a.currency) : "—"} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Capacity utilization
        </p>
        <CapacityBar used={store.employeeCount ?? 0} max={store.capacity} />
      </div>
    </div>
  );
}

// ── Analytics ──────────────────────────────────────────────────────────────────
function AnalyticsTab({ storeId }: { storeId: string }) {
  const { data: a, isLoading } = useStoreAnalytics(storeId);
  if (isLoading || !a) return <Skeleton className="h-72 w-full" />;

  const targetPct = a.target > 0 ? Math.min(Math.round((a.revenueMtd / a.target) * 100), 100) : 0;
  const trend = a.trend.map((t) => ({ ...t, label: MONTHS[t.month] }));
  const hourly = a.hourly.map((h) => ({ ...h, label: `${h.hour}:00`, peak: a.peakHours.includes(h.hour) }));

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800">
        <Receipt className="mt-0.5 size-4 shrink-0" />
        Figures are illustrative until the POS / finance integration is connected. The data shape is
        production-ready, so wiring live sales won&apos;t change this view.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={DollarSign} label="Revenue (mtd)" value={money(a.revenueMtd, a.currency)} change={a.revenueChangePct} />
        <MetricCard icon={Wallet} label="Profit (mtd)" value={money(a.profitMtd, a.currency)} change={a.profitChangePct} tone="emerald" />
        <MetricCard icon={ActivityIcon} label="Margin" value={`${a.marginPct}%`} />
        <MetricCard icon={Users} label="Labor cost" value={money(a.laborCost, a.currency)} />
      </div>

      {/* Target progress */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Monthly target</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {money(a.revenueMtd, a.currency)} / {money(a.target, a.currency)}
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-accent-strong"
            style={{ width: `${targetPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{targetPct}% of target reached</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue trend */}
        <ChartCard title="Revenue & profit" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgb(var(--muted-foreground))" />
              <ReTooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgb(var(--border))", fontSize: 12 }}
                formatter={(v) => money(Number(v), a.currency)}
              />
              <Area type="monotone" dataKey="revenue" stroke="rgb(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="rgb(var(--tertiary-accent))" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak hours */}
        <ChartCard
          title="Foot traffic by hour"
          subtitle={`Peak: ${a.peakHours.map((h) => `${h}:00`).join(" & ")}`}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourly} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="rgb(var(--muted-foreground))" interval={1} />
              <ReTooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgb(var(--border))", fontSize: 12 }}
              />
              <Bar dataKey="traffic" radius={[4, 4, 0, 0]}>
                {hourly.map((h) => (
                  <Cell
                    key={h.hour}
                    fill={h.peak ? "rgb(var(--primary))" : "rgb(var(--accent) / 0.35)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Team & shifts ────────────────────────────────────────────────────────────────
function TeamTab({ store }: { store: Store }) {
  const { data: a } = useStoreAnalytics(store.id);
  const people = store.employeeAvatars ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Users} label="Team members" value={String(store.employeeCount ?? 0)} />
        <MetricCard icon={ActivityIcon} label="Shifts this week" value={a ? String(a.shiftsThisWeek) : "—"} />
        <MetricCard icon={Clock} label="Hours scheduled" value={a ? `${a.hoursScheduled}h` : "—"} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-4 text-sm font-medium text-foreground">Team at this store</p>
        {people.length === 0 ? (
          <EmptyState icon={Users} title="No team yet" description="Assign employees to this store from the Employees module." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-surface-subtle/40 px-3 py-2.5">
                <EntityAvatar name={p.name} src={p.avatarUrl} className="size-9 rounded-lg" />
                <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
              </div>
            ))}
            {(store.employeeCount ?? 0) > people.length ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                +{(store.employeeCount ?? 0) - people.length} more
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Shift scheduling</p>
          <Link href="/shifts" className="text-sm font-medium text-primary hover:underline">
            Open scheduler →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan rosters, breaks, and coverage for this store from the Shifts module.
        </p>
      </div>
    </div>
  );
}

// ── Activities ─────────────────────────────────────────────────────────────────
function ActivitiesTab({ storeId, canManage }: { storeId: string; canManage: boolean }) {
  const { data: activities } = useStoreActivities(storeId);
  const createActivity = useCreateActivity(storeId);
  const [name, setName] = useState("");

  const add = async () => {
    if (name.trim().length < 1) return;
    await createActivity.mutateAsync({ name: name.trim() });
    setName("");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="font-display text-base font-semibold text-foreground">Activities</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Color-coded tasks that seed shift templates.</p>

      {canManage ? (
        <div className="mt-4 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Window display" className="h-9" />
          <Button onClick={add} disabled={createActivity.isPending}>
            <Plus />
            Add
          </Button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {activities?.length === 0 && <p className="text-sm text-muted-foreground">No activities yet.</p>}
        {activities?.map((activity) => (
          <span
            key={activity.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs"
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: activity.color }} />
            {activity.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Configuration ──────────────────────────────────────────────────────────────
function ConfigurationTab({
  store,
  canManage,
  onConfigure,
}: {
  store: Store;
  canManage: boolean;
  onConfigure: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
            <Settings2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Store settings</p>
            <p className="text-xs text-muted-foreground">
              POS link, public profile, peak alerts, and the monthly revenue target.
            </p>
          </div>
        </div>
        {canManage ? (
          <Button variant="outline" onClick={onConfigure}>
            <Settings2 />
            Open settings
          </Button>
        ) : null}
      </div>

      {canManage ? <StoreDeleteRequest store={store} /> : null}
    </div>
  );
}

// ── Shared bits ────────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-accent-soft text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
        {change != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
              change >= 0 ? "text-emerald-600" : "text-rose-500",
            )}
          >
            {change >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(change)}%
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/30">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
        <dd className={cn("mt-0.5 truncate text-sm font-medium text-foreground", mono && "font-mono")}>
          {value || "—"}
        </dd>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
