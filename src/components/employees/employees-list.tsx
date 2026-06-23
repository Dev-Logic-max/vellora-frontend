"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Copy, Download, Eye, Pencil, Plus, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AvatarPreview } from "@/components/ui/avatar-preview";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FilterValues } from "@/components/ui/filter-modal";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
import { EmployeeDeleteModal } from "@/components/employees/employee-delete-modal";
import { ExportEmployeesDialog } from "@/components/employees/export-employees-dialog";
import { ImportEmployeesDialog } from "@/components/employees/import-employees-dialog";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useStores } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";
import { useEmployees } from "@/features/employees/employees";
import { EMPLOYEE_STATUS_OPTIONS } from "@/features/employees/constants";
import type { Employee, EmployeeDetail, EmployeeStatus } from "@/features/employees/types";
import type { MembershipRole } from "@/features/session/types";

const PAGE_SIZE = 25;

export function EmployeesList() {
  const { data: me } = useCurrentUser();
  const { data: stores } = useStores();

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);

  const storeId = filters.storeId || undefined;
  const status = (filters.status as EmployeeStatus | undefined) || undefined;

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useEmployees({
    page,
    pageSize: PAGE_SIZE,
    q: q || undefined,
    storeId,
    status,
  });

  const storeName = useMemo(() => {
    const map = new Map(stores?.map((s) => [s.id, s.name]));
    return (id: string | null) => (id ? (map.get(id) ?? "—") : "—");
  }, [stores]);

  const canManage =
    me?.role && ["owner", "hr", "area_manager", "store_manager"].includes(me.role);
  const canImportExport = me?.role === "owner" || me?.role === "hr";

  const columns = useMemo<ColumnDef<Employee, unknown>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "lastName",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Avatar shows a pointer + opens an image preview on click. */}
              <AvatarPreview
                name={`${e.firstName} ${e.lastName}`}
                src={e.avatarUrl}
                className="size-9 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {e.firstName} {e.lastName}
                </p>
                {e.email ? (
                  <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "User ID",
        accessorKey: "uniqueCode",
        cell: ({ row }) => <CopyIdBadge id={row.original.uniqueCode} />,
      },
      {
        header: "User role",
        accessorKey: "membershipRole",
        cell: ({ row }) => <UserRoleCell role={row.original.membershipRole} />,
      },
      {
        header: "Store",
        cell: ({ row }) => storeName(row.original.primaryStoreId),
      },
      {
        header: "Department",
        accessorKey: "department",
        cell: ({ row }) => row.original.department ?? "—",
      },
      {
        header: "Job role",
        accessorKey: "role",
        cell: ({ row }) =>
          row.original.role ? (
            <span className="text-foreground">{row.original.role}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: ({ row }) => <RowActions employee={row.original} canManage={Boolean(canManage)} />,
      },
    ],
    [storeName, canManage],
  );

  const total = data?.total ?? 0;
  const storeOptions = stores?.map((s) => ({ value: s.id, label: s.name })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Your people directory across every store."
        actions={
          <div className="flex items-center gap-2">
            {canImportExport ? (
              <>
                <ExportEmployeesDialog
                  trigger={
                    <Button variant="outline">
                      <Download />
                      Export
                    </Button>
                  }
                />
                <ImportEmployeesDialog
                  trigger={
                    <Button variant="outline">
                      <Upload />
                      Import
                    </Button>
                  }
                />
              </>
            ) : null}
            {canManage ? (
              <EmployeeFormSheet
                trigger={
                  <Button>
                    <Plus />
                    New employee
                  </Button>
                }
              />
            ) : null}
          </div>
        }
      />

      {isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load employees.</p>
      ) : (
        <DataTableShell
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          toolbar={{
            searchValue: search,
            onSearchChange: setSearch,
            searchPlaceholder: "Search name, email, or ID…",
            filters: [
              { key: "storeId", label: "Store", type: "select", options: storeOptions },
              { key: "status", label: "Status", type: "select", options: EMPLOYEE_STATUS_OPTIONS },
            ],
            filterValues: filters,
            onFilterChange: (v) => {
              setFilters(v);
              setPage(1);
            },
          }}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total,
            onPageChange: setPage,
            itemLabel: "employees",
          }}
          empty={
            <EmptyState
              icon={Users}
              title="No employees yet"
              description="Add your first employee or import a CSV to get started."
              action={
                canManage ? (
                  <EmployeeFormSheet
                    trigger={
                      <Button>
                        <Plus />
                        New employee
                      </Button>
                    }
                  />
                ) : undefined
              }
            />
          }
        />
      )}
    </div>
  );
}

/** Company user-role chip. Owner is leadership — shown muted as "Owner" is
 * implied; per spec we surface every other role with its color, owner excluded. */
function UserRoleCell({ role }: { role: MembershipRole | null }) {
  if (!role || role === "owner") return <span className="text-muted-foreground">—</span>;
  return <RoleTag role={role} />;
}

/** Plain mono ID — click to copy (shows a copy icon on hover; tick on copy). */
function CopyIdBadge({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(id).then(
      () => {
        setCopied(true);
        toast.success(`Copied ${id}`);
        setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error("Couldn't copy"),
    );
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Click to copy ID"
      className="group/id inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent-strong"
    >
      {id}
      {copied ? (
        <Check className="size-3 text-(--success,var(--chart-2))" />
      ) : (
        <Copy className="size-3 opacity-0 transition-opacity group-hover/id:opacity-70" />
      )}
    </button>
  );
}

/** Row action icons: view (→ detail), edit (sheet), remove (rich modal). */
function RowActions({ employee, canManage }: { employee: Employee; canManage: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <ActionIcon
        label="View"
        icon={Eye}
        tone="view"
        onClick={() => router.push(`/employees/${employee.id}`)}
      />
      {canManage ? (
        <>
          <ActionIcon label="Edit" icon={Pencil} tone="edit" onClick={() => setEditOpen(true)} />
          {/* Controlled by the Edit icon above — no trigger element. */}
          <EmployeeFormSheet
            employee={employee as EmployeeDetail}
            open={editOpen}
            onOpenChange={setEditOpen}
            onDelete={() => {
              setEditOpen(false);
              setRemoveOpen(true);
            }}
          />
          <ActionIcon
            label="Remove"
            icon={Trash2}
            tone="delete"
            onClick={() => setRemoveOpen(true)}
          />
          <EmployeeDeleteModal
            employee={employee}
            open={removeOpen}
            onOpenChange={setRemoveOpen}
          />
        </>
      ) : null}
    </div>
  );
}

/** Per-action hover tones: view = light blue, edit = green, delete = red. */
const ACTION_TONES = {
  view: "hover:bg-sky-50 hover:text-sky-600",
  edit: "hover:bg-emerald-50 hover:text-emerald-600",
  delete: "hover:bg-red-50 hover:text-red-600",
  accent: "hover:bg-accent-soft hover:text-accent-strong",
} as const;

function ActionIcon({
  label,
  icon: Icon,
  onClick,
  tone = "accent",
  disabled,
}: {
  label: string;
  icon: typeof Eye;
  onClick?: () => void;
  tone?: keyof typeof ACTION_TONES;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            aria-label={label}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              ACTION_TONES[tone],
            )}
          >
            <Icon className="size-4" />
          </button>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
