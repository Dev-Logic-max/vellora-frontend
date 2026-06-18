import { createClient } from "@/lib/supabase/client";

/** Thin wrappers over Supabase Auth used by the (auth) routes + user menu. */

export function signInWithPassword(email: string, password: string) {
  return createClient().auth.signInWithPassword({ email, password });
}

export function signUp(params: {
  email: string;
  password: string;
  data?: Record<string, unknown>;
  emailRedirectTo?: string;
}) {
  const { email, password, data, emailRedirectTo } = params;
  return createClient().auth.signUp({
    email,
    password,
    options: { data, emailRedirectTo },
  });
}

export function signOut() {
  return createClient().auth.signOut();
}

export function resetPasswordForEmail(email: string, redirectTo: string) {
  return createClient().auth.resetPasswordForEmail(email, { redirectTo });
}

export function updatePassword(password: string) {
  return createClient().auth.updateUser({ password });
}

export async function getSession() {
  const { data } = await createClient().auth.getSession();
  return data.session;
}
