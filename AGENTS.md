# Forge agent guide

Forge is a privacy-first React/TypeScript developer toolbox. Core tools should run locally in the browser. Do not introduce network transmission, analytics, or persistence of sensitive user input without explicit approval.

- Tool implementations live under `src`; follow the existing registry, layout, state, and validation patterns.
- Prefer the existing `create:tool` workflow when adding a tool, then run `pnpm check:tools`.
- Preserve keyboard access, responsive behavior, light/dark themes, and actionable validation states.
- Treat rendering and parsing of HTML, Markdown, JWTs, and similar input as untrusted; retain sanitization boundaries.
- Use Node.js 22+ and the pnpm version declared in `package.json`.

Run the narrowest relevant tests while iterating and `pnpm check` before finishing a product-code change. Do not edit `dist`, `.wrangler`, or `node_modules`.
