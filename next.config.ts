import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/Shizuka-Web-Frontend-" : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages ? { output: "export" as const } : {}),
  ...(isGitHubPages ? { trailingSlash: true } : {}),
  poweredByHeader: false,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
