export type DocFolderKind = "company" | "employee";
export type DocumentVisibility = "company" | "role" | "employee";
export type DocumentStatus = "active" | "expiring" | "expired" | "trashed";
export type SignatureStatus = "requested" | "signed" | "declined";

export interface DocFolder {
  id: string;
  parentId: string | null;
  name: string;
  kind: DocFolderKind;
  employeeId: string | null;
  createdAt: string;
}

export interface Signature {
  id: string;
  documentId: string;
  signerId: string;
  status: SignatureStatus;
  signedStorageKey: string | null;
  signedAt: string | null;
  audit: Record<string, unknown>;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  folderId: string | null;
  name: string;
  category: string | null;
  mime: string | null;
  size: number | null;
  visibility: DocumentVisibility;
  employeeId: string | null;
  ownerId: string | null;
  expiresAt: string | null;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  signatures?: Signature[];
}

export interface DocTrashEntry {
  id: string;
  documentId: string;
  storageKey: string;
  purgeAfter: string;
  createdAt: string;
  snapshot: { name?: string } & Record<string, unknown>;
}

export interface SignedUpload {
  url: string;
  storageKey: string;
  token?: string;
}

export interface CreateDocumentInput {
  name: string;
  storageKey: string;
  folderId?: string;
  category?: string;
  mime?: string;
  size?: number;
  visibility?: DocumentVisibility;
  employeeId?: string;
  expiresAt?: string;
}
