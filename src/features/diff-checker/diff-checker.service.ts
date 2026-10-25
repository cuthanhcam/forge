import type { DiffCheckerState } from "./diff-checker.schema";

export interface DiffCheckerInput {
  value: string;
}

interface PersistedDiffCheckerState extends Omit<
  DiffCheckerState,
  | "hideUnchanged"
  | "hideWhitespace"
  | "ignoreBlankLines"
  | "inputVisible"
  | "layout"
  | "lineWrap"
  | "syncScroll"
  | "syntax"
  | "optionsCollapsed"
> {
  hideUnchanged?: boolean;
  hideWhitespace?: boolean;
  ignoreBlankLines?: boolean;
  inputVisible?: boolean;
  layout?: DiffCheckerState["layout"];
  lineWrap?: boolean;
  syncScroll?: boolean;
  syntax?: string;
  optionsCollapsed?: boolean;
}

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface DiffChange {
  leftLineNumber?: number;
  rightLineNumber?: number;
  text: string;
  type: DiffChangeType;
}

export interface DiffCompareOptions {
  ignoreBlankLines?: boolean;
  ignoreWhitespace?: boolean;
}

interface IndexedLine {
  lineNumber: number;
  text: string;
}

const sampleLeft = `# Forge Release Notes - Developer Tools

## 1. Summary

Forge is a local-first toolbox for developers who need quick text, security, and data utilities.
The release focuses on preview quality, predictable controls, and fast keyboard-friendly workflows.

* Markdown Preview uses a calm split editor and preview surface.
* HTML Preview keeps the same density, spacing, and export language.
* Diff Checker compares Original text with Changed text in split or unified views.
* JSON Formatter and JWT Decoder follow the same Forge surface model.

## 2. Design Goals

The interface should feel quiet, technical, and useful for repeated daily work.
Primary actions stay in the header; secondary options live in the left rail.
Diff colors must be readable without copying Diffchecker, GitHub, or Azure DevOps exactly.
Changed words inside a modified line should be emphasized with a stronger inline highlight.

## 3. Tool Behavior

* Compare automatically whenever either side changes.
* Keep unchanged lines visible by default so users keep context.
* Allow hiding whitespace-only changes when formatting noise is not relevant.
* Allow hiding blank lines when documents have spacing-only edits.
* Keep synchronized scrolling enabled for long documents.

## 4. API Inventory

| Area | Endpoint | Status |
| --- | --- | --- |
| Preview | /tools/markdown-preview | Stable |
| Preview | /tools/html-preview | Stable |
| Compare | /tools/diff-checker | Available |
| Data | /tools/json-formatter | Available |

## 5. Example Configuration

\`\`\`json
{
  "theme": "forge",
  "lineWrap": false,
  "syncScroll": true,
  "syntax": "Markdown",
  "exportName": "forge-diff.diff"
}
\`\`\`

## 6. Implementation Notes

The diff engine currently uses line-based LCS matching.
Whitespace comparison can normalize runs of tabs and spaces into a single space.
Blank line comparison can remove empty lines before calculating the diff.
The UI should not require a Compare button because edits should be reflected immediately.

## 7. Long Line Test

This line is intentionally long so the Disable line wrap control can be tested with a realistic sentence that keeps moving across the editor pane, includes a URL like https://forge.cuthanhcam.workers.dev/tools/diff-checker?mode=review&sync=true, and makes horizontal scrolling obvious when wrapping is disabled.

## 8. Removed Rollout Plan

* Keep the old manual Compare action.
* Add a separate History drawer before the storage model is ready.
* Show a secondary title block inside the tool body.
* Keep experimental transform shortcuts in the left sidebar.

## 9. Acceptance Checklist

* Split view renders removals on the left and additions on the right.
* Unified view renders additions and removals in one scrollable list.
* Copy diff exports a patch-like text file.
* Syntax highlighting can be changed without shifting the layout.
* Clear empties both sides and keeps the editor usable.
`;

