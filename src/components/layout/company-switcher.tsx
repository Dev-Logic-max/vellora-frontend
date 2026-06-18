"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { setActiveCompanyId } from "@/lib/active-company";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/features/session/types";

interface Company {
  id: string;
  name: string;
}

const roleLabel = (role: string) => role.replace(/_/g, " ");

export function CompanySwitcher({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company", "current", user.companyId],
    queryFn: () => api.get<Company>("/api/companies/current"),
    enabled: Boolean(user.companyId),
    retry: false,
  });

  if (!user.companyId) return null;

  const label = company?.name ?? "Company";
  const multi = user.memberships.length > 1;

  const trigger = (
    <span className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
        <Building2 className="size-3.5" />
      </span>
      <span className="max-w-[12rem] truncate text-sm font-medium text-foreground">{label}</span>
      {multi && <ChevronsUpDown className="size-3.5 text-muted-foreground" />}
    </span>
  );

  if (!multi) {
    return <div className="flex items-center rounded-lg px-2 py-1.5">{trigger}</div>;
  }

  const select = (companyId: string) => {
    if (companyId === user.companyId) return;
    setActiveCompanyId(companyId);
    void queryClient.invalidateQueries();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        }
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Switch company</DropdownMenuLabel>
        {user.memberships.map((membership) => {
          const active = membership.companyId === user.companyId;
          return (
            <DropdownMenuItem key={membership.companyId} onClick={() => select(membership.companyId)}>
              <Building2 />
              <span className={cn("flex-1 capitalize", active && "font-medium text-foreground")}>
                {roleLabel(membership.role)}
              </span>
              {active && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
