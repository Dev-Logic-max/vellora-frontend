"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { api, ApiError } from "@/lib/api";
import { useCreateConversation } from "@/features/messaging/messaging";
import type { Conversation, Message } from "@/features/messaging/types";
import type { EmployeeDetail } from "@/features/employees/types";

/**
 * Compose a direct message to an employee (P10). Opens a DM conversation with
 * the employee's linked portal user and posts the message. If the employee has
 * no portal account yet, it explains that messaging needs an invite first.
 */
export function EmployeeMessageModal({
  employee,
  open,
  onOpenChange,
}: {
  employee: EmployeeDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createConversation = useCreateConversation();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const name = `${employee.firstName} ${employee.lastName}`.trim();
  const linked = Boolean(employee.userId);

  const send = async () => {
    if (!employee.userId || !body.trim()) return;
    setBusy(true);
    try {
      const convo = await createConversation.mutateAsync({
        kind: "dm",
        memberIds: [employee.userId],
      } as Parameters<typeof createConversation.mutateAsync>[0]);
      await api.post<Message>(`/api/messaging/conversations/${(convo as Conversation).id}/messages`, {
        body: body.trim(),
      });
      toast.success(`Message sent to ${employee.firstName}`);
      setBody("");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't send the message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="flex items-start gap-3 border-b border-border bg-linear-to-br from-accent-soft via-surface to-surface px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
            <MessageSquare className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">New message</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Send a direct message.</p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-subtle/50 p-3">
            <EntityAvatar name={name} src={employee.avatarUrl} className="size-10 rounded-full" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {employee.companyEmail || employee.email || employee.uniqueCode}
              </p>
            </div>
          </div>

          {linked ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              autoFocus
              placeholder={`Write to ${employee.firstName}…`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-surface-subtle/60 px-4 py-6 text-center text-sm text-muted-foreground">
              {employee.firstName} doesn&apos;t have a portal account yet. Invite them first to send
              messages.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/60 px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={send} disabled={!linked || !body.trim() || busy}>
            <Send />
            {busy ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
