"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Download, Plus, Search, Upload, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { StatusPill } from "@/components/ui/status-pill";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
import { ImportEmployeesDialog } from "@/components/employees/import-employees-dialog";
import { useRouter } from "@/i18n/navigation";
import { useStores } from "@/features/org/stores";
import { useCurrentUser } from "@/features/session/use-current-user";
import { downloadEmployeesCsv, useEmployees } from "@/features/employees/employees";
import { EMPLOYEE_STATUS_OPTIONS } from "@/features/employees/constants";
import type { Employee, EmployeeStatus } from "@/features/employees/types";

const PAGE_SIZE = 25;

export function EmployeesList() {
  const router = useRouter();
  const { data: me } = useCurrentUser();
  const { data: stores } = useStores();

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [storeId, setStoreId] = useState<string | undefined>();
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [page, setPage] = useState(1);

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
    status: status || undefined,
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
              <EmployeeAvatar
                firstName={e.firstName}
                lastName={e.lastName}
                avatarUrl={e.avatarUrl}
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
        header: "ID",
        accessorKey: "uniqueCode",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.uniqueCode}</span>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ row }) => row.original.role ?? "—",
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
        cell: () => <ChevronRight className="size-4 text-muted-foreground" />,
      },
    ],
    [storeName],
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const storeOptions =
    stores?.map((s) => ({ value: s.id, label: s.name, hint: s.code ?? undefined })) ?? [];

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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or ID…"
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Combobox
          className="sm:w-56"
          options={storeOptions}
          value={storeId}
          onChange={(v) => {
            setStoreId(v);
            setPage(1);
          }}
          placeholder="All stores"
        />
        <SelectField
          id="status-filter"
          className="sm:w-44"
          placeholder="All statuses"
          options={EMPLOYEE_STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as EmployeeStatus | "");
            setPage(1);
          }}
        />
        <span className="inline-flex h-9 items-center rounded-lg bg-muted px-3 text-sm font-medium text-muted-foreground tabular-nums">
          {total} total
        </span>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load employees.</p>
      ) : (
        <DataTableShell
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(e) => router.push(`/employees/${e.id}`)}
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

      {/* Pagination */}
      {total > PAGE_SIZE ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
