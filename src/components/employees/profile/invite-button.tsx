"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInviteEmployee } from "@/features/employees/employees";

export function InviteButton({ employeeId, email }: { employeeId: string; email: string | null }) {
  const [done, setDone] = useState(false);
  const invite = useInviteEmployee(employeeId);

  const onClick = async () => {
    await invite.mutateAsync(undefined);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={!email || invite.isPending}
      onClick={() => void onClick()}
    >
      {done ? <Check /> : <Send />}
      {done ? "Invite sent" : invite.isPending ? "Sending…" : "Send invite"}
    </Button>
  );
}
