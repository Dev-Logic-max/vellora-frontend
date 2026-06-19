"use client";

import { useState } from "react";
import { Hash, Search, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/features/messaging/types";
import { conversationTitle } from "./conversation-display";

interface Props {
  conversations: Conversation[];
  isLoading: boolean;
  selectedId: string | null;
  meId: string | undefined;
  onSelect: (id: string) => void;
}

/** Left pane: searchable list of DMs + channels with unread badges. */
export function ConversationList({ conversations, isLoading, selectedId, meId, onSelect }: Props) {
  const [q, setQ] = useState("");
  const filtered = conversations.filter((c) =>
    conversationTitle(c, meId).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="relative p-3">
        <Search className="absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search conversations…"
          className="h-9 pl-9"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          filtered.map((c) => {
            const title = conversationTitle(c, meId);
            const Icon = c.kind === "channel" ? Hash : User;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-subtle",
                  selectedId === c.id && "bg-accent-soft/50",
                )}
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm",
                      c.unread ? "font-semibold text-foreground" : "text-foreground",
                    )}
                  >
                    {title}
                  </span>
                </span>
                {c.unread ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent-strong px-1.5 text-[11px] font-semibold text-white">
                    {c.unread}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
