# Shizuka deployment fix

- Vercel uses the normal Next.js build (no static-export mode).
- GitHub Pages static export is enabled only when `GITHUB_PAGES=true`.
- `robots.ts` is explicitly static for static export compatibility.
- ESLint config imports use explicit `.js` extensions for Node ESM compatibility.

For Vercel: use the Next.js framework preset and `npm run build`. Do not set `GITHUB_PAGES`.
For GitHub Pages Actions: set `GITHUB_PAGES=true` for the build step.
