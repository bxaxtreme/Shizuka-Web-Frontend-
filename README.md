# Shizuka Frontend

Frontend-only Next.js App Router site for Shizuka, styled in a dark pink theme. It does not connect to or modify the Python bot.

## Run locally

Requirements: Node.js 20.9+ (Node 22 recommended) and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on GitHub Pages

This project is configured for static export and includes `.github/workflows/deploy-pages.yml`.

1. Push the project files directly into the repository root (so `package.json` is at the root).
2. Open the GitHub repository → **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**. Do not select “Deploy from a branch”.
4. Push to `main` or manually run the **Deploy Shizuka frontend to GitHub Pages** workflow in the Actions tab.
5. When the workflow finishes successfully, open `https://bxaxtreme.github.io/Shizuka-Web-Frontend-/`.

The workflow installs dependencies, runs a TypeScript check, builds a static export with the repository base path `/Shizuka-Web-Frontend-`, exports static HTML into `out/`, and deploys that output. GitHub Pages cannot run a Next.js server; it must serve the static export.

## Deploy on Vercel instead

Import this repository at Vercel and use the Next.js preset with `npm run build`. Do not set `GITHUB_PAGES=true` or `NEXT_PUBLIC_BASE_PATH` on Vercel; the default build targets the domain root.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Public links and branding

Edit `src/data/site-config.ts`. Invite and support URLs intentionally remain blank until verified. Set `NEXT_PUBLIC_SITE_URL` to the final public website origin when deploying to Vercel or a custom domain. Set the production Vercel URL before launch; the existing fallback is retained only for backward compatibility. Keep `NEXT_PUBLIC_BASE_PATH` and `GITHUB_PAGES` unset on Vercel. Invite and support links are blank until you add verified public URLs.

## Command catalogue and honest preview data

`src/data/commands.json` was generated from the supplied source archive's command inventory. Review it against the live bot before publishing; source inventory does not guarantee a command is currently enabled. Root/developer commands are excluded from the public catalogue. Server/user totals, uptime, bot status, and track information are placeholders. Premium pricing is unverified and intentionally not fabricated. The dashboard route is a visual demo only.

No backend, authentication, API, database, payment processing, bot token, or private credentials are included. Vercel Analytics and Speed Insights components are present, but data collection must be checked after deployment on Vercel.


## Vercel deployment checklist
1. Import this repository into Vercel and leave `GITHUB_PAGES` unset.
2. Set `NEXT_PUBLIC_SITE_URL` to your actual Vercel production domain.
3. Configure verified Discord invite/support URLs in `src/data/site-config.ts`.
4. Run `npm install`, `npm run typecheck`, `npm run lint`, and `npm run build` locally before deploying.
5. Keep GitHub Pages static-export settings limited to the GitHub Actions workflow.

The website is a frontend preview; dashboard statistics, music playback, invite and support actions require real configured destinations/data sources.


## Zero-configuration hosting
The public website and API shell can be deployed to Vercel without adding API keys or environment variables. Live Discord statistics, bot event ingestion, MongoDB persistence, and Discord OAuth sign-in will remain disabled until their optional integrations are configured. No fake live metrics are displayed. See `README-VERCEL.md` for details. Vercel does not host a persistent Discord gateway or Lavalink process.
