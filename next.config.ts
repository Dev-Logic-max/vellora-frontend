import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Pin the workspace root to this standalone project so Turbopack doesn't
  // infer it from an unrelated lockfile elsewhere on the machine.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Keep Turbopack's dev cache IN-MEMORY. The on-disk persistent cache
    // corrupts under this project's location (Windows + Desktop/OneDrive +
    // Defender real-time scan), surfacing as "Another write batch or compaction
    // is already active" and stale `build-manifest.json` ENOENT — which break
    // HMR and force a manual restart. In-memory dev cache fixes both; you lose
    // only cross-restart cache warmth, not correctness.
    turbopackFileSystemCacheForDev: false,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
