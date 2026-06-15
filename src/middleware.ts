import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and any path containing a dot (static files).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
