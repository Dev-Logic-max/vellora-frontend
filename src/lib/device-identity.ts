"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Per-device identity helpers for attendance device registration (point 21).
 *
 * - The PRIMARY identity is a server-issued `deviceToken`, persisted in
 *   localStorage on this device after registration. The device presents it back
 *   when clocking in.
 * - The SECONDARY identity is a browser fingerprint (FingerprintJS visitorId),
 *   only captured/checked when the company enables fingerprint enforcement.
 */

const DEVICE_TOKEN_KEY = "vellora:device-token";

/** Reads the device token stored on this device, if it has registered before. */
export function readDeviceToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DEVICE_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Persists the server-issued device token after a successful registration. */
export function saveDeviceToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearDeviceToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

let fpPromise: ReturnType<typeof FingerprintJS.load> | null = null;

/** Lazily loads the fingerprint agent (one instance per page). */
function agent() {
  if (!fpPromise) fpPromise = FingerprintJS.load();
  return fpPromise;
}

/**
 * Returns this browser's stable visitorId, or undefined on failure. Only call
 * when the company requires fingerprinting — it's the secondary check.
 */
export async function getFingerprint(): Promise<string | undefined> {
  try {
    const fp = await agent();
    const result = await fp.get();
    return result.visitorId;
  } catch {
    return undefined;
  }
}

/** A short, human-readable platform string for the device label. */
export function describePlatform(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS device";
  if (/Android/i.test(ua)) return "Android device";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux";
  return "Browser";
}
