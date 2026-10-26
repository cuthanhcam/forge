# Markdown preview: reference review and delivery plan

Reviewed the local `ref/Markdown-Viewer` checkout (Apache-2.0), focusing on
`src/document-toc.mjs`, scroll synchronization in `script.js`, and its rich-content
export preparation. This is an implementation review of the checked-out source,
not a claim that every advertised feature has been verified in a running app.
No reference code has been copied into Forge.

## Findings

- Scroll synchronization remembers the actual rounded/clamped target position
  in a WeakMap and rejects events for an outdated document. Forge already uses
  this pattern, plus ResizeObserver and explicit user-intent tracking. Preserve
  those protections; copying its timeout-based lock would regress our lifecycle.
- Outline headings come from Marked AST tokens, not a Markdown regex. IDs are
  allocated before depth filtering, including collisions such as `a`, `a`, `a-1`.
  Use one document-scoped slugger for both rendered IDs and outline links.
- Export creates a separate render root, waits for diagrams, math, images and
  fonts, removes interactive controls, and cleans up after failure. Forge currently
  captures the live preview and exports HTML from pre-diagram HTML; these paths
  need explicit readiness and error handling before adding more renderers.
- Workspace IndexedDB, recoverable trash, local file import, find/replace and
  document outline are useful directions. Sharing, remote renderer APIs and CDN
  loading are separate architectural choices, not defaults for Forge.

## Small branches, in order

1. `fix/markdown-export-safety`: extract export services, escape document titles,
   remove the hard-coded remote KaTeX stylesheet, prepare a document snapshot and
   report failures. Test hostile titles, edits during capture, delayed Mermaid,
   math, broken images and cancellation/cleanup. Keep source Markdown intact.
2. `feat/markdown-outline`: AST-derived H1-H6 outline with collision-safe IDs,
   empty state, keyboard navigation and a toggle that works on a phone. Navigate
   only the preview scroll owner; never scroll the application shell. Test inline
   formatting, Unicode, duplicate headings, code fences and tab changes. Add
   section-aware editor navigation only after source offsets are reliable.
3. `feat/markdown-find-replace`: document-scoped literal search first, previous/
   next match, replace and replace-all with undo support and clear match counts.
   Test Unicode, newlines, zero matches and caret/selection after replacement.
4. `feat/markdown-diagram-controls`: fit, zoom, reset and local SVG download for
   existing Mermaid diagrams. Keep strict rendering and sanitize downloaded SVG.
   Verify keyboard controls, touch, small screens and asynchronous re-rendering.
5. `feat/workspace-recovery`: evaluate IndexedDB and recoverable deletion with
   versioned migration, quota failure and export/restore coverage before changing
   the current storage contract. Avoid silently migrating or dropping drafts.

Each branch must pass `pnpm check`, relevant desktop/phone browser checks and CI
before integration into develop. Broader Firefox/WebKit coverage remains needed.
Do not bring remote renderers or collaboration into these branches. If reference
code is reused later, review Apache-2.0 attribution/NOTICE requirements first;
Forge's current MIT license alone does not cover copied third-party code.

## Delivery update

Outline and diagram controls are delivered. Forge derives the outline from
sanitized rendered headings (including raw HTML headings), rather than a regex
or source-token-only filter. IDs and local heading links share one collision-safe
allocation. PNG/SVG diagram downloads are complete-diagram exports. Full-document
export readiness and find/replace remain pending.
