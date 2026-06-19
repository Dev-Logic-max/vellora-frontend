"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { getSocket } from "@/lib/realtime";
import type {
  Conversation,
  CreateConversationInput,
  EmailMessage,
  EmailThread,
  EmailThreadDetail,
  Message,
  MessageRef,
} from "./types";

const CONVOS_KEY = "conversations";
const MESSAGES_KEY = "messages";
const EMAIL_THREADS_KEY = "email-threads";

// ── conversations ────────────────────────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: [CONVOS_KEY],
    queryFn: () => api.get<Conversation[]>("/api/messaging/conversations"),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      api.post<Conversation>("/api/messaging/conversations", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CONVOS_KEY] }),
  });
}

// ── messages ─────────────────────────────────────────────────────────────────
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: [MESSAGES_KEY, conversationId],
    queryFn: () => api.get<Message[]>(`/api/messaging/conversations/${conversationId}/messages`),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage(conversationId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; ref?: MessageRef }) =>
      api.post<Message>(`/api/messaging/conversations/${conversationId}/messages`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [MESSAGES_KEY, conversationId] });
      void qc.invalidateQueries({ queryKey: [CONVOS_KEY] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      api.post(`/api/messaging/conversations/${conversationId}/read/${messageId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [CONVOS_KEY] }),
  });
}

// ── email ─────────────────────────────────────────────────────────────────────
export function useEmailThreads() {
  return useQuery({
    queryKey: [EMAIL_THREADS_KEY],
    queryFn: () => api.get<EmailThread[]>("/api/messaging/email/threads"),
  });
}

export function useEmailThread(id: string | null) {
  return useQuery({
    queryKey: [EMAIL_THREADS_KEY, id],
    queryFn: () => api.get<EmailThreadDetail>(`/api/messaging/email/threads/${id}`),
    enabled: Boolean(id),
  });
}

export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { threadId?: string; subject?: string; to: string[]; body: string }) =>
      api.post<EmailMessage>("/api/messaging/email/send", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [EMAIL_THREADS_KEY] }),
  });
}

/**
 * Live message subscription for an open conversation: joins the room, appends
 * incoming messages, and refreshes unread badges. Cleans up on switch/unmount.
 */
export function useConversationRealtime(conversationId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    let cleanup: (() => void) | undefined;

    void getSocket().then((socket) => {
      if (!socket || !active) return;
      socket.emit("conversation:join", conversationId);

      const onNew = (msg: Message) => {
        if (msg.conversationId !== conversationId) return;
        qc.setQueryData<Message[]>([MESSAGES_KEY, conversationId], (prev) =>
          prev ? (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]) : [msg],
        );
        void qc.invalidateQueries({ queryKey: [CONVOS_KEY] });
      };
      const onRead = () => void qc.invalidateQueries({ queryKey: [MESSAGES_KEY, conversationId] });

      socket.on("message:new", onNew);
      socket.on("message:read", onRead);
      cleanup = () => {
        socket.emit("conversation:leave", conversationId);
        socket.off("message:new", onNew);
        socket.off("message:read", onRead);
      };
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [conversationId, qc]);
}
