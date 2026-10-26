# Forge design language and redesign plan

Status: planned, with targeted correctness fixes already delivered. This is a
product/design workstream alongside feature development, not a claim that the
current screens have been redesigned.

## Direction: a clear developer workbench

Forge should feel precise, calm and recognizably its own. The home signature is
expressive; working screens should prioritize the input, result and next action.
A new user should understand what to paste, what happens next and where the result
is without scanning every option. Correctness and speed remain necessary, but
visual hierarchy and discoverability are release requirements too.

Reference: the maintainer's jwt.io screenshots and [JWT Debugger](https://www.jwt.io/)
show a useful input/output hierarchy, clearly named Header/Payload sections,
quiet surfaces and controls placed near what they affect. Borrow the hierarchy
and restraint, not branding, proprietary assets or a pixel-for-pixel layout.

Forge's signature: its anvil, original home statement/gradient, blue interaction
accent, restrained outlined icons and generous document reading space. Avoid
ambient pink/purple surfaces, decorative gradients in working areas, repeated
colored pane headers, uppercase micro-labels everywhere and cards inside cards.

## Common standards to establish

| Area       | Proposed rule                                                                                                                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color      | One blue identity: #2563EB solid actions and #1D4ED8 hover in both themes. Text/soft selection shades retain the same hue and adjust brightness for contrast. Neutral surfaces; green/amber/red communicate status. JWT segment colors label document parts, not application actions.                                                               |
| Typography | Inter for UI/prose; shared monospace for source/results. 14px/20px reading labels, 13px/24px code, 12px/16px metadata, 18-24px semibold page headings. Sentence case. Avoid tiny all-caps control groups.                                                                                                                                           |
| Spacing    | 4/8/12/16/24/32px scale. Related controls stay together; separate task groups with space before adding borders or panels.                                                                                                                                                                                                                           |
| Shape      | 8px control radius, 12px pane/menu radius, thin neutral borders. Pills only for truly segmented modes/status, not every control. Reserve shadows for floating layers.                                                                                                                                                                               |
| Buttons    | 36px normal controls, 32px dense controls, at least 44px touch targets where practical. One primary task action per tool. Icon-only actions need a tooltip, accessible name and visible focus. Rare actions move to a labelled menu.                                                                                                                |
| Icons      | Lucide, 16px and a consistent stroke weight (target 1.75). 20px only where hierarchy requires it. No mixed emoji/icon styles in controls.                                                                                                                                                                                                           |
| State      | Define default, hover, pressed, focus, disabled, loading, success and error for every primitive in both themes. Selection survives hover. Touch does not inherit sticky mouse hover.                                                                                                                                                                |
| Panes      | Neutral pane chrome, obvious title, local Copy/Expand actions, readable content. Shared split/mode controls; resizing must retain source, selection and scroll position.                                                                                                                                                                            |
| Feedback   | Inline validation near input; brief copy feedback with a polite status; actionable failure. Never display or transmit secret contents in telemetry or status messages.                                                                                                                                                                              |
| Sliders    | Native interaction, visible value and correctly positioned ticks. Linear by default; JWT secret explicitly anchors 32/256/512 so 256 is centered. Logical keyboard increments and announced units must match displayed values. No thumb geometry animation or output reflow under a drag. Add numeric entry where exact configuration is important. |

## Task organization

Each screen should answer three questions in order: What am I doing? Where do I
put my content? What can I do with the result?

- Keep the common path visible. Put configuration behind Options with a compact
  summary, rather than wrapping every control into several rows on a phone.
- Explain automatic vs explicit execution next to the primary action. Do not give
  Format, Copy, Download, Clear and example generation equal visual weight.
- Use visible input/output labels; placeholders add examples, not essential labels.
- Make examples explicit and distinguish them from user content. Give empty and
  invalid input useful guidance without filling the screen with marketing text.
- Keep destructive/reset actions separate from copy/export and preserve drafts.
- Use tool-specific details inside a consistent workbench shell, not a different
  design system for every tool.

## Pilot: JWT Decoder

