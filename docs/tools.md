# Tool Guide

Forge groups tools by workflow, not by implementation detail.

## Editors

### Markdown Preview

Write Markdown and preview the rendered result side by side. Useful for docs,
release notes, READMEs, and quick content drafts.

Choose Editor, Split or Preview from the layout menu. Drag the divider to give
more room to the editor or preview. Split stacks panes in narrow workspaces,
where the divider adjusts their heights. Focus the divider and use arrow keys
(or Shift+arrow for larger steps), Home/End for its limits, and Enter or a double
click to restore equal panes. Escape cancels a pointer drag. Sync follows the pane you scroll; turn it off to read each pane
independently. Scroll progress follows viewport changes, images and diagrams.
Sync uses relative document position, so it does not map every source line to
an exact rendered block. The native editor keeps text, caret and scrolling in
one layer. A separate gutter shows logical line numbers: a wrapped continuation
keeps the same number, and the next number starts at the next source newline.
The gutter follows vertical scrolling while staying fixed during horizontal
scrolling; it recalculates wrapped line heights when the editor resizes.
Markdown and HTML source editors share the same monospace font; rendered
Markdown prose uses the UI reading font.

The tab collapse/expand control sits at the bottom of the desktop tab rail.
Right-click a document, long-press it on touch devices, or focus it and press
Shift+F10 to rename, duplicate or delete it even when the rail is collapsed.
The expanded rail also has a three-dot menu. Rename focuses the name field;
closing actions restores document focus, and deleting an active document selects
its nearest surviving neighbor.

Drafts save locally after a short pause without a persistent success message.
If browser storage is full or blocked, the text stays editable for the current
session and a warning asks you to export Markdown before leaving. Navigation
flushes pending writes when storage is available. Export important drafts;
browser storage is not a backup. Opening the guide never migrates or replaces
text in your Welcome tab; reopening an existing guide tab also preserves edits.

Fenced code blocks with the `mermaid` language render diagrams after a short
pause in editing. Invalid diagrams show an error and their source; correct the
syntax to retry. Diagrams follow the Forge theme and render with strict security
and SVG text labels. Executable HTML labels and diagram click callbacks are not
enabled.

### HTML Preview

Write HTML and inspect the result in a constrained preview surface. Useful for
snippets, templates, and quick markup checks. Inline scripts run in an isolated
iframe without access to Forge's DOM or browser storage. Forms, popups, modal
dialogs and downloads initiated inside the preview are restricted. Use the
Forge toolbar to download the source. Auto updates after a short delay; turn it
off to apply edits only with Run preview.

HTML Preview uses the same draggable, keyboard-adjustable divider, including
stacked panes on narrow workspaces. Author-supplied HTML controls its rendered
font; the source editor retains monospace for code.

The HTML editor uses native text rendering for reliable caret and scroll
alignment, with the same line-number gutter as Markdown. Line numbers remain
aligned when line wrapping or indentation changes. Syntax coloring remains a
separate editor enhancement.

Beautify formats HTML with the selected indentation and leaves script, style,
preformatted and textarea contents intact. It does not format embedded JavaScript
or CSS. Minify conservatively compacts tag/attribute spacing; it preserves text
spacing, comments and raw blocks, so output may remain multiline. Invalid markup
shows an error and keeps the source. You can continue typing while the formatter
loads; an older result will not replace a newer edit.

### Diff Checker

Compare original and changed text with split and unified review modes. It
supports whitespace controls, unchanged-line hiding, synchronized scrolling,
syntax selection, copy actions, and export. Original/Changed input editors have
wrap-aware logical line numbers. Use the icon at the options rail footer to
collapse or expand it; this preference is saved with the local diff draft. The
collapsed mobile rail leaves an Options bar above the comparison. Split-result
rows retain their alignment when either side wraps or the workspace resizes;
unchanged lines have no visible row outline.

## Data

### JSON Formatter

Format, validate, inspect, edit, and copy JSON. It supports spacing options,
line wrapping control, syntax coloring, and text/tree views.

### JSON YAML Converter

Convert between JSON and YAML for config and API workflows.

### JWT Decoder

Decode JWT headers and payloads, inspect claim details, generate examples, and
verify HMAC signatures locally when supported.

## Encoding

### Base64

Encode and decode text using standard and URL-safe alphabets.

### URL Encoder

Encode, decode, and inspect URL-safe strings for links, query parameters, and
redirect values.

## Crypto

### JWT Secret Generator

Generate HMAC-friendly JWT secrets with common preset lengths.

### Hash Generator

Generate common hashes from text input and copy individual outputs.

### Password Generator

Generate passwords with configurable length and character sets.

## Utilities

### UUID Generator

Generate UUIDs for identifiers, test data, and local workflows.

### Timestamp Converter

Convert Unix timestamps and human-readable dates.

### Case Converter

Convert text between common naming styles.

### Slugify

Create URL-friendly slugs from human text.

### Regex Tester

Test regular expressions against sample input with match feedback.
