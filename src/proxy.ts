import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const handleIntl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // next-intl resolves the locale + produces the response, then Supabase
  // refreshes the auth session and rotates cookies onto that same response.
  const response = handleIntl(request);
  return updateSession(request, response);
}

export const config = {
  // Skip API routes, Next internals, and any path containing a dot (static files).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
