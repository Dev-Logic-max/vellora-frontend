"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/features/session/use-current-user";
import {
  useConversationRealtime,
  useConversations,
  useMarkConversationRead,
  useMessages,
} from "@/features/messaging/messaging";
import { ConversationList } from "./conversation-list";
import { conversationTitle } from "./conversation-display";
import { EmailTab } from "./email-tab";
import { MessageComposer } from "./message-composer";
import { MessageThread } from "./message-thread";
import { NewConversationModal } from "./new-conversation-modal";

export function MessagingView() {
  const { data: me } = useCurrentUser();
  const [tab, setTab] = useState("messages");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: conversations, isLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(selected);
  const markRead = useMarkConversationRead();
  useConversationRealtime(selected);

  const selectedConvo = conversations?.find((c) => c.id === selected);

  // Mark the conversation read whenever its latest message changes.
  useEffect(() => {
    if (!selected || !messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    markRead.mutate({ conversationId: selected, messageId: last.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, messages?.length]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList variant="line" className="w-max">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="pt-2">
          <div className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:grid-cols-[20rem_1fr]">
            {/* list pane (hidden on mobile when a thread is open) */}
            <div
              className={cn(
                "flex flex-col border-r border-border",
                selected && "hidden md:flex",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-sm font-semibold">Conversations</span>
                <NewConversationModal onCreated={setSelected} />
              </div>
              <ConversationList
                conversations={conversations ?? []}
                isLoading={isLoading}
                selectedId={selected}
                meId={me?.userId}
                onSelect={setSelected}
              />
            </div>

            {/* thread pane */}
            <div className={cn("flex flex-col", !selected && "hidden md:flex")}>
              {selectedConvo ? (
                <>
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <button
                      type="button"
                      className="text-sm text-accent-strong md:hidden"
                      onClick={() => setSelected(null)}
                    >
                      ← Back
                    </button>
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      {conversationTitle(selectedConvo, me?.userId)}
                    </h2>
                  </div>
                  <MessageThread
                    messages={messages ?? []}
                    isLoading={messagesLoading}
                    meId={me?.userId}
                  />
                  <MessageComposer conversationId={selectedConvo.id} />
                </>
              ) : (
                <EmptyState
                  icon={MessagesSquare}
                  title="Your messages"
                  description="Pick a conversation or start a new one."
                  className="m-auto border-0"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="pt-2">
          <EmailTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
