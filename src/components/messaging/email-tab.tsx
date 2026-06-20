"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Mail, Plus, SendHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { useEmailThread, useEmailThreads, useSendEmail } from "@/features/messaging/messaging";

/** Email tab: thread list + reader pane + composer (to/subject/body). */
export function EmailTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const { data: threads, isLoading } = useEmailThreads();
  const { data: thread } = useEmailThread(selected);

  return (
    <div className="grid h-[calc(100vh-15rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:grid-cols-[20rem_1fr]">
      {/* thread list */}
      <div className="flex flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-sm font-semibold">Email</span>
          <Button
            size="sm"
            onClick={() => {
              setComposing(true);
              setSelected(null);
            }}
          >
            <Plus className="size-4" />
            Compose
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : threads && threads.length > 0 ? (
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t.id);
                  setComposing(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-subtle",
                  selected === t.id && "bg-accent-soft/50",
                )}
              >
                <span className="truncate text-sm font-medium text-foreground">{t.subject}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t.participants.join(", ")}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No email threads.</p>
          )}
        </div>
      </div>

      {/* reader / composer */}
      <div className="flex flex-col">
        {composing ? (
          <Composer onSent={(id) => { setComposing(false); setSelected(id); }} />
        ) : thread ? (
          <div className="flex-1 overflow-y-auto p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">{thread.subject}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{thread.participants.join(", ")}</p>
            <div className="mt-5 space-y-4">
              {thread.messages.map((m) => (
                <div key={m.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {m.fromAddr} → {m.toAddrs.join(", ")}
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusPill status={m.status} />
                      {m.sentAt ? format(new Date(m.sentAt), "MMM d, HH:mm") : ""}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-foreground">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Mail}
            title="Select a thread"
            description="Or compose a new email."
            className="m-auto border-0"
          />
        )}
      </div>
    </div>
  );
}

function Composer({ onSent }: { onSent: (threadId: string) => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const send = useSendEmail();

  const submit = () => {
    const recipients = to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (recipients.length === 0 || !body.trim()) return;
    send.mutate(
      { to: recipients, subject: subject.trim() || undefined, body: body.trim() },
      {
        onSuccess: (msg) => {
          toast.success("Email queued");
          onSent(msg.threadId);
        },
        onError: () => toast.error("Couldn't send the email"),
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-3 p-5">
      <FormField
        id="email-to"
        label="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="name@example.com, …"
      />
      <FormField
        id="email-subject"
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />
      <div className="flex flex-1 flex-col space-y-1.5">
        <label htmlFor="email-body" className="text-[13px] font-medium text-foreground">
          Message
        </label>
        <textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write your email…"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={submit} disabled={send.isPending}>
          <SendHorizontal className="size-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
