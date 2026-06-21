"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Download, Plus, Upload, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTableShell, type DataTableColumnMeta } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleTag } from "@/components/ui/role-tag";
import { StatusPill } from "@/components/ui/status-pill";
import type { FilterValues } from "@/components/ui/filter-modal";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
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
        header: "Employee",
        accessorKey: "lastName",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex items-center gap-3">
              <EmployeeAvatar firstName={e.firstName} lastName={e.lastName} avatarUrl={e.avatarUrl} />
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
        header: "ID",
        accessorKey: "uniqueCode",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.uniqueCode}</span>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ row }) =>
          row.original.role ? <RoleTag role={row.original.role as MembershipRole} /> : "—",
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
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: "open",
        header: "",
        meta: { isActions: true } satisfies DataTableColumnMeta,
        cell: () => (
          <span className="inline-flex justify-end text-muted-foreground">
            <ChevronRight className="size-4" />
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
