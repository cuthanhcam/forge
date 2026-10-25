# Theme and interaction colors

Forge uses a blue interaction accent in both light and dark appearance. The home
signature keeps its existing brand gradient. Pink/purple ambient backgrounds and
pink sidebar overrides have been removed; the decision is blue, not FF3366.

The neutral dark surfaces are informed by the checked-out Markdown-Viewer CSS
and [the reference app](https://markdownviewer.pages.dev/). No application code
from the reference is copied.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | White | #0D1117 |
| Editor, header and menu | White | #161B22 |
| Raised/hover surface | Slate 50/100 | #21262D |
| Neutral divider | Slate 100/200 | #30363D |
| Primary reading text | Slate 900/950 | #C9D1D9 |
| Secondary text | Slate 500/600 | #9AA5B1 |
| Subtle text and code comments | Slate 400 (existing UI) | #8B949E |
| Selected control text (`accent-700`) | #1D4ED8 | #8FC5FF |
| Selected surface (`accent-50`) | #EFF6FF | #17283D |
| Solid primary action | #2563EB, white text | #58A6FF, #0D1117 text |

[Light workbench](../assets/forge-workbench-light.png) /
[Dark workbench](../assets/forge-workbench-dark.png)

## Implementation rules

- `src/app/styles.css` defines theme-aware `accent-50` through `accent-950` plus
  `accent-solid`, `accent-solid-hover` and `accent-on-solid`. Use accent utilities
  for selection, links, ranges, focus and interaction borders. The dark scale is
  contextual: higher text shades become lighter, while surface shades stay dark.
- Shared buttons use neutral ghost hover, soft blue secondary hover and explicit
  solid-button hover. Selected buttons/links retain blue text with a slightly
  stronger blue surface. Avoid changing opacity on the entire button and text.
- Mouse-hover overrides run only with `(hover: hover)` so a touch tap does not
  leave a sticky mouse state. Keyboard focus remains an independent visible ring;
  input focus borders use `accent-500`, not the faint decorative border shades.
- Keep success green, warning amber and error rose/red. Do not recolor syntax or
  document meaning as selection. Dark syntax highlighting has its own readable
  colors for keywords, strings, numbers, comments and punctuation.
- Rendered Markdown follows the application theme; HTML inside the sandbox owns
  its authored colors. Do not inject theme styles into arbitrary HTML documents.
- Neutral dark reading text is deliberately gray rather than near-white. Do not
  lower the opacity of a whole editor or make text so faint that readability drops.
- Legacy neutral utility overrides remain during migration. New controls should
  use the shared primitives and tokens; avoid feature-local dark pink/blue hexes
  or another global override layer.

## Verification

`e2e/theme.spec.ts` checks actual composited text/background contrast (at least
4.5:1) on representative source, gutter, heading, selected tab, buttons, hovered
menu items and dark syntax tokens. It also checks real theme-menu switching,
blue accents across navigation and OS changes in System mode. Desktop/phone
screenshots cover the Markdown workbench. This is targeted regression coverage,
not a claim that every element in Forge has been certified for WCAG conformance.
Run `pnpm check` and the browser suite before integrating theme changes. Review
home, Markdown/HTML, data tools, dialogs, menus, errors and disabled states in
both themes; preserve the privacy and rendering boundaries.
