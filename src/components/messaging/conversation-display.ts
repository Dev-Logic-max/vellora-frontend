import type { Conversation } from "@/features/messaging/types";

/** Channel → its name; DM → the other member's name (or "Direct message"). */
export function conversationTitle(c: Conversation, meId: string | undefined): string {
  if (c.kind === "channel") return c.name ?? "Channel";
  const other = c.members?.find((m) => m.userId !== meId);
  return other?.user?.name ?? other?.user?.email ?? "Direct message";
}

export function conversationInitial(c: Conversation, meId: string | undefined): string {
  return conversationTitle(c, meId).charAt(0).toUpperCase();
}
