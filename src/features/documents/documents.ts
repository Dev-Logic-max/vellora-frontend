"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  CreateDocumentInput,
  DocFolder,
  DocTrashEntry,
  DocumentItem,
  DocumentStatus,
  SignedUpload,
  Signature,
} from "./types";

const DOCS_KEY = "documents";
const FOLDERS_KEY = "doc-folders";
const TRASH_KEY = "doc-trash";

function toQuery(q: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

// ── folders ──────────────────────────────────────────────────────────────────
export function useDocFolders() {
  return useQuery({
    queryKey: [FOLDERS_KEY],
    queryFn: () => api.get<DocFolder[]>("/api/documents/folders"),
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; parentId?: string }) =>
      api.post<DocFolder>("/api/documents/folders", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [FOLDERS_KEY] }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/documents/folders/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [FOLDERS_KEY] }),
  });
}

// ── documents ─────────────────────────────────────────────────────────────────
export function useDocuments(filters: {
  folderId?: string;
  employeeId?: string;
  status?: DocumentStatus;
  q?: string;
} = {}) {
  return useQuery({
    queryKey: [DOCS_KEY, filters],
    queryFn: () =>
      api.get<DocumentItem[]>(
        `/api/documents${toQuery({
          folderId: filters.folderId,
          employeeId: filters.employeeId,
          status: filters.status,
          q: filters.q,
        })}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Step 1: ask the backend for a short-lived signed upload URL (never public). */
export function requestUploadUrl(filename: string) {
  return api.post<SignedUpload>("/api/documents/upload-url", { filename });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => api.post<DocumentItem>("/api/documents", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DOCS_KEY] }),
  });
}

export function useBulkCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      folderId?: string;
      category?: string;
      files: { name: string; storageKey: string; mime?: string; size?: number }[];
    }) => api.post<DocumentItem[]>("/api/documents/bulk", input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DOCS_KEY] }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<CreateDocumentInput>) =>
      api.patch<DocumentItem>(`/api/documents/${id}`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DOCS_KEY] }),
  });
}

export function useSoftDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/documents/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [DOCS_KEY] });
      void qc.invalidateQueries({ queryKey: [TRASH_KEY] });
    },
  });
}

/** Resolve a one-shot signed download URL, then open it. */
export async function openDocument(id: string) {
  const { url } = await api.get<{ url: string }>(`/api/documents/${id}/url`);
  // Stub URLs are server-relative; absolute signed URLs open directly.
  const href = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030"}${url}`;
  window.open(href, "_blank", "noopener");
}

// ── e-sign ────────────────────────────────────────────────────────────────────
export function useRequestSignatures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, signerIds }: { documentId: string; signerIds: string[] }) =>
      api.post<Signature[]>(`/api/documents/${documentId}/signatures`, { signerIds }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DOCS_KEY] }),
  });
}

export function useSign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      signatureId,
      method,
      value,
    }: {
      signatureId: string;
      method: "typed" | "drawn";
      value: string;
    }) =>
      api.post<Signature>(`/api/documents/signatures/${signatureId}/sign`, {
        method,
        value,
        consent: true,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [DOCS_KEY] }),
  });
}

// ── trash ──────────────────────────────────────────────────────────────────────
export function useTrash() {
  return useQuery({
    queryKey: [TRASH_KEY],
    queryFn: () => api.get<DocTrashEntry[]>("/api/documents/trash"),
  });
}

export function useRestore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/documents/trash/${id}/restore`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [TRASH_KEY] });
      void qc.invalidateQueries({ queryKey: [DOCS_KEY] });
    },
  });
}

export function usePurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/documents/trash/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [TRASH_KEY] }),
  });
}