const sampleRight = `# Forge Release Notes - Developer Tools

## 1. Summary

Forge is a local-first toolbox for developers who need quick text, security, and data utilities.
The release focuses on preview quality, predictable controls, safer exports, and fast keyboard-friendly workflows.

* Markdown Preview uses a calm split editor and preview surface.
* HTML Preview keeps the same density, spacing, and export language.
* Diff Checker compares Original text with Changed text in split or unified review views.
* JSON Formatter, JWT Decoder, and Hash Generator follow the same Forge surface model.

## 2. Design Goals

The interface should feel quiet, technical, and useful for repeated daily work.
Primary actions stay in the header; secondary options live in the left rail.
Diff colors must be readable while still using the Forge palette instead of copying another product.
Changed words inside a modified line should be emphasized with a stronger inline highlight.

## 3. Tool Behavior

* Compare automatically whenever either side changes.
* Keep unchanged lines visible by default so users keep context.
* Allow hiding whitespace-only changes when formatting noise is not relevant.

* Allow ignoring blank lines when documents have spacing-only edits.
* Keep synchronized scrolling enabled for long documents.
* Keep the input editor available from one clear Edit button.

## 4. API Inventory

| Area | Endpoint | Status |
| --- | --- | --- |
| Preview | /tools/markdown-preview | Stable |
| Preview | /tools/html-preview | Stable |
| Compare | /tools/diff-checker | Polished |
| Data | /tools/json-formatter | Available |
| Security | /tools/jwt-decoder | Available |

## 5. Example Configuration

\`\`\`json
{
  "theme": "forge",
  "lineWrap": false,
  "syncScroll": true,
  "syntax": "Markdown",
  "exportName": "forge-review.diff"
}
\`\`\`

## 6. Implementation Notes

The diff engine currently uses line-based LCS matching.
Whitespace comparison can normalize runs of tabs and spaces into a single space.
Blank line comparison can remove empty lines before calculating the diff.
The UI reflects edits immediately and does not need a Compare button.

## 7. Long Line Test

This line is intentionally long so the Disable line wrap control can be tested with a realistic sentence that keeps moving across the editor pane, includes a URL like https://forge.cuthanhcam.workers.dev/tools/diff-checker?mode=review&sync=true&layout=split, and makes horizontal scrolling obvious when wrapping is disabled.

## 8. Added Rollout Plan

* Keep auto comparison as the default interaction.
* Add history only after saved sessions have a clear product model.
* Keep the body free of duplicate titles.
* Remove experimental transform shortcuts from the left sidebar.

## 9. Acceptance Checklist

* Split view renders removals on the left and additions on the right.
* Unified view renders additions and removals in one scrollable list.
* Copy diff exports a patch-like text file.
* Syntax highlighting can be changed without shifting the layout.
* Clear empties both sides and keeps the editor usable.
* Export downloads the current diff as a .diff file.
`;

export function normalizeDiffCheckerInput(input: string): string {
  return input.trim();
}

export function hasDiffCheckerInput(input: string): boolean {
  return normalizeDiffCheckerInput(input).length > 0;
}

export function createDiffCheckerState(): DiffCheckerState {
  return {
    hideUnchanged: false,
    hideWhitespace: false,
    ignoreBlankLines: false,
    inputVisible: false,
    optionsCollapsed: false,
    layout: "split",
    left: sampleLeft,
    lineWrap: false,
    right: sampleRight,
    syncScroll: true,
    syntax: "Markdown",
  };
}

export function normalizeDiffCheckerState(
  input: PersistedDiffCheckerState,
): DiffCheckerState {
  return {
    hideUnchanged: input.hideUnchanged ?? false,
    hideWhitespace: input.hideWhitespace ?? false,
    ignoreBlankLines: input.ignoreBlankLines ?? false,
    inputVisible: input.inputVisible ?? false,
    optionsCollapsed: input.optionsCollapsed ?? false,
    layout: input.layout ?? "split",
    left: input.left,
    lineWrap: input.lineWrap ?? false,
    right: input.right,
    syncScroll: input.syncScroll ?? true,
    syntax: input.syntax ?? "Markdown",
  };
}

