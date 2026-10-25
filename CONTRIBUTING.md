# Contributing to Forge

Use Node.js 22+ and pnpm 10.12.1 (pinned in package.json).

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. Run `pnpm check:tools` and `pnpm check`
before pushing. `pnpm preview` builds and serves the Cloudflare production output.
No credentials are required for core tool development.

Preview layout/scroll changes also require real-browser tests:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

The suite starts Vite on port 4173 and runs isolated desktop and phone Chromium
contexts. On Linux CI, install browser system dependencies with
`pnpm exec playwright install --with-deps chromium`. Failure traces/screenshots
are written to ignored `test-results/` and `playwright-report/` directories and
uploaded by the Browser previews CI job. Use `pnpm exec playwright show-report`
to inspect the report.

## Find your first change

Read [architecture](docs/development/architecture.md), then the
[roadmap](docs/development/roadmap.md). Start with a bounded bug and include
steps to reproduce. Use `pnpm create:tool` for a new tool, then
`pnpm check:tools`; follow a neighboring feature's schema/service/page pattern.

## Branch and review workflow

Branch from current `develop`: `fix/<scope>`, `feat/<scope>`, or `chore/<scope>`.
Keep one independently reviewable concern per branch. Open a PR into `develop`
with behavior, validation, screenshots for visual changes, and known limitations.
After integration, rerun the quality gate on `develop`, push it, and open a
release PR from `develop` into `main`. Do not force-push shared branches.
Main releases should pass required CI and a browser smoke check first.
Repository administrators must configure branch protection in GitHub; workflow
files alone do not prevent direct pushes.

## Quality expectations

Preserve keyboard navigation, both themes, input validation and local processing.
Test logic at service boundaries; test user interactions where behavior changes.
Browser layout and scroll bugs need real-browser verification, since jsdom has
no layout engine. Check narrow phones, tablets, laptops, short viewports and zoom.
Explain non-obvious constraints in comments; avoid comments that repeat code.
Do not commit generated output, secrets or real user input. Follow AGENTS.md
and SECURITY.md for rendering boundaries and vulnerability reporting.
