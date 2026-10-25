# Tool UI/UX audit

## Scope and evidence

Reviewed all 14 tools other than Markdown/HTML Preview in the local source and
Chromium at 390x900 and 1440x900, using their default data after lazy loading.
Inspected phone screenshots for Base64, UUID, Timestamp and Regex. This is an
initial-state audit, not full functional, screen-reader or contrast certification.
No main-level horizontal overflow was found at those two widths. Long custom
inputs, 320px, 200% zoom, dark theme and every alternate mode need expanded coverage.

## Immediate corrections

- Markdown source now matches HTML source: shared monospace, 13px/24px. Preview
  prose retains Inter. The gutter mirror still measures the actual editor font.
- Name icon-only Download/Clear actions in Case Converter and Slugify, and the
  Timestamp reset action. Timestamp reset means return to live time, not erase
  the displayed result.
- Name UUID validation, JWT secret length and local datetime inputs; announce
  the secret slider value in bits.

## Prioritized follow-up branches

| Priority / branch | Tools | Finding and proposed change | Acceptance |
| --- | --- | --- | --- |
| P1 `feat/compact-tool-options` | Base64, URL Encoder, Hash, UUID, JWT Secret, Password Generator | On phones, wrapped option groups consume several toolbar rows. Base64 puts Clear on its own row; UUID presets fill much of the upper pane. Keep primary actions visible; put secondary settings behind a labelled Options control, with a summary of current choices. | All options reachable by touch/keyboard; dismiss returns focus; no lost input; test 320px and short viewports. |
| P1 `feat/tool-copy-feedback` | All output tools | Most pages call clipboard directly and give no completion or failure feedback. Use one shared copy lifecycle with a brief Copied state, polite status and actionable clipboard failure. Name repeated actions by result. | Test denied clipboard, rapid clicks, unmount and empty output; do not expose secret text in status. |
| P1 `fix/compact-editor-space` | JWT Decoder, Hash | At 390x900 the initial JWT source is only about 57px high; Hash source about 86px. Offer input/result modes or a collapsible options area so typing does not require a tiny scroll window. | Caret and last line reachable with a mobile keyboard; preserve input and selected mode during resize. |
| P1 `fix/tool-selection-semantics` | Base64, URL Encoder, Hash, UUID, JWT Secret, Password Generator, JSON Formatter, JWT Decoder | Several mode/segmented helpers indicate selection by color only. Add pressed semantics or a consistently implemented single-choice group; retain visible keyboard focus. Regex flags already use aria-pressed. | Test keyboard activation and announced selection; avoid adding radio roles without radio keyboard behavior. |
| P2 `feat/quiet-tool-surfaces` | All shared ToolSurface users | Pane headers are uppercase, color-tinted and often combined with tiny uppercase metrics and multiple nested cards. Use sentence-case semibold titles, neutral surfaces, fewer card boundaries and one accent for selection. Keep error/success messages explicit. | Review light/dark screenshots together; validate text contrast and focus; migrate shared primitives before individual pages. |
| P2 `feat/data-workbench-layouts` | JSON Formatter, JSON/YAML, Diff Checker | Bring the established preview pane resizing and layout controls to data/compare workflows after defining each tool's editor ownership. | Long JSON/diff lines scroll within their pane; parser errors keep input; tests cover editor selection and narrow layouts. |
| P2 `feat/text-tool-results` | Case Converter, Slugify, Regex Tester | Simplify result cards and distinguish primary output from secondary metrics. Regex Pattern/Replacement currently rely on placeholders for visible guidance. Add compact visible labels and show error context near the relevant field. | Empty, invalid, long and Unicode input; copy/download remain discoverable; Regex flags keep their pressed state. |
| P2 `feat/timestamp-input-states` | Timestamp | Distinguish Live from a fixed input, visibly label the local date control and clarify seconds vs milliseconds/timezone. Keep the reset action discoverable with a tooltip. | Test valid/invalid input, timezone changes and live reset without disturbing keyboard focus. |

Do not combine these into one redesign branch. First address compact controls and
copy feedback, then visual surfaces. Preserve local processing and existing
parser/security boundaries. Each branch needs `pnpm check`, relevant browser
interaction checks and a screenshot review before integration into develop.
