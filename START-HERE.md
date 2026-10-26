# Start here

Forge is a browser developer toolbox. Try the
[hosted workspace](https://forge.cuthanhcam.workers.dev) or run a local copy for
trusted development. Use synthetic data while learning the tools.

## Your first workflow

1. Open Markdown Preview from the sidebar or Ctrl/Cmd+K search.
2. Paste a short document with headings. Open Outline and jump to a section.
3. Drag the pane divider or choose Editor, Split or Preview. Tabs and Outline
   visibility are remembered in this browser.
4. Try Open Guide for Markdown, Mermaid and math examples. Expand a diagram for
   pan/zoom and PNG/SVG export. Export important drafts before clearing site data.

For JWT work, read [Tokens and safety](docs/security-and-tokens.md) first.

## Local setup

Install Node.js 22+ and pnpm 10.12.1, then:

```sh
git clone https://github.com/cuthanhcam/forge.git
cd forge
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use the URL Vite prints rather than assuming a fixed port. If Corepack is not
installed with your Node distribution, install the pinned pnpm version through
your package-manager setup. No API token or `.env` is required for core tools.
The example environment file documents placeholders; it does not configure
runtime application URLs or change labels automatically.

## Verify a change

```sh
pnpm check:tools
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser suite starts Vite on port 4173. Stop an unrelated server on that
port before testing. On Linux, install browser dependencies with
`pnpm exec playwright install --with-deps chromium`.

`pnpm preview` builds and serves the Cloudflare production output. The Cloudflare
plugin affects build layout; see [deployment](docs/deployment.md) for another host.
Never put a secret in a client-exposed `VITE_` variable.

## Find the right next step

- Product help: [Tool guide](docs/tools.md), [settings](docs/workspace.md).
- First contribution: [Contributing](CONTRIBUTING.md), [architecture](docs/development/architecture.md).
- Known gaps and planned work: [Roadmap](docs/development/roadmap.md).
- Bug reports: [Support](docs/support.md); vulnerabilities: [Security policy](SECURITY.md).
