# Architecture and ownership boundaries

- `src/app`: startup, routing, providers and global styles.
- `src/layouts`: application, document and tool shells; owns viewport sizing.
- `src/core`: registry, search, theme, storage and workspace state.
- `src/features/<tool>`: page, schema, pure transformation service and service tests.
- `src/shared`: reusable primitives and tool surfaces, without feature imports.
- `src/widgets`: navigation, editor integration and product-level controls.
- `src/pages`: home, docs, settings, legal and fallback routes.
- `scripts`: tool scaffolding and registry validation.
- `tests`: app integration tests and shared setup; keep feature tests colocated.
- `docs`: user docs; `docs/development` contains contributor decisions and backlog.

A route resolves registry metadata and a lazy tool module. Tool pages own
interaction state; services own transformations; schemas validate persisted data.
Storage is browser-local and configurable. Inspect the storage hook before
adding drafts, especially for secrets. Never add input telemetry by default.

Markdown passes through DOMPurify; Mermaid uses strict mode. HTML executes in
an iframe and needs a sandbox without same-origin privileges. Resource URLs in
user documents can still request external content; local processing is not an
air-gap guarantee. Keep rendering restrictions explicit and test them.

Keep the current feature folders. A broad rename adds churn without fixing the
preview defects. Extract shared preview controls only after both previews agree
on behavior. Split the large Markdown page into tab, export and scrolling
modules in a dedicated refactor with behavior coverage first. Global dark-mode
selector overrides should gradually give way to semantic component tokens.
