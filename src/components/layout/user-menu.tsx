"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { EntityAvatar } from "@/components/ui/entity-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";
import { setActiveCompanyId } from "@/lib/active-company";
import type { CurrentUser } from "@/features/session/types";

export function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    setActiveCompanyId(null);
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        }
      >
        <EntityAvatar name={user.name ?? user.email} ring />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{user.name ?? "Account"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserRound />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
