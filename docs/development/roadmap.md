# Forge completion and UI/UX roadmap

Audit date: 2026-10-25. The initial source audit is retained below, followed by
work completed and remaining acceptance coverage. Browser results currently
cover Chromium desktop and phone emulation.

## Markdown reliability milestone (2026-10-25)

Delivered on small, stacked branches: `test/preview-browser-regressions`,
`fix/markdown-draft-scroll`, `fix/markdown-storage-resilience` and
`fix/markdown-mermaid-lifecycle`, followed by `fix/markdown-guide-preservation`.
Review each branch against its preceding branch.

- Chromium desktop/phone tests and Browser previews CI with failure artifacts.
- Removed content-based Welcome migration that could overwrite pasted text.
- Native Markdown editor, deferred preview parsing and position-based suppression
  of programmatic scroll events, with resize-aware progress restoration.
- Debounced Markdown draft writes, navigation flush and visible storage failures
  while keeping the in-memory draft editable.
- Preview renderer owns its DOM and cancels stale Mermaid work. Explicit SVG
  rendering survives layout changes; syntax errors appear at the diagram.
- Strict Mermaid security, sanitized SVG and theme-aware text labels.

Browser coverage includes long content, end-of-document scrolling in both panes,
reload, storage quota failure, rapid diagram edits, guide flow/sequence diagrams,
layout switching, resize and dark theme. Chromium emulation does not replace
physical iOS/Android or Firefox/WebKit verification. The remaining sequence below
is backlog, not a claim that the full UI redesign has shipped.

## Line-number follow-up

`fix/preview-editor-line-numbers` restores a shared gutter for Markdown and HTML
without bringing back the old overlaid text renderer. It measures native content
width excluding scrollbars and matches the editor typography, wrapping and tabs.
The gutter scrolls directly from textarea events without page state updates.
Browser tests compare logical-line offsets against a native textarea, including
blank/trailing lines, Unicode, tabs, long unbroken text, wrap off, resize and dark
mode. Syntax highlighting remains separate from this change.

## Initial audit findings

The sandbox, viewport, HTML overlay, CI, contributor docs and metadata items in
this table were delivered in the foundation changes. Markdown resize/lifecycle
work is delivered in the milestone above. Remaining gaps are source mapping
(optional), formatter preservation, exports, design tokens and broader browser
coverage.

| Priority | Evidence / impact                                                                                  | Delivery                                                                       |
| -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P0       | HTML iframe combines scripts and same-origin: preview can access the host origin                   | Remove same-origin permission; test sandbox policy                             |
| P1       | Preview grids have implicit mobile rows and children with full height                              | Explicit equal, shrinkable rows and zero minimum width                         |
| P1       | App shell uses 100vh, which can exceed mobile visible viewport                                     | Dynamic viewport sizing and flex-based tool height                             |
| P1       | HTML syntax overlay duplicates textarea layout without matching scrollbar width                    | Replace with readable native editor first; evaluate existing Monaco separately |
| P1       | Markdown sync uses relative scroll position, not source mapping; diagrams resize asynchronously    | Regression fixtures, resize handling, then source anchors if justified         |
| P1       | CI push trigger excludes develop; tool registry gate omitted                                       | Add both to CI                                                                 |
| P2       | Contributor entry point and architecture guide absent; deployment docs reference missing redirects | Add guides and correct hosting instructions                                    |
| P2       | Package homepage points to another owner                                                           | Align metadata                                                                 |
| P2       | Large Markdown page mixes tabs, rendering, export and scrolling                                    | Incremental extraction after interaction tests                                 |
| P2       | Regex-based HTML formatter/minifier can change script/string/preformatted content                  | Replace with syntax-aware implementation; preserve whitespace fixtures         |
| P2       | Markdown HTML export interpolates title and links remote KaTeX CSS                                 | Escape title; document or bundle export dependencies                           |
| P2       | Drafts and external resources need clearer privacy expectations                                    | Explain persistence, clearing and remote URL requests in product UI/docs       |

## Small branch sequence

1. `chore/contributor-roadmap-ci`: contributor guide, architecture, audit, metadata,
   deployment accuracy and CI coverage. Gate: registry check and quality build.
