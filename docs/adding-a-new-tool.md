# Adding a tool

The `pnpm create:tool <tool-id>` command currently prints guidance; it does not
create source files. Follow a neighboring feature and this checklist.

1. Add a focused folder under `src/features/<tool-id>` with a page, pure service,
   schema where needed, and index export. Existing tools include historical folder
   aliases; preserve those rather than renaming them during a feature change.
2. Register the ID, name, category, description, keywords, icon, route, availability,
   features, persistence decision and loadingLayout in
   `src/core/registry/tool.registry.ts`. Routes use `/tools/<tool-id>`.
3. Add the lazy page import to the toolPages map in
   `src/pages/tools/ToolPlaceholderPage.tsx`. A feature's code stays out of the
   initial app module graph until opened.
4. Choose a loading layout from ToolLoadingLayout: markdown, preview, diff, data,
   jwt, generator, transform, timestamp or regex. Reuse an existing layout when the
   workspace shape matches; add a shared variant only for a substantially different
   structure. Never copy a skeleton into a feature or render example secrets as
   loading placeholders.
5. Keep input processing local. Review persistence explicitly for sensitive input;
   JWT tokens, signing secrets and generated credentials must not be added to saved
   drafts by default. Follow existing storage/schema boundaries.
6. Add meaningful service and browser coverage for validation, input retention,
   keyboard access, both themes and narrow layouts. The loading browser matrix
   iterates available registry entries and verifies every lazy tool can finish loading.

Run `pnpm check:tools`, `pnpm check` and relevant `pnpm test:e2e` cases before
integrating a small branch into develop. The registry command checks IDs, routes,
names, categories and loading-layout metadata; it does not claim to prove every
feature's behavior. Read [Contributing](../CONTRIBUTING.md) and
[architecture](development/architecture.md) for ownership and review conventions.
