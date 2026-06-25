"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  Camera,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  Store as StoreIcon,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CompanyConfigSheet } from "@/components/companies/company-config-sheet";
import { CompanyDeleteRequest } from "@/components/companies/company-delete-request";
import { CompanyEditDialog } from "@/components/companies/company-edit-dialog";
import { StoreCard } from "@/components/stores/store-card";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Flag } from "@/components/ui/flag";
import { PlanTag } from "@/components/ui/plan-tag";
import { SegmentedTabs, type SegmentedTab } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { countryCode, countryName } from "@/lib/geo/countries";
import { cn } from "@/lib/utils";
import { useCompany, useCompanyUsage, useUpdateCompany } from "@/features/org/companies";
import { useImageUpload, type ImageKind } from "@/features/media/media";
import { useStores } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";
import type { Company } from "@/features/org/types";

type Tab =
  | "information"
  | "stores"
  | "billing"
  | "employees"
  | "analytics"
  | "configuration";

const TABS: SegmentedTab<Tab>[] = [
  { value: "information", label: "Information", icon: Building2 },
  { value: "stores", label: "Stores", icon: StoreIcon },
  { value: "billing", label: "Billing & plan", icon: CreditCard },
  { value: "employees", label: "Employees", icon: Users },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "configuration", label: "Configuration", icon: Settings2 },
];

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading } = useCompany(id);
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("information");
  const [editOpen, setEditOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const canManage = me?.role === "owner" || Boolean(me?.platformRole);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!company) return <p className="text-sm text-destructive">Company not found.</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Companies
      </Link>

      <CompanyHero
        company={company}
        canManage={canManage}
        onEdit={() => setEditOpen(true)}
        onConfigure={() => setConfigOpen(true)}
      />

      <div className="scrollbar-thin overflow-x-auto pb-1">
        <SegmentedTabs tabs={TABS} value={tab} onValueChange={setTab} layoutGroup="company-detail" />
      </div>

      <div className="mt-1">
        {tab === "information" ? <InformationTab company={company} /> : null}
        {tab === "stores" ? <StoresTab /> : null}
        {tab === "billing" ? <BillingTab company={company} /> : null}
        {tab === "employees" ? <PlaceholderTab icon={Users} label="Employees" /> : null}
        {tab === "analytics" ? <PlaceholderTab icon={BarChart3} label="Analytics" /> : null}
        {tab === "configuration" ? (
          <ConfigurationTab
            company={company}
            canManage={canManage}
            onConfigure={() => setConfigOpen(true)}
          />
        ) : null}
      </div>

      {canManage ? (
        <>
          <CompanyEditDialog company={company} open={editOpen} onOpenChange={setEditOpen} />
          <CompanyConfigSheet company={company} open={configOpen} onOpenChange={setConfigOpen} />
        </>
      ) : null}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function CompanyHero({
  company,
  canManage,
  onEdit,
  onConfigure,
}: {
  company: Company;
  canManage: boolean;
  onEdit: () => void;
  onConfigure: () => void;
}) {
  const cc = countryCode(company.country);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      {/* Full-width banner with upload. */}
      <div className="relative h-40 w-full sm:h-52">
        {company.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgb(var(--accent) / 0.85), rgb(var(--tertiary-accent) / 0.7) 55%, rgb(var(--secondary-accent) / 0.85))",
            }}
          />
        )}
        {canManage ? (
          <ImageUploadButton
            company={company}
            kind="company-banner"
            className="absolute right-3 top-3"
            label="Change banner"
          />
        ) : null}

        {/* Top-right edit + configure icons. */}
        {canManage ? (
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <HeroIcon icon={Pencil} label="Edit company" onClick={onEdit} />
            <HeroIcon icon={Settings2} label="Configure" onClick={onConfigure} />
          </div>
        ) : null}
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {/* Logo overlapping the banner, with upload. */}
            <div className="relative -mt-12">
              <EntityAvatar
                name={company.name}
                src={company.logoUrl}
                className="size-24 rounded-2xl ring-4 ring-surface"
                textClassName="text-3xl"
              />
              {canManage ? (
                <ImageUploadButton
                  company={company}
                  kind="company-logo"
                  className="absolute -right-1 -bottom-1"
                  iconOnly
                  label="Change logo"
                />
              ) : null}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  {company.name}
                </h1>
                {cc ? <Flag code={cc} className="h-4 w-6 rounded-[3px] shadow-sm" /> : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPill status={company.status} />
                <PlanTag plan={company.planName} />
                {company.category ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-surface-subtle px-2.5 py-0.5 text-xs font-medium capitalize text-foreground-2">
                    {company.category.replace(/_/g, " ")}
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

/** Hero banner/logo image upload — picks a file, uploads, persists the URL. */
function ImageUploadButton({
  company,
  kind,
  className,
  iconOnly,
  label,
}: {
  company: Company;
  kind: ImageKind;
  className?: string;
  iconOnly?: boolean;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useImageUpload();
  const update = useUpdateCompany(company.id);
  const busy = upload.isPending || update.isPending;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const publicUrl = await upload.mutateAsync({ file, kind });
      await update.mutateAsync(
        kind === "company-banner" ? { bannerUrl: publicUrl } : { logoUrl: publicUrl },
      );
      toast.success(kind === "company-banner" ? "Banner updated." : "Logo updated.");
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

function HeroIcon({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
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

// ── Information tab ────────────────────────────────────────────────────────────
function InformationTab({ company }: { company: Company }) {
  const { data: usage } = useCompanyUsage(company.id);
  const cc = countryCode(company.country);
  const location = [company.city, company.state, countryName(cc) ?? company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={StoreIcon} label="Stores" value={usage?.stores ?? company.storeCount ?? 0} />
        <StatCard icon={Users} label="Members" value={usage?.members ?? company.employeeCount ?? 0} />
        <StatCard
          icon={Building}
          label="Business group"
          value={company.groupId ? "Linked" : "None"}
          text
        />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail icon={Hash} label="Registration number" value={company.registrationNumber} />
        <Detail icon={Mail} label="Company email" value={company.companyEmail} />
        <Detail icon={Phone} label="Phone" value={company.phone} />
        <Detail icon={MapPin} label="Location" value={location} />
        <Detail icon={Wallet} label="Currency" value={company.currency} />
        <Detail icon={Briefcase} label="Timezone" value={company.timezone} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  text?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p
          className={cn(
            "font-display font-semibold text-foreground",
            text ? "text-base" : "text-2xl tabular-nums",
          )}
        >
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/30">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{value || "—"}</dd>
      </div>
    </div>
  );
}

// ── Stores tab ─────────────────────────────────────────────────────────────────
function StoresTab() {
  const { data: stores, isLoading } = useStores();

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!stores || stores.length === 0) {
    return (
      <EmptyState
        icon={StoreIcon}
        title="No stores yet"
        description="Stores under this company will appear here as cards."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((s) => (
        <StoreCard key={s.id} store={s} />
      ))}
    </div>
  );
}

// ── Billing tab ────────────────────────────────────────────────────────────────
function BillingTab({ company }: { company: Company }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-primary">
          <CreditCard className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Current plan</p>
          <div className="mt-1">
            <PlanTag plan={company.planName} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Invoices, usage, and plan changes for this company will appear here. Manage the active
        company&apos;s subscription from{" "}
        <Link href="/settings/billing" className="font-medium text-primary hover:underline">
          Billing
        </Link>
        .
      </p>
    </div>
  );
}

// ── Configuration tab ──────────────────────────────────────────────────────────
function ConfigurationTab({
  company,
  canManage,
  onConfigure,
}: {
  company: Company;
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
            <p className="text-sm font-medium text-foreground">Company settings</p>
            <p className="text-xs text-muted-foreground">
              Operational toggles (attendance security, and more as modules expand).
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

      {canManage ? <CompanyDeleteRequest company={company} /> : null}
    </div>
  );
}

// ── Placeholder tabs (employees / analytics / etc.) ─────────────────────────────
function PlaceholderTab({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 text-center">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft/40 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary">
          <Icon className="size-7" />
        </span>
        <h3 className="font-display text-lg font-semibold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground">
          {label} for this company will appear here as that area is connected to the company view.
        </p>
      </div>
    </div>
  );
}