Start here because it exposes the current hierarchy and contrast problems clearly.
The corrected [light baseline](../assets/forge-jwt-light.png) and
[dark baseline](../assets/forge-jwt-dark.png) show the targeted contrast fixes;
the layout changes below remain planned.

1. Keep Encoded token as the main input. Header/Payload previews should be optional
   aids, not three competing cards above a very small input on a phone.
2. Show Decoded header and Decoded payload as two neutral, clearly titled sections
   with compact local Copy/Expand actions. Use segment colors sparingly on labels
   and syntax, rather than tinting whole large content areas.
3. Give JSON/Claims Breakdown a consistent segmented control. Keep Verify adjacent
   to verification status and make advanced key/algorithm controls discoverable
   without crowding the default decoding path.
4. Put Generate example and its algorithm selector in the secondary action group.
   Clearly distinguish decoding, claim inspection and actual signature verification.
5. On phones, provide Input/Result modes or a comfortable stacked flow; avoid a
   57px input competing with a long output. Preserve token/caret across modes.
6. Test a first-time journey: paste token, find algorithm/claims, inspect signature
   status and copy one result. Keep cryptographic services and privacy boundaries.

## Small implementation branches

- [ ] `feat/design-foundations`: document final tokens and a component/state gallery;
      agree button, segmented-control, field, pane, badge, menu and empty/error patterns.
- [ ] `feat/jwt-workbench-layout`: implement the pilot above with before/after
      desktop/phone screenshots and a visible task hierarchy. Preserve all current modes.
- [ ] `feat/preview-toolbar-hierarchy`: align Markdown/HTML modes, primary actions,
      local output actions and Options. Retain line numbers, Mermaid and resizing.
- [ ] `feat/generator-control-layout`: consolidate secret/password/UUID configuration;
      retain readable generated output, presets, precise values and consistent sliders.
- [ ] `feat/data-workbench-layouts`: migrate JSON, JSON/YAML, Diff, Base64, URL and Hash
      to the common panes/actions, with enough editor space at narrow/short sizes.
- [ ] `feat/text-utility-layouts`: simplify Case Converter, Slugify, Regex and Timestamp
      results/metrics, labels and settings; keep copy/download nearby.
- [ ] `feat/workbench-onboarding`: concise first-use guidance and explicit examples;
      test discoverability with new users before adding feature tours.

Deliver one branch at a time. Establish primitives before migrating every screen.
Do not combine parser, cryptographic or storage rewrites with visual changes.

## Acceptance and review

For each pilot/migration, review light/dark at 320x568, 390x844, 768x1024,
1440x900 and a short desktop, plus 200% text, keyboard and reduced motion. Check
long/empty/invalid content, loading, denied clipboard, disabled controls and errors.
Representative small text must meet 4.5:1; meaningful control boundaries/focus must
meet 3:1. Add tests for behavior, not snapshots that merely mirror class names.

Proposed usability target (not yet measured): a new user can complete the default
paste/process/copy task within one minute without instructions from the maintainer.
Run a short task review with 2-3 new users, record confusion and refine the layout.

A branch is ready only after its interaction checks, `pnpm check`, relevant browser
coverage, screenshot review and CI pass. Review with the maintainer before merging
main. Keep [the tool audit](tool-ux-audit.md) and this plan updated as tasks land.

See [range control behavior](range-controls.md) for the implemented scales,
keyboard rules and native-input constraints.

## Informational footer

Use one minimal footer on Home, Docs, Support, Settings, Privacy, Terms and the
not-found page. Its content width matches the shared max-w-7xl page container,
including Docs and Home. It scrolls with the page rather than staying fixed.
Docs uses one page scroll owner with sticky, independently scrollable sidebars;
the footer spans the full content grid and changing document resets reading to top.

The left side shows only copyright/name and Vietnam / Software Engineer. The
right side has GitHub, LinkedIn, email, Facebook and Instagram icons, with
accessible names, theme-aware hover/focus, tooltips and safe external links.
On narrow screens the contact row wraps and remains right-aligned. Do not add
extra footer navigation, marketing copy or social embeds. Registered tool
workspaces retain their full editor area without a site footer.
