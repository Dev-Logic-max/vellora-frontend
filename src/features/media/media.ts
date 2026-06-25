"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ImageKind =
  | "company-banner"
  | "company-logo"
  | "store-banner"
  | "store-logo"
  | "avatar";

interface UploadUrlResponse {
  url: string;
  storageKey: string;
  token?: string;
  publicUrl: string;
}

/**
 * Two-step public-image upload: ask the backend for a signed upload URL, PUT the
 * file bytes straight to storage, then return the permanent public URL to persist
 * on the entity (e.g. PATCH /companies/:id { bannerUrl }).
 */
export function useImageUpload() {
  return useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: ImageKind }) => {
      const signed = await api.post<UploadUrlResponse>("/api/media/upload-url", {
        filename: file.name,
        kind,
      });
      // The signed URL is a direct-to-storage target — no auth header, raw PUT.
      const res = await fetch(signed.url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status}).`);
      }
      return signed.publicUrl;
    },
  });
}
