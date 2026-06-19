"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/features/employees/employees";
import { useCreateConversation } from "@/features/messaging/messaging";

/** New DM (pick a colleague) or channel (name + members). */
export function NewConversationModal({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"dm" | "channel">("dm");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState<string | undefined>();
  const create = useCreateConversation();

  const { data: page } = useEmployees({ pageSize: 200 });
  // Only colleagues with a linked user account can be messaged.
  const options = useMemo(
    () =>
      (page?.data ?? [])
        .filter((e) => e.userId)
        .map((e) => ({ value: e.userId as string, label: `${e.firstName} ${e.lastName}` })),
    [page],
  );

  const submit = () => {
    if (kind === "channel" && !name.trim()) return;
    if (kind === "dm" && !memberId) return;
    create.mutate(
      {
        kind,
        name: kind === "channel" ? name.trim() : undefined,
        memberIds: kind === "dm" ? [memberId as string] : [],
      },
      {
        onSuccess: (convo) => {
          setOpen(false);
          setName("");
          setMemberId(undefined);
          onCreated(convo.id);
        },
        onError: () => toast.error("Couldn't create the conversation"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" />
            New
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
        </DialogHeader>

        <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-sm">
          {(["dm", "channel"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "rounded-md px-3 py-1 transition-colors",
                kind === k ? "bg-accent-soft text-accent-strong" : "text-muted-foreground",
              )}
            >
              {k === "dm" ? "Direct" : "Channel"}
            </button>
          ))}
        </div>

        {kind === "channel" ? (
          <FormField
            id="channel-name"
            label="Channel name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. store-leads"
          />
        ) : (
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-foreground">To</span>
            <Combobox
              options={options}
              value={memberId}
              onChange={setMemberId}
              placeholder="Pick a colleague…"
              emptyText="No messageable colleagues"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
