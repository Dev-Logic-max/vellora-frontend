import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Pin the workspace root to this standalone project so Turbopack doesn't
  // infer it from an unrelated lockfile elsewhere on the machine.
  turbopack: {
    root: __dirname,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
