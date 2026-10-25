# Diff workbench

Reference: the supplied Diffchecker screenshots and [the text comparison workspace](https://www.diffchecker.com/).
Forge adopts the clear original/changed structure, quiet unchanged rows and
collapsible options concept. It does not copy source code, assets or external
sharing behavior; comparison remains local.

## Delivered behavior

- A single icon at the options footer collapses/expands the rail. On desktop it
  becomes a 48px icon rail; on narrow screens it becomes an Options bar. Hidden
  controls are inert, and saved drafts retain the preference. Older drafts default
  to expanded options without changing original/changed content.
- Both editable inputs reuse NumberedTextarea: native selection/scrolling,
  monospace logical line numbers, wrap-aware heights and an independent fixed
  gutter. Visible source headings include a line count, including trailing blanks.
- Split results measure both corresponding rows after edits, wrap/syntax changes,
  font loading and resize, and apply the greater height to both. Measurements are
  batched and never run from a scroll event. Observers and animation frames clean up.
- Scroll synchronization remembers the browser's actual target position to avoid
  delayed target events feeding back into the source. Split/unified output regions
  support keyboard scrolling, with visible focus and labelled copy actions.
- Dark decorative borders are softer. The old global border rule no longer makes
  transparent unchanged-row borders gray. Added/removed blocks retain their outer
  boundary and semantic colors, with no internal horizontal separators.

The diff algorithm, ignore rules, syntax parsing and export format are unchanged.
This is not the full future redesign in [the design plan](design-language.md).
Character/word matching, change navigation, very large document virtualization,
physical-device testing and Firefox/WebKit coverage remain follow-up work.

## Verification

Browser tests cover source/gutter counts, end scrolling, wrap off, source retention,
collapsed reload, input/result/unified switching, transparent unchanged rows,
wrap alignment at desktop/phone/768/1280px layouts and synchronized result scrolling.
The shared editor tests additionally exercise native wrapping, tabs and Unicode.
Run `pnpm check` and relevant browser checks before integration.

[Dark comparison](../assets/forge-diff-dark.png) /
[Numbered input editors](../assets/forge-diff-input.png)
