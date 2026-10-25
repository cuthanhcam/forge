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

Client-exposed values should use the `VITE_` prefix.

Example:

```env
VITE_APP_NAME=Forge
VITE_APP_URL=https://your-forge-domain.example
```

The app should avoid hardcoding temporary deployment domains. Put deployment
URLs in environment files or host configuration instead.

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
