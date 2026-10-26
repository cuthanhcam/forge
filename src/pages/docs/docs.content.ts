import safetyMarkdown from "../../../docs/security-and-tokens.md?raw";
import workspaceMarkdown from "../../../docs/workspace.md?raw";
import supportMarkdown from "../../../docs/support.md?raw";
export interface DocPageContent {
  description: string;
  id: string;
  markdown: string;
  title: string;
}

export const docPages: DocPageContent[] = [
  {
    description:
      "The story, product model, workflows, and trust boundaries behind Forge.",
    id: "overview",
    title: "Product docs",
    markdown: `# Product docs

Forge is a local-first developer workstation for the small, repeated tasks that happen between writing code and shipping it. It is the place where rough developer fragments become usable work: JSON payloads become readable, JWTs become inspectable, diffs become calm, URLs become clear, and generated values are ready to copy.

Forge is not trying to be a large IDE or a cloud platform. It is a compact workbench for moments that are too small for a full workflow and too sensitive for a random browser tab.

## Why Forge exists

Modern development is full of tiny interruptions. A token appears in logs. A JSON response needs formatting. A timestamp needs translating. A pull request requires a quick text comparison. A password, UUID, slug, hash, or Base64 value is needed before the real work can continue.

Individually, these tasks are small. Together, they create tab drift: different websites, different layouts, different copy buttons, different privacy assumptions, and different visual languages.

Forge brings these fragments into one workspace. The goal is simple: keep the developer close to the task, make the result easy to trust, and avoid sending sensitive text through unnecessary places.

## Product principles

- **Local-first by posture.** Core tool work happens in the browser whenever the feature supports it. Inputs such as tokens, secrets, JSON, URLs, source snippets, and generated values are treated as temporary working material.
- **One Forge rhythm.** Tool pages reuse the same interaction language: input panes, result panes, compact toolbars, clear copy actions, validation states, segmented controls, toggles, and export buttons.
- **Dense, not crowded.** Forge should feel like a professional workbench. It favors scan-friendly layouts and predictable controls over decorative space.
- **Copy is a primary action.** Many tools end with a copied value, so copy controls stay close to the output they affect.
- **Errors should help immediately.** Validation appears in the workspace, near the input or result, so users can fix data without leaving context.
- **No account ceremony.** Forge is designed to be useful immediately. It does not require sign-in for its local utility workflows.

## The Forge workflow

Most tools follow the same loop.

### Capture

Paste, type, load, or generate a fragment. Forge assumes this material may be messy, temporary, or sensitive. The UI should not ask the user to explain the context before the tool can be useful.

### Shape

Format, decode, compare, convert, encode, generate, inspect, or validate the fragment. Controls should sit where the user naturally looks: layout controls near the workspace, value controls near the value, and destructive actions behind clear labels.

### Return

Copy, export, or inspect the result and move back to the original task. Forge should not trap users inside a long workflow. The best result is often a clean value copied back into code, a request, a config file, or a review comment.

## Tool families

### Editors

Markdown Preview, HTML Preview, and Diff Checker are full-height review workspaces. They establish the main interaction pattern for Forge: a large editing or review surface, compact controls, readable panes, and output that can be copied or exported.

Markdown Preview supports rendered Markdown, Mermaid diagrams, KaTeX, synchronized review, and exports. HTML Preview focuses on a sandboxed preview surface for trusted snippets and quick layout checks. Diff Checker provides split and unified review views, whitespace controls, syntax highlighting, synchronized scrolling, and inline differences.

### Data

JSON Formatter, JSON YAML Converter, and JWT Decoder focus on structure and correctness. These tools should make invisible structure visible: nesting depth, arrays, objects, claims, expiration, signature status, and conversion errors.

JSON Formatter offers editable input and result areas, indentation choices, minify/format flows, tree view, wrapping controls, and validation. JSON YAML Converter keeps both conversion directions in one workspace. JWT Decoder separates the encoded token into header, payload, and signature, then provides JSON and claims views with optional HMAC verification.

### Encoding

Base64 and URL Encoder are fast encode/decode loops. Their UI should make mode selection obvious and keep both the input and output editable enough for normal text habits such as select all, copy, paste, and manual correction.

Base64 supports standard and URL alphabets plus text encodings where useful. URL Encoder supports component and full URL workflows, including query inspection for real URLs.

### Crypto

JWT Secret Generator, Hash Generator, and Password Generator are local generation and inspection tools. They are intentionally direct: choose options, generate, show or hide sensitive values when appropriate, and copy the result.

These tools should avoid pretending that generation alone is a complete security process. They provide strong local utilities, but users still need to apply their own security and compliance requirements.

### Utilities

UUID Generator, Timestamp Converter, Case Converter, Slugify, and Regex Tester cover the frequent transformations that happen while building and debugging. These tools are small by nature, but they still follow the same Forge rules: predictable controls, readable output, clear copy actions, and validation where mistakes are likely.

## Navigation model

Forge uses the left navigation as the product map. Categories are stable and intentionally plain:

- **Editors** for previewing and comparing.
- **Data** for structured payloads and tokens.
- **Encoding** for reversible text transformations.
- **Crypto** for hashes, passwords, and secrets.
- **Utilities** for common implementation helpers.

The command palette is the fast path. The sidebar is the map. The header reflects the active page. Each tool owns the controls that belong to its own workflow.

## Privacy model

Forge is designed around local-first utility work. Most transformations happen in the browser, and several tools use browser storage to preserve drafts, preferences, recent tools, or workspace state. This makes Forge useful for repeated work without requiring an account.

Local-first does not mean risk-free. Browser extensions, device compromise, shared machines, hosting environments, screenshots, and support channels can still expose sensitive data. Users should treat production secrets, customer data, and proprietary source code with care.

For more detail, read the Privacy page and Terms of Use.

## Visual language

Forge should feel calm, technical, and consistent. The visual system uses restrained borders, compact toolbars, light/dark theme support, clear active states, and a soft brand gradient only where it adds identity.

Tool screens should not feel like landing pages. They should feel like work surfaces: enough density to be useful, enough contrast to be readable, and enough polish to make repeated use pleasant.

## Examples of good Forge behavior

- A JSON error appears near the editor and explains what failed.
- A generated secret is masked by default and has obvious Show and Copy controls.
- A diff view can hide whitespace or unchanged lines without losing orientation.
- A JWT token visually separates header, payload, and signature.
- A result pane supports normal selection and copying habits.
- A tool works at laptop sizes without requiring a 27-inch monitor.

## What makes a tool feel finished

A Forge tool is not finished when the happy path works. It is finished when the workflow feels safe under pressure.

Before a tool is considered complete, it should answer these questions:

1. What can the user paste or type?
2. What does success look like?
3. What does invalid input look like?
4. Can the user copy the important value quickly?
5. Does the layout hold up on smaller laptop screens?
6. Does the dark theme remain readable?
7. Does the tool share Forge's existing button, pane, toggle, and editor language?
8. Are sensitive values handled with appropriate visibility controls?
`,
  },
  {
    description:
      "Practical guidance for using Forge tools and understanding common workflows.",
    id: "guides",
    title: "Guides",
    markdown: `# Guides

These guides explain how to use Forge as a daily developer workstation. They focus on workflows rather than implementation details.

## Start with the fragment

Forge works best when you begin with the fragment in front of you: a token, payload, URL, config block, text sample, generated value, or timestamp. Choose the tool that matches the action you need to perform.

- Use **formatters** when the structure is correct but hard to read.
- Use **decoders** when the value hides information inside an encoded format.
- Use **converters** when the same data needs to move between formats.
- Use **generators** when you need a fresh value with clear constraints.
- Use **testers** when the result depends on a pattern or rule.

## Inspect a JWT

Open JWT Decoder and paste the token into the encoded token pane. Forge separates the token into header, payload, and signature, then renders decoded JSON by default.

Use Claims Breakdown when you need to understand standard fields such as issuer, audience, issued-at time, not-before time, expiration, scopes, or roles. If the token uses an HMAC algorithm, enter the secret to verify the signature locally.

Decoding does not authenticate a token. A matching HMAC signature does not validate issuer, audience, authorization or revocation. Use your trusted authentication stack for production decisions. Never share real tokens or signing secrets; use synthetic examples. Read [Tokens and safety](/docs/safety).

## Format JSON safely

Open JSON Formatter and paste the payload into the input editor. If the JSON is valid, Forge can format it with your preferred indentation, minify it, sort keys, and show a tree view.

Use two-space formatting for API examples and four-space formatting when readability matters more than compact output. Use Tab only when the target project or team convention expects it.

If the JSON is invalid, fix the editor directly. The result pane stays close so the correction loop remains visible.

## Convert JSON and YAML

Open JSON YAML Converter when configuration needs to move between machine output and human-maintained files. Choose the direction first, then paste the source value.

Use the editable result when you need to make a small correction before copying. Always validate the final output in the destination toolchain, especially for YAML where indentation and scalar types can change meaning.

## Compare text

Open Diff Checker when a change is easier to understand visually than by reading both inputs. Paste the original text on the left and the changed text on the right.

Use whitespace and blank-line controls when formatting noise hides the real change. Use unified view when you need a review-style summary. Use split view when the line-by-line relationship matters.

## Encode and decode values

Base64 and URL Encoder are designed for quick loops. Paste the source value, choose the right mode, and copy the transformed value.

For URL work, component encoding is usually right for query values. Full URL mode is better when you need to inspect or normalize an entire URL. For Base64, use the URL alphabet when the output needs to travel safely in URLs or tokens.

## Generate secrets and passwords

Use JWT Secret Generator for HMAC JWT secrets. Choose a preset length when targeting HS256, HS384, or HS512, or adjust the custom length when your application has a specific policy.

Use Password Generator for human or system passwords. Check the entropy signal, character options, and visibility state before copying. Generated values should be stored in your password manager or secret manager immediately after use.

## Work with utility tools

Use UUID Generator for identifiers, Timestamp Converter for debugging logs and API data, Case Converter for naming conventions, Slugify for URL-friendly text, and Regex Tester for pattern work.

These tools are intentionally small. Their job is to remove friction while you are doing something else.

## Keyboard and navigation habits

Use the sidebar when exploring categories. Use the command palette when you already know the tool you want. Use normal editor habits in text-heavy tools: select all, copy, paste, and direct editing should feel natural.

## Handling sensitive data

Forge is designed to reduce unnecessary data movement, but you should still handle sensitive values carefully:

- Prefer trusted deployments for private data.
- Avoid pasting production credentials into shared machines.
- Redact examples before sending support requests.
- Rotate credentials that were copied into the wrong place.
- Clear workspace data when using a device that is not yours.
`,
  },
  {
    description: "Keyboard shortcuts and interaction conventions used across Forge.",
    id: "shortcuts",
    title: "Keyboard shortcuts",
    markdown: `# Keyboard shortcuts

Forge keeps shortcuts small and predictable. The goal is to speed up repeated work without making the product feel like it has hidden rules.

## Global shortcuts

| Shortcut | Action |
| --- | --- |
| \`Ctrl K\` | Open command palette |
| \`Cmd K\` | Open command palette on macOS |
| \`Esc\` | Close dialogs, menus, and popovers when supported |

## Editor conventions

Text-heavy tools support normal editor expectations:

- \`Ctrl A\` selects editable content.
- \`Ctrl C\` copies selected text.
- \`Ctrl V\` pastes into the active editor.
- \`Tab\` inserts indentation in JSON-style editors where implemented.
- Long outputs should support wrapping controls when horizontal inspection matters.

## Navigation conventions

- Tool routes live under \`/tools/:toolId\`.
- Documentation lives under \`/docs\` and \`/docs/:docId\`.
- Support pages live under \`/support/:mode\`.
- Privacy and Terms live at \`/privacy\` and \`/terms\`.

## Copy conventions

Copy buttons should be visible beside generated or transformed output. Header copy actions are useful only when the page has a single obvious output.

## Dialog and flyout conventions

Dialogs, menus, and flyouts should close with \`Esc\` and when clicking outside where the interaction pattern supports it. A keyboard shortcut should not trap the user in a modal state.
`,
  },
  {
    id: "safety",
    title: "Tokens and safety",
    description: "JWT trust boundaries, secrets and responsible reporting.",
    markdown: safetyMarkdown,
  },
  {
    id: "workspace",
    title: "Workspace settings",
    description: "Appearance, remembered navigation and local drafts.",
    markdown: workspaceMarkdown,
  },
  {
    id: "support",
    title: "Support and contributing",
    description: "Questions, issue reports and optional project support.",
    markdown: supportMarkdown,
  },
];

export function getDocPage(docId?: string): DocPageContent {
  return docPages.find((page) => page.id === docId) ?? docPages[0];
}