2. `fix/preview-layout-isolation`: viewport and split-pane sizing, readable HTML
   editor, sandbox isolation and pressed states. Gate: tests and production build.
3. `test/preview-browser-regressions`: add Playwright with desktop/mobile projects,
   browser installation and CI artifacts. Cover editor/preview independent scroll,
   resize, long lines, tables, images, Mermaid, zoom and theme switching.
4. `fix/markdown-scroll-lifecycle`: cancellable sync lifecycle, ResizeObserver,
   tab-specific scroll restoration and Mermaid async race handling. Do not claim
   pixel-exact sync from ratios; define anchor behavior before implementing it.
5. `feat/workstation-design-tokens`: semantic surfaces, borders, muted text,
   focus and spacing tokens; migrate shared surfaces before individual tools.
6. `feat/preview-workbench-controls`: common pane headings, consistent run/auto
   controls, compact overflow menu and editor/preview/split modes for both tools.
7. `refactor/markdown-workbench`: extract tabs, exports and renderer lifecycle;
   address export errors and safe title escaping with interaction coverage.
8. `fix/html-format-preservation`: syntax-aware formatting, whitespace and
   embedded-language regression fixtures; label destructive transforms clearly.

## Next implementation order

1. `fix/html-format-preservation`: prevent minify/beautify from changing scripts,
   quoted strings and preformatted text. Add fixtures before replacing the parser.
2. `fix/markdown-export-safety`: escape document titles, expose export errors,
   clarify diagram/math fidelity and remove unnecessary remote export resources.
3. `feat/preview-workbench-controls`: consistent pane headings, HTML layout modes,
   primary actions and accessible empty/error feedback, verified by browser tests.
4. `feat/workstation-design-tokens`: migrate shared controls/surfaces first, then
   tool pages; compare screenshots in both themes and at narrow/short viewports.
5. Expand browser acceptance to Firefox/WebKit, physical mobile, images/tables,
   200% zoom and document sizes beyond the current long-text fixtures.

Each branch should pass the quality gate and relevant browser checks before
integration into develop. Keep the release PR open for review; do not merge main
until the release checks pass and the maintainer reviews the visual tradeoffs.

## UI/UX direction

Build a restrained developer workbench: neutral backgrounds, one accent for
active navigation and primary actions, thin dividers and consistent typography.
Reserve gradients for the brand mark; reduce decorative gradients, tinted badges,
uppercase labels and repeated card shadows in everyday work areas. Prefer clear
pane titles, visible document state and a stable action hierarchy over decoration.

Use one spacing scale (4/8/12/16/24), consistent 32/36px controls and a readable
monospace editor. Tokenize light/dark colors rather than patching utility selectors.
Keep document rendering independent of shell theme where HTML owns its styling.
Show primary actions (Run, Copy, Export) consistently; move rare actions to a
labelled menu. Explain Auto and sync state with pressed semantics and tooltips.
For phones, offer a single-pane mode as well as a usable stacked split.

## Acceptance matrix and release checklist

Check 320x568, 390x844, 768x1024, 1024x768, 1440x900 and a short 1280x600
viewport, including 200% zoom and light/dark/system themes. In each preview:

- No page-level horizontal overflow; long code/tables scroll inside their pane.
- Both split panes remain reachable and independently scroll to the end.
- Caret, selection and text remain aligned after wrap, scroll and resize.
- Keyboard users can reach controls, see focus and dismiss menus/dialogs.
- Switching tabs/layouts retains content; Auto off only updates on Run.
- Markdown sync does not oscillate; images/diagrams do not strand the scroll.
- HTML scripts cannot read parent DOM/storage or remove the iframe sandbox.
- Empty, invalid and large documents have understandable states; export errors
  are visible and no input is transmitted by Forge itself.

Run `pnpm check:tools` and `pnpm check` before each integration push. Attach
browser results and screenshots to visual PRs. Enable required Quality checks
and review protection for main/develop in repository settings. CI currently has
unit/integration/build coverage; browser automation, dependency update automation
and deployment smoke checks are remaining work, not completed guarantees.
