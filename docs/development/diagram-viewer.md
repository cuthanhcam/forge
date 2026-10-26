# Mermaid viewer and navigation preferences

## Viewport ownership

MarkdownPreviewContent continues to own the sanitized Markdown DOM and renderer
lifecycle. Each successful Mermaid render mounts a React portal into its own
`.mermaid` node. MermaidDiagram owns the controls and viewports; toolbar state
never replaces the preview HTML. A new document or theme cancels old renderer
work and removes its portals, including any expanded viewer. Syntax failures keep
the existing actionable error/source behavior.

Inline and expanded canvases are independent. Zoom is bounded to 1-800%; Fit
centers the full diagram without enlarging beyond natural size, Reset restores
100%, and wheel zoom preserves the world point under the pointer. Manual zoom
survives resize with the center adjusted; Fit mode refits when its canvas changes.
Native pointer capture handles drag/pinch and cancels cleanly. No pan/zoom CSS
transition is used. A non-passive local wheel listener prevents default only for
Ctrl/Cmd+wheel inline or wheel inside the expanded viewer. Inline touch keeps
vertical document scrolling; expanded touch supports unrestricted pan/pinch.

The expanded viewer uses the existing Radix Dialog focus trap, Escape handling
and return focus. Buttons have tooltips/names; the focusable canvas describes its
keyboard shortcuts. Viewport state is transient, not saved in document drafts.

## Rendering and export boundaries

The renderer still uses Mermaid strict security and DOMPurify SVG sanitization.
Only that sanitized SVG reaches the viewer's innerHTML boundary. Scope every SVG
ID and its CSS/marker/href/ARIA references per canvas so duplicated inline/modal
copies cannot refer to another diagram. Compile reference matching once per SVG
rather than per attribute/ID for large diagrams. No new renderer network service
or dependency is introduced.

Download SVG serializes the whole scoped diagram, not the transformed/cropped
canvas. Toolbar/help DOM is marked data-html2canvas-ignore. Existing full-document
PNG/PDF capture records the visible inline viewport; HTML/rich export preparation
remains a separate roadmap item and should not be confused with standalone SVG
export. Fonts in SVG retain a system fallback; they are not embedded.

## Preference persistence

Workspace preferences are read synchronously through persistedWorkspaceSchema
before the store's first render and written synchronously after preference changes.
This avoids saving default expanded state over a restored collapsed rail. Only
sidebar/category, favorite and recent-tool metadata is stored in forge.workspace;
active route and tool content are excluded. Legacy plain records receive defaults.
Malformed JSON or blocked/quota-limited storage keeps an in-memory usable session.

Markdown tabs and Diff options retain their existing per-tool storage lifecycle.
Mobile drawer visibility is temporary even when desktop collapse is remembered.
Live synchronization between already-open browser tabs is not implemented.

## Validation and follow-ups

Tests cover immediate refresh, legacy preference defaults, rejected storage,
independent tool rails, scoped SVG references, zoom anchor/limits, document wheel
scrolling, touch document swipe, pan/pinch, keyboard zoom/pan, manual resize, SVG
download, Escape/focus restoration and malformed diagrams. Existing rapid-render,
theme/scroll, strict-security and editor tests remain required.

Chromium desktop/phone emulation is covered. Physical mobile, Firefox/WebKit and
screen-reader reviews remain follow-ups. Large graphs are still subject to
Mermaid's existing rendering limits. Keep source/draft privacy and sanitization
boundaries when extending exports or adding other diagram engines.
