const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteConfig = {
  name: "Shizuka",
  tagline: "One Bot. Infinite Possibilities.",
  // Keep this aligned with the actual bot prefix before publishing the command catalogue.
  prefix: "&",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bxaxtreme.github.io/Shizuka-Web-Fontend/",
  logo: `${basePath}/logo.jpg`,
  inviteUrl: "",
  supportUrl: "",
  docsUrl: "",
  invitePlaceholder: "Add your verified Discord invite URL in src/data/site-config.ts",
  supportPlaceholder: "Add your verified support server URL in src/data/site-config.ts",
} as const;
