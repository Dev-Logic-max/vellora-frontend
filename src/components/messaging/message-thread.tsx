"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Message } from "@/features/messaging/types";
import { ReferenceChip } from "./reference-chip";

interface Props {
  messages: Message[];
  isLoading: boolean;
  meId: string | undefined;
}

/** Right pane: bubbles grouped by author; own messages right-aligned (indigo). */
export function MessageThread({ messages, isLoading, meId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-10", i % 2 ? "ml-auto w-1/2" : "w-2/3")} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        No messages yet — say hello.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto p-4">
      {messages.map((m, i) => {
        const mine = m.senderId === meId;
        const prev = messages[i - 1];
        const showAuthor = !mine && (!prev || prev.senderId !== m.senderId);
        return (
          <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
            {showAuthor ? (
              <span className="mt-2 mb-0.5 ml-1 text-xs font-medium text-muted-foreground">
                {m.sender?.name ?? m.sender?.email ?? "Someone"}
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                mine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-surface-subtle text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
            </div>
            {m.ref ? <ReferenceChip refData={m.ref} /> : null}
            <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
              {format(new Date(m.createdAt), "HH:mm")}
            </span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