export function compareTextLines(
  left: string,
  right: string,
  options: DiffCompareOptions = {},
): DiffChange[] {
  const normalizedLeftLines = prepareLines(left, options);
  const normalizedRightLines = prepareLines(right, options);
  const leftComparable = normalizedLeftLines.map((line) =>
    normalizeComparableLine(line.text, options),
  );
  const rightComparable = normalizedRightLines.map((line) =>
    normalizeComparableLine(line.text, options),
  );
  const matrix = createLcsMatrix(leftComparable, rightComparable);
  const changes: DiffChange[] = [];
  let leftIndex = normalizedLeftLines.length;
  let rightIndex = normalizedRightLines.length;

  while (leftIndex > 0 || rightIndex > 0) {
    if (
      leftIndex > 0 &&
      rightIndex > 0 &&
      leftComparable[leftIndex - 1] === rightComparable[rightIndex - 1]
    ) {
      changes.push({
        leftLineNumber: normalizedLeftLines[leftIndex - 1].lineNumber,
        rightLineNumber: normalizedRightLines[rightIndex - 1].lineNumber,
        text: normalizedLeftLines[leftIndex - 1].text,
        type: "unchanged",
      });
      leftIndex -= 1;
      rightIndex -= 1;
    } else if (
      rightIndex > 0 &&
      (leftIndex === 0 ||
        matrix[leftIndex][rightIndex - 1] >= matrix[leftIndex - 1][rightIndex])
    ) {
      changes.push({
        rightLineNumber: normalizedRightLines[rightIndex - 1].lineNumber,
        text: normalizedRightLines[rightIndex - 1].text,
        type: "added",
      });
      rightIndex -= 1;
    } else if (leftIndex > 0) {
      changes.push({
        leftLineNumber: normalizedLeftLines[leftIndex - 1].lineNumber,
        text: normalizedLeftLines[leftIndex - 1].text,
        type: "removed",
      });
      leftIndex -= 1;
    }
  }

  return changes.reverse();
}

function prepareLines(input: string, options: DiffCompareOptions): IndexedLine[] {
  return input
    .split(/\r\n|\n|\r/)
    .map((text, index) => ({ lineNumber: index + 1, text }))
    .filter((line) => !options.ignoreBlankLines || line.text.trim().length > 0);
}

export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n|\r/g, "\n");
}

export function trimTrailingWhitespace(input: string): string {
  return input
    .split(/\r\n|\n|\r/)
    .map((line) => line.trimEnd())
    .join("\n");
}

export function exportDiffText(changes: DiffChange[]): string {
  return changes
    .map((change) => {
      const prefix =
        change.type === "added" ? "+" : change.type === "removed" ? "-" : " ";

      return `${prefix} ${change.text}`;
    })
    .join("\n");
}

function normalizeComparableLine(line: string, options: DiffCompareOptions): string {
  return options.ignoreWhitespace ? line.replace(/\s+/g, " ").trim() : line;
}

function createLcsMatrix(leftLines: string[], rightLines: string[]): number[][] {
  const matrix = Array.from({ length: leftLines.length + 1 }, () =>
    Array.from({ length: rightLines.length + 1 }, () => 0),
  );

  for (let leftIndex = 1; leftIndex <= leftLines.length; leftIndex += 1) {
    for (let rightIndex = 1; rightIndex <= rightLines.length; rightIndex += 1) {
      matrix[leftIndex][rightIndex] =
        leftLines[leftIndex - 1] === rightLines[rightIndex - 1]
          ? matrix[leftIndex - 1][rightIndex - 1] + 1
          : Math.max(
              matrix[leftIndex - 1][rightIndex],
              matrix[leftIndex][rightIndex - 1],
            );
    }
  }

  return matrix;
}
