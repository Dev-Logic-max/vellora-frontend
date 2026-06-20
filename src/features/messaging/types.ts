export type ConversationKind = "dm" | "channel";
export type RefType = "employee" | "shift" | "leave" | "document" | "candidate" | "store";

export interface UserRef {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

export interface MessageRef {
  type: RefType;
  id: string;
  label?: string;
}

export interface ConversationMember {
  id: string;
  userId: string;
  user?: UserRef | null;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  name: string | null;
  storeId: string | null;
  createdBy: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  members?: ConversationMember[];
  /** Attached by the list endpoint. */
  unread?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  ref: MessageRef | null;
  editedAt: string | null;
  createdAt: string;
  sender?: UserRef | null;
}

export interface CreateConversationInput {
  kind: ConversationKind;
  name?: string;
  storeId?: string;
  memberIds: string[];
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessageAt: string | null;
  createdAt: string;
}

export type EmailStatus = "draft" | "queued" | "sent" | "delivered" | "bounced" | "failed";

export interface EmailMessage {
  id: string;
  threadId: string;
  fromAddr: string;
  toAddrs: string[];
  body: string;
  status: EmailStatus;
  sentAt: string | null;
  createdAt: string;
}

export interface EmailThreadDetail extends EmailThread {
  messages: EmailMessage[];
}

/** Record-reference picker option families (mirrors backend ref types). */
export const REF_TYPE_LABELS: Record<RefType, string> = {
  employee: "Employee",
  shift: "Shift",
  leave: "Leave",
  document: "Document",
  candidate: "Candidate",
  store: "Store",
};

export function refHref(ref: MessageRef): string {
  switch (ref.type) {
    case "employee":
      return `/employees/${ref.id}`;
    case "shift":
      return `/scheduling?shift=${ref.id}`;
    case "leave":
      return `/leave?request=${ref.id}`;
    case "document":
      return `/documents?doc=${ref.id}`;
    case "candidate":
      return `/recruiting/${ref.id}`;
    case "store":
      return `/stores/${ref.id}`;
  }
}
