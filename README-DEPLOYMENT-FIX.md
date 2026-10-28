# Vercel build fixes

This update addresses the reported Next.js 15 build failures:

- Keeps ESLint 9 flat-config compatibility through `FlatCompat` and the Next.js Core Web Vitals / TypeScript presets.
- Reworks the custom 404 page to use a plain home anchor, avoiding an unnecessary client navigation boundary during prerendering.
- Keeps `robots.ts` as a static metadata route for static export compatibility.
- Keeps GitHub Pages static export opt-in through `GITHUB_PAGES=true`; ordinary Vercel builds use the default Next.js deployment mode.
- Corrects the GitHub Pages repository path to `Shizuka-Web-Frontend-`.

Before publishing, set verified invite/support URLs and the correct production `NEXT_PUBLIC_SITE_URL` in the Vercel project environment. Premium prices remain marked unverified rather than being guessed.

**Validation status:** the ZIP archive integrity was checked. A full dependency install and production build could not be completed in this environment, so run `npm install`, `npm run lint`, `npm run typecheck`, and `npm run build` before treating the deployment as verified.


## Build-safety notes (latest audit)
- The custom 404 page uses a plain same-origin anchor and no server-passed event handlers.
- The ESLint flat config uses `FlatCompat` to adapt `next/core-web-vitals` and `next/typescript`; do not spread the legacy config import directly (that caused `nextVitals is not iterable`).
- Keep `GITHUB_PAGES=true` only in the GitHub Pages workflow. Do not set it in Vercel, because Vercel should use normal Next.js output rather than static `out/` export.
- In Vercel Project Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to the exact production URL for correct metadata, sitemap and robots output.
- Add verified `inviteUrl` and `supportUrl` values in `src/data/site-config.ts` before publishing the CTA buttons.
- Motion is intentionally restrained and the stylesheet includes `prefers-reduced-motion` support.

## Verification status
The JSON data files and category counts were checked locally (178 command records, 16 categories, counts match). A full `npm install` could not complete in this execution environment, so a production build could not be run here. Run `npm ci` (if a lockfile exists) or `npm install`, then `npm run typecheck`, `npm run lint`, and `npm run build` before deployment.
