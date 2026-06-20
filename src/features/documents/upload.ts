import { requestUploadUrl } from "./documents";
import type { SignedUpload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

/**
 * Uploads a file's bytes to a signed URL with progress. Supabase signed upload
 * URLs accept a PUT; the local dev stub (server-relative path) is treated as a
 * no-op success so the flow stays testable without live storage.
 */
export function putToSignedUrl(
  upload: SignedUpload,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  // Dev stub: server-relative path → skip the network PUT.
  if (!upload.url.startsWith("http")) {
    onProgress?.(100);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload.url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/** Request a signed URL + upload bytes; returns the storage key to persist. */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ storageKey: string }> {
  const upload = await requestUploadUrl(file.name);
  await putToSignedUrl(upload, file, onProgress);
  return { storageKey: upload.storageKey };
}

export { API_URL as DOCS_API_URL };
