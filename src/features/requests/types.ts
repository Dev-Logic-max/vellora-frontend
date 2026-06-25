export type PlatformRequestType =
  | "company_deletion"
  | "report"
  | "query"
  | "support"
  | "feature"
  | "billing";

export type PlatformRequestPriority = "low" | "medium" | "high" | "urgent";

export type PlatformRequestStatus =
  | "received"
  | "in_review"
  | "replied"
  | "resolved"
  | "rejected";

export type PlatformRequestActionStatus = "waiting" | "read" | "responded" | "closed";

export interface PlatformRequest {
  id: string;
  companyId: string;
  type: PlatformRequestType;
  module: string | null;
  priority: PlatformRequestPriority;
  subject: string;
  message: string | null;
  status: PlatformRequestStatus;
  actionStatus: PlatformRequestActionStatus;
  requestedBy: string | null;
  handledBy: string | null;
  response: string | null;
  meta: Record<string, unknown>;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin list rows join the company + requester names. */
export interface AdminPlatformRequest extends PlatformRequest {
  companyName: string | null;
  requesterName: string | null;
}

export interface CreateRequestInput {
  type: Exclude<PlatformRequestType, "company_deletion">;
  module?: string;
  priority?: PlatformRequestPriority;
  subject: string;
  message?: string;
}
