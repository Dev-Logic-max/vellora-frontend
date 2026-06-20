import { io, type Socket } from "socket.io-client";

import { getActiveCompanyId } from "@/lib/active-company";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

let socket: Socket | null = null;

/**
 * Shared authenticated Socket.IO connection to the backend `/realtime`
 * namespace. The handshake carries the Supabase access token + active company
 * so the server can resolve the same tenant-scoped principal as on HTTP. One
 * socket is reused across notifications + messaging.
 */
export async function getSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;

  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session?.access_token) return null;

  socket?.disconnect();
  socket = io(`${API_URL}/realtime`, {
    transports: ["websocket"],
    auth: {
      token: session.access_token,
      companyId: getActiveCompanyId() ?? undefined,
    },
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
