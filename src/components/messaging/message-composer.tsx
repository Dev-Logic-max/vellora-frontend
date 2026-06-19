"use client";

import { useState, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSendMessage } from "@/features/messaging/messaging";
import type { MessageRef } from "@/features/messaging/types";
import { ReferencePicker, StagedRef } from "./reference-picker";

/** Composer: textarea, reference picker, send on Enter (Shift+Enter = newline). */
export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [body, setBody] = useState("");
  const [ref, setRef] = useState<MessageRef | undefined>();
  const send = useSendMessage(conversationId);

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    send.mutate(
      { body: text, ref },
      {
        onSuccess: () => {
          setBody("");
          setRef(undefined);
        },
      },
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border p-3">
      {ref ? (
        <div className="mb-2">
          <StagedRef refData={ref} onClear={() => setRef(undefined)} />
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <ReferencePicker onPick={setRef} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Write a message…"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button size="icon" onClick={submit} disabled={!body.trim() || send.isPending}>
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
