# Deployment Notes

Forge is a static Vite application.

## Build

```bash
pnpm install
pnpm build
```

The production output is written to `dist/`.

## Static Hosting

Forge can be hosted on static platforms such as Cloudflare Pages, Netlify,
Vercel, GitHub Pages, Azure Static Web Apps, or any web server that can serve
the built files.

## SPA Fallback

Forge uses client-side routing. Configure your host so unknown paths fall back
to `index.html`.

This is required for routes such as:

- `/tools/json-formatter`
- `/tools/jwt-decoder`
- `/privacy`
- `/terms`

## Environment Variables

Client-exposed values use the `VITE_` prefix and are included in the client bundle;
never place a credential there. The current `.env.example` contains documentation
placeholders. `VITE_APP_NAME` and `VITE_APP_URL` are not consumed by application
code and do not configure runtime branding or routing.

Public project destinations live in `src/core/config/project-links.ts`. Review
those destinations for a fork, especially the canonical hosted issue-support
link. Internal tool routes remain relative to the deployed origin.

## Cloudflare Pages

Recommended defaults:

- Build command: `pnpm build`
- Output directory: `dist`
- Node.js version: 22 or newer
- Package manager: pnpm 10 or newer

The current Vite configuration includes the Cloudflare plugin. Wrangler sets
`assets.not_found_handling` to `single-page-application` in `wrangler.jsonc`.
There is no committed `public/_redirects` file. For a separate Pages deployment,
configure a SPA fallback explicitly and verify a direct tool URL after deployment.

Use `pnpm preview` to build and serve the Cloudflare output locally, and
`pnpm deploy` for an authorized deployment. Inspect the generated output before
adapting this project to another static host; the Cloudflare integration affects
the output layout.
