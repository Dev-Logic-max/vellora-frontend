"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Download, Plus, Upload, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import type { FilterValues } from "@/components/ui/filter-modal";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
import { ImportEmployeesDialog } from "@/components/employees/import-employees-dialog";
import { useRouter } from "@/i18n/navigation";
import { useStores } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";
import { downloadEmployeesCsv, useEmployees } from "@/features/employees/employees";
import { EMPLOYEE_STATUS_OPTIONS } from "@/features/employees/constants";
import type { Employee, EmployeeStatus } from "@/features/employees/types";
import type { MembershipRole } from "@/features/session/types";

const PAGE_SIZE = 25;

export function EmployeesList() {
  const router = useRouter();
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
              <EntityAvatar
                name={`${e.firstName} ${e.lastName}`}
                src={e.avatarUrl}
                className="size-9 rounded-lg"
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
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.uniqueCode}</span>
        ),
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
        id: "open",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: () => (
          <span className="inline-flex items-center gap-1 rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong transition-colors group-hover:bg-accent group-hover:text-(--accent-foreground,white)">
            Details
            <ChevronRight className="size-3.5" />
          </span>
        ),
      },
    ],
    [storeName],
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
                <Button variant="outline" onClick={() => void downloadEmployeesCsv()}>
                  <Download />
                  Export
                </Button>
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
          onRowClick={(e) => router.push(`/employees/${e.id}`)}
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
