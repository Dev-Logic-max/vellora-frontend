export type NotifPriority = "low" | "normal" | "high" | "urgent";
export type DigestFreq = "off" | "daily" | "weekly";

export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  category: string;
  type: string;
  priority: NotifPriority;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotifPreference {
  id: string;
  category: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  digest: DigestFreq;
}

export interface NotifPreferenceInput {
  category: string;
  inApp?: boolean;
  email?: boolean;
  push?: boolean;
  digest?: DigestFreq;
}

/** Categories surfaced in the preferences matrix (11-notifications §6). */
export const NOTIF_CATEGORIES = [
  "scheduling",
  "attendance",
  "leave",
  "documents",
  "messaging",
  "onboarding",
  "system",
] as const;
export type NotifCategory = (typeof NOTIF_CATEGORIES)[number];
