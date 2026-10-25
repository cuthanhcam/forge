import type { JSX, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from "lucide-react";
import { usePersistedToolState } from "@/core/storage/use-persisted-tool-state";
import { NumberedTextarea } from "@/shared/components/NumberedTextarea";
import { useAlignedDiffRows } from "./use-aligned-diff-rows";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { DiffCheckerStateSchema, type DiffCheckerState } from "./diff-checker.schema";
import {
  compareTextLines,
  createDiffCheckerState,
  exportDiffText,
  normalizeDiffCheckerState,
  type DiffChange,
} from "./diff-checker.service";

const syntaxOptions = ["Plain text", "Markdown", "JSON", "TypeScript", "HTML"];
const syntaxDescriptions: Record<string, string> = {
  HTML: "Tags and comments",
  JSON: "Strings, numbers, booleans",
  Markdown: "Headings and lists",
  "Plain text": "No highlighting",
  TypeScript: "Keywords and strings",
};

export function DiffCheckerPage(): JSX.Element {
  const [storedState, setState] = usePersistedToolState<DiffCheckerState>(
    "diff-checker",
    createDiffCheckerState(),
  );
  const parsedState = DiffCheckerStateSchema.safeParse(storedState);
  const state = parsedState.success
    ? normalizeDiffCheckerState(parsedState.data)
    : createDiffCheckerState();
  const changes = useMemo(
    () =>
      compareTextLines(state.left, state.right, {
        ignoreBlankLines: state.ignoreBlankLines,
        ignoreWhitespace: state.hideWhitespace,
      }),
    [state.hideWhitespace, state.ignoreBlankLines, state.left, state.right],
  );
  const visibleChanges = useMemo(
    () =>
      state.hideUnchanged
        ? changes.filter((change) => change.type !== "unchanged")
        : changes,
    [changes, state.hideUnchanged],
  );
  const additions = changes.filter((change) => change.type === "added").length;
  const removals = changes.filter((change) => change.type === "removed").length;
  const leftLineCount = state.left.split(/\r\n|\n|\r/).length;
  const rightLineCount = state.right.split(/\r\n|\n|\r/).length;

  function updateState(nextState: DiffCheckerState): void {
    setState(nextState);
  }

  function patchState(patch: Partial<DiffCheckerState>): void {
    updateState({ ...state, ...patch });
  }

  function clearDiff(): void {
    patchState({ left: "", right: "" });
  }

  function swapSides(): void {
    patchState({ left: state.right, right: state.left });
  }

  async function copyDiff(): Promise<void> {
    await navigator.clipboard.writeText(exportDiffText(changes));
  }

  async function copyLeft(): Promise<void> {
    await navigator.clipboard.writeText(state.left);
  }

  async function copyRight(): Promise<void> {
    await navigator.clipboard.writeText(state.right);
  }

  function exportDiff(): void {
    const blob = new Blob([exportDiffText(changes)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-diff.diff";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03] lg:flex-row">
      <aside
        aria-label="Diff options"
        className={cn(
          "flex max-h-64 min-h-0 min-w-0 w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50/70 transition-[width] duration-200 motion-reduce:transition-none lg:max-h-none lg:border-b-0 lg:border-r",
          state.optionsCollapsed ? "lg:w-12" : "lg:w-56 xl:w-64",
        )}
      >
        <div
          aria-hidden={state.optionsCollapsed}
          inert={state.optionsCollapsed}
          className={cn(
            "scrollbar-forge min-h-0 flex-1 space-y-4 overflow-y-auto p-3",
            state.optionsCollapsed && "hidden",
          )}
          id="diff-options"
        >
          <OptionGroup>
            <ToggleRow
              checked={state.hideWhitespace}
              label="Hide whitespace changes"
              onChange={() => patchState({ hideWhitespace: !state.hideWhitespace })}
            />
            <ToggleRow
              checked={state.hideUnchanged}
              label="Hide unchanged lines"
              onChange={() => patchState({ hideUnchanged: !state.hideUnchanged })}
            />
            <ToggleRow
              checked={state.ignoreBlankLines}
              label="Ignore blank lines"
              onChange={() => patchState({ ignoreBlankLines: !state.ignoreBlankLines })}
            />
            <ToggleRow
              checked={!state.lineWrap}
              label="Disable line wrap"
              onChange={() => patchState({ lineWrap: !state.lineWrap })}
            />
            <ToggleRow
              checked={state.syncScroll}
              label="Sync scroll"
              onChange={() => patchState({ syncScroll: !state.syncScroll })}
            />
          </OptionGroup>

          <OptionGroup label="Layout">
            <SegmentedControl
              options={[
                { label: "Split", value: "split" },
                { label: "Unified", value: "unified" },
              ]}
              value={state.layout}
              onChange={(value) =>
                patchState({ layout: value as DiffCheckerState["layout"] })
              }
            />
          </OptionGroup>

          <OptionGroup label="Syntax highlighting">
            <SyntaxFlyout
              onChange={(syntax) => patchState({ syntax })}
              value={state.syntax}
            />
          </OptionGroup>
        </div>
        <div className="flex h-11 shrink-0 items-center justify-end px-1.5 lg:mt-auto">
          <span className="mr-auto px-1 text-xs font-medium text-slate-500 lg:hidden">
            Options
          </span>
          <Tooltip
            content={state.optionsCollapsed ? "Expand options" : "Collapse options"}
            side="right"
          >
            <button
              aria-label={
                state.optionsCollapsed ? "Expand diff options" : "Collapse diff options"
              }
              aria-controls="diff-options"
              aria-expanded={!state.optionsCollapsed}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
              onClick={() => patchState({ optionsCollapsed: !state.optionsCollapsed })}
              type="button"
            >
              {state.optionsCollapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="scrollbar-forge flex min-h-14 min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3">
          <div className="min-w-0 flex-1" />

          <div className="flex shrink-0 items-center gap-1">
            <Button
              className="h-9 px-3"
              onClick={() => patchState({ inputVisible: !state.inputVisible })}
              size="sm"
              variant={state.inputVisible ? "secondary" : "ghost"}
            >
              <Edit3 aria-hidden="true" className="h-4 w-4" />
              {state.inputVisible ? "View" : "Edit"}
            </Button>
            <Button className="h-9 px-3" onClick={clearDiff} size="sm" variant="ghost">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear
            </Button>
            <TooltipButton label="Swap sides" onClick={swapSides}>
              <ArrowLeftRight aria-hidden="true" className="h-4 w-4" />
            </TooltipButton>
            <TooltipButton label="Copy diff" onClick={() => void copyDiff()}>
              <Copy aria-hidden="true" className="h-4 w-4" />
            </TooltipButton>
            <Button
              className="h-9 px-3"
              onClick={exportDiff}
              size="sm"
              variant="secondary"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        {state.inputVisible ? (
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-2">
            <DiffInputPane
              label="Original text"
              lineWrap={state.lineWrap}
              onChange={(value) => patchState({ left: value })}
              tone="removed"
              value={state.left}
            />
            <DiffInputPane
              label="Changed text"
              lineWrap={state.lineWrap}
              onChange={(value) => patchState({ right: value })}
              tone="added"
              value={state.right}
            />
          </div>
        ) : state.layout === "split" ? (
          <SplitDiffView
            additions={additions}
            changes={visibleChanges}
            leftLineCount={leftLineCount}
            lineWrap={state.lineWrap}
            onCopyLeft={() => void copyLeft()}
            onCopyRight={() => void copyRight()}
            removals={removals}
            rightLineCount={rightLineCount}
            syncScroll={state.syncScroll}
            syntax={state.syntax}
          />
        ) : (
          <UnifiedDiffView
            changes={visibleChanges}
            lineWrap={state.lineWrap}
            onCopy={() => void copyDiff()}
            syntax={state.syntax}
          />
        )}
      </div>
    </section>
  );
}

interface DiffInputPaneProps {
  label: string;
  lineWrap: boolean;
  onChange: (value: string) => void;
  tone: "added" | "removed";
  value: string;
}

function DiffInputPane({
  label,
  lineWrap,
  onChange,
  tone,
  value,
}: DiffInputPaneProps): JSX.Element {
  return (
    <section
      aria-label={`${label} editor`}
      className="flex min-h-0 min-w-0 flex-col border-t border-slate-200 lg:border-l lg:border-t-0 first:lg:border-l-0"
    >
      <div
        className={cn(
          "flex min-h-11 shrink-0 items-center justify-between gap-2 border-b px-4 text-[12px] font-semibold",
          tone === "removed"
            ? "border-red-100 bg-red-50/80 text-red-700"
            : "border-emerald-100 bg-emerald-50/70 text-emerald-700",
        )}
      >
        <span>{label}</span>
        <span className="font-normal text-slate-500">
          {value.split(/\r\n|\r|\n/).length} lines
        </span>
      </div>
      <NumberedTextarea
        label={label}
        lineWrap={lineWrap}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </section>
  );
}

interface SplitDiffViewProps {
  additions: number;
  changes: DiffChange[];
  leftLineCount: number;
  lineWrap: boolean;
  onCopyLeft: () => void;
  onCopyRight: () => void;
  removals: number;
  rightLineCount: number;
  syncScroll: boolean;
  syntax: string;
}

function SplitDiffView({
  additions,
  changes,
  leftLineCount,
  lineWrap,
  onCopyLeft,
  onCopyRight,
  removals,
  rightLineCount,
  syncScroll: syncScrollEnabled,
  syntax,
}: SplitDiffViewProps): JSX.Element {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const expectedScroll = useRef(new WeakMap<HTMLDivElement, number>());
  useAlignedDiffRows(leftScrollRef, rightScrollRef, changes, lineWrap, syntax);

  function syncScroll(source: HTMLDivElement, target: HTMLDivElement): void {
    // Ignore the actual rounded/clamped target position, including delayed scroll events.
    if (expectedScroll.current.get(source) === source.scrollTop) return;
    expectedScroll.current.delete(source);
    if (!syncScrollEnabled) return;

    const sourceScrollable = Math.max(0, source.scrollHeight - source.clientHeight);
    const targetScrollable = Math.max(0, target.scrollHeight - target.clientHeight);
    const ratio = sourceScrollable <= 0 ? 0 : source.scrollTop / sourceScrollable;

    target.scrollTop = targetScrollable * ratio;
    expectedScroll.current.set(target, target.scrollTop);
  }

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-2">
      <div className="flex min-h-0 flex-col">
        <DiffPaneHeader
          count={`${leftLineCount} lines`}
          label={`${removals} removals`}
          onCopy={onCopyLeft}
          tone="removed"
        />
        <div
          className="scrollbar-forge min-h-0 flex-1 overflow-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
          onScroll={(event) => {
            if (rightScrollRef.current) {
              syncScroll(event.currentTarget, rightScrollRef.current);
            }
          }}
          aria-label="Original comparison"
          role="region"
          tabIndex={0}
          ref={leftScrollRef}
        >
          {changes.map((change, index) => (
            <SplitLine
              change={change.type === "added" ? undefined : change}
              index={index}
              key={`left-${index}`}
              lineWrap={lineWrap}
              nextSame={isSameVisibleType(changes[index + 1], change, "left")}
              pairedText={
                change.type === "removed" && changes[index + 1]?.type === "added"
                  ? changes[index + 1]?.text
                  : undefined
              }
              previousSame={isSameVisibleType(changes[index - 1], change, "left")}
              side="left"
              syntax={syntax}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
        <DiffPaneHeader
          count={`${rightLineCount} lines`}
          label={`${additions} additions`}
          onCopy={onCopyRight}
          tone="added"
        />
        <div
          className="scrollbar-forge min-h-0 flex-1 overflow-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
          onScroll={(event) => {
            if (leftScrollRef.current) {
              syncScroll(event.currentTarget, leftScrollRef.current);
            }
          }}
          aria-label="Changed comparison"
          role="region"
          tabIndex={0}
          ref={rightScrollRef}
        >
          {changes.map((change, index) => (
            <SplitLine
              change={change.type === "removed" ? undefined : change}
              index={index}
              key={`right-${index}`}
              lineWrap={lineWrap}
              nextSame={isSameVisibleType(changes[index + 1], change, "right")}
              pairedText={
                change.type === "added" && changes[index - 1]?.type === "removed"
                  ? changes[index - 1]?.text
                  : undefined
              }
              previousSame={isSameVisibleType(changes[index - 1], change, "right")}
              side="right"
              syntax={syntax}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface UnifiedDiffViewProps {
  changes: DiffChange[];
  lineWrap: boolean;
  onCopy: () => void;
  syntax: string;
}

function UnifiedDiffView({
  changes,
  lineWrap,
  onCopy,
  syntax,
}: UnifiedDiffViewProps): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DiffPaneHeader
        count={`${changes.length} lines`}
        label="Unified diff"
        onCopy={onCopy}
        tone="neutral"
      />
      <div
        aria-label="Unified comparison"
        role="region"
        tabIndex={0}
        className="scrollbar-forge min-h-0 flex-1 overflow-auto p-2 font-mono text-[13px] leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
      >
        {changes.map((change, index) => (
          <div
            className={cn(
              "grid min-h-7 min-w-full grid-cols-[5.25rem_minmax(0,1fr)] px-2",
              !lineWrap && "w-max",
              getChangeClass(
                change.type,
                changes[index - 1]?.type === change.type,
                changes[index + 1]?.type === change.type,
              ),
            )}
            id={change.type !== "unchanged" ? `diff-change-${index}` : undefined}
            key={`${change.type}-${index}`}
          >
            <span className="select-none text-slate-400">
              {change.leftLineNumber ?? ""}:{change.rightLineNumber ?? ""}
            </span>
            <span
              className={cn(
                lineWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
              )}
            >
              {change.type === "added" ? "+ " : change.type === "removed" ? "- " : "  "}
              <DiffLineText
                pairedText={
                  change.type === "removed" && changes[index + 1]?.type === "added"
                    ? changes[index + 1]?.text
                    : change.type === "added" && changes[index - 1]?.type === "removed"
                      ? changes[index - 1]?.text
                      : undefined
                }
                syntax={syntax}
                text={change.text || " "}
                type={change.type}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SplitLineProps {
  change?: DiffChange;
  index: number;
  lineWrap: boolean;
  nextSame: boolean;
  pairedText?: string;
  previousSame: boolean;
  side: "left" | "right";
  syntax: string;
}

function SplitLine({
  change,
  index,
  lineWrap,
  nextSame,
  pairedText,
  previousSame,
  side,
  syntax,
}: SplitLineProps): JSX.Element {
  const lineNumber = side === "left" ? change?.leftLineNumber : change?.rightLineNumber;

  return (
    <div
      data-diff-row=""
      className={cn(
        "grid min-h-7 min-w-full grid-cols-[4.75rem_minmax(0,1fr)] px-2 font-mono text-[13px] leading-6",
        !lineWrap && "w-max",
        change
          ? getChangeClass(change.type, previousSame, nextSame)
          : "bg-[repeating-linear-gradient(135deg,#ffffff_0,#ffffff_5px,#f8fafc_5px,#f8fafc_10px)] text-slate-300",
      )}
      id={
        change && change.type !== "unchanged" ? `diff-${side}-change-${index}` : undefined
      }
    >
      <span className="select-none text-right text-slate-500">{lineNumber ?? ""}</span>
      <span
        className={cn(
          "min-w-0 pl-4",
          lineWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        )}
      >
        {change ? (
          <DiffLineText
            pairedText={pairedText}
            syntax={syntax}
            text={change.text || " "}
            type={change.type}
          />
        ) : (
          " "
        )}
      </span>
    </div>
  );
}

interface DiffPaneHeaderProps {
  count: string;
  label: string;
  onCopy: () => void;
  tone: "added" | "neutral" | "removed";
}

function DiffPaneHeader({
  count,
  label,
  onCopy,
  tone,
}: DiffPaneHeaderProps): JSX.Element {
  return (
    <div className="flex min-h-12 items-center gap-3 border-b border-slate-200 px-4">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold",
          tone === "removed" && "border-red-200 text-red-700",
          tone === "added" && "border-emerald-200 text-emerald-700",
          tone === "neutral" && "border-slate-300 text-slate-500",
        )}
      >
        {tone === "removed" ? "-" : tone === "added" ? "+" : "="}
      </span>
      <p
        className={cn(
          "font-semibold",
          tone === "removed" && "text-red-700",
          tone === "added" && "text-emerald-700",
          tone === "neutral" && "text-slate-700",
        )}
      >
        {label}
      </p>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[12px] font-medium text-slate-400">{count}</span>
        <button
          aria-label={
            tone === "removed"
              ? "Copy original text"
              : tone === "added"
                ? "Copy changed text"
                : "Copy unified diff"
          }
          className="rounded-sm text-[13px] font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
          onClick={onCopy}
          type="button"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

interface OptionGroupProps {
  children: ReactNode;
  label?: string;
}

function OptionGroup({ children, label }: OptionGroupProps): JSX.Element {
  return (
    <div className="space-y-2">
      {label ? <p className="text-[11px] font-semibold text-slate-400">{label}</p> : null}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface ToggleRowProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

function ToggleRow({ checked, label, onChange }: ToggleRowProps): JSX.Element {
  return (
    <button
      aria-pressed={checked}
      className="grid w-full grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md text-left text-[13px] font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
      onClick={onChange}
      type="button"
    >
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={cn(
          "flex h-5 w-10 items-center rounded-full p-0.5 transition",
          checked ? "bg-accent-100 ring-1 ring-accent-200" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full shadow-sm transition",
            checked ? "translate-x-5 bg-accent-600" : "bg-white",
          )}
        />
      </span>
    </button>
  );
}

interface SegmentedControlProps {
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}

function SegmentedControl({
  onChange,
  options,
  value,
}: SegmentedControlProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 has-[button:nth-child(3)]:grid-cols-3">
      {options.map((option) => (
        <button
          className={cn(
            "h-8 rounded-md text-[13px] font-semibold transition",
            value === option.value
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-950",
          )}
          aria-pressed={value === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SyntaxFlyoutProps {
  onChange: (syntax: string) => void;
  value: string;
}

function SyntaxFlyout({ onChange, value }: SyntaxFlyoutProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: PointerEvent): void {
      if (event.target instanceof Node && !flyoutRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  function selectSyntax(syntax: string): void {
    onChange(syntax);
    setOpen(false);
  }

  return (
    <div className="relative" ref={flyoutRef}>
      <button
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-md border bg-white px-3 text-left transition",
          open
            ? "border-accent-200 ring-2 ring-accent-100"
            : "border-slate-200 hover:border-accent-200 hover:bg-accent-50",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-slate-800">
            {value}
          </span>
          <span className="block truncate text-[11px] font-medium text-slate-400">
            {syntaxDescriptions[value] ?? "Syntax"}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 text-slate-400 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10">
          {syntaxOptions.map((syntax) => (
            <button
              className={cn(
                "flex min-h-10 w-full items-center justify-between gap-2 rounded px-2 text-left transition",
                value === syntax
                  ? "bg-accent-50 text-accent-700"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
              )}
              key={syntax}
              onClick={() => selectSyntax(syntax)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold">{syntax}</span>
                <span className="block text-[11px] font-medium text-slate-400">
                  {syntaxDescriptions[syntax]}
                </span>
              </span>
              {value === syntax ? (
                <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface TooltipButtonProps {
  children: ReactNode;
  label: string;
  onClick: () => void;
}

interface HighlightedTextProps {
  syntax: string;
  text: string;
}

interface DiffLineTextProps {
  pairedText?: string;
  syntax: string;
  text: string;
  type: DiffChange["type"];
}

function DiffLineText({
  pairedText,
  syntax,
  text,
  type,
}: DiffLineTextProps): JSX.Element {
  const range =
    pairedText && type !== "unchanged"
      ? getInlineDifferenceRange(text, pairedText)
      : null;

  if (!range) {
    return <HighlightedText syntax={syntax} text={text} />;
  }

  const highlightClass =
    type === "removed"
      ? "rounded bg-red-200/80 px-0.5 font-semibold text-red-950"
      : "rounded bg-emerald-200/80 px-0.5 font-semibold text-emerald-950";

  return (
    <>
      <HighlightedText syntax={syntax} text={text.slice(0, range.start)} />
      <span className={highlightClass}>
        <HighlightedText syntax={syntax} text={text.slice(range.start, range.end)} />
      </span>
      <HighlightedText syntax={syntax} text={text.slice(range.end)} />
    </>
  );
}

function getInlineDifferenceRange(
  value: string,
  pairedValue: string,
): { end: number; start: number } | null {
  let start = 0;
  const shortestLength = Math.min(value.length, pairedValue.length);

  while (start < shortestLength && value[start] === pairedValue[start]) {
    start += 1;
  }

  let valueEnd = value.length;
  let pairedEnd = pairedValue.length;

  while (
    valueEnd > start &&
    pairedEnd > start &&
    value[valueEnd - 1] === pairedValue[pairedEnd - 1]
  ) {
    valueEnd -= 1;
    pairedEnd -= 1;
  }

  return valueEnd > start ? { end: valueEnd, start } : null;
}

function HighlightedText({ syntax, text }: HighlightedTextProps): JSX.Element {
  if (syntax === "JSON") {
    return <>{highlightJsonLine(text)}</>;
  }

  if (syntax === "HTML") {
    return <>{highlightHtmlLine(text)}</>;
  }

  if (syntax === "TypeScript") {
    return <>{highlightTypeScriptLine(text)}</>;
  }

  if (syntax === "Markdown") {
    return <>{highlightMarkdownLine(text)}</>;
  }

  return <>{text}</>;
}

function highlightJsonLine(text: string): JSX.Element[] {
  return text
    .split(/("(?:\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?)/g)
    .map((part, index) => {
      const className = /^"/.test(part)
        ? "text-emerald-800"
        : /^(true|false|null)$/.test(part)
          ? "font-semibold text-violet-800"
          : /^-?\d/.test(part)
            ? "text-orange-800"
            : "text-inherit";

      return (
        <span className={className} key={`${part}-${index}`}>
          {part}
        </span>
      );
    });
}

function highlightHtmlLine(text: string): JSX.Element[] {
  return text.split(/(<\/?[A-Za-z][^>]*>|<!--.*?-->)/g).map((part, index) => {
    const className = part.startsWith("<!--")
      ? "text-slate-500 italic"
      : part.startsWith("<")
        ? "font-semibold text-accent-800"
        : "text-inherit";

    return (
      <span className={className} key={`${part}-${index}`}>
        {part}
      </span>
    );
  });
}

function highlightTypeScriptLine(text: string): JSX.Element[] {
  return text
    .split(
      /(\b(?:const|let|var|function|return|type|interface|import|export|from|if|else|await|async)\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
    )
    .map((part, index) => {
      const className =
        /^(const|let|var|function|return|type|interface|import|export|from|if|else|await|async)$/.test(
          part,
        )
          ? "font-semibold text-violet-800"
          : /^["']/.test(part)
            ? "text-emerald-800"
            : "text-inherit";

      return (
        <span className={className} key={`${part}-${index}`}>
          {part}
        </span>
      );
    });
}

function highlightMarkdownLine(text: string): JSX.Element {
  if (/^#{1,6}\s/.test(text)) {
    return <span className="font-semibold text-slate-950">{text}</span>;
  }

  if (/^\s*[-*+]\s/.test(text)) {
    return <span className="text-accent-900">{text}</span>;
  }

  return <>{text}</>;
}

function TooltipButton({ children, label, onClick }: TooltipButtonProps): JSX.Element {
  return (
    <Tooltip content={label} side="bottom">
      <Button aria-label={label} onClick={onClick} size="icon" variant="ghost">
        {children}
      </Button>
    </Tooltip>
  );
}

function isSameVisibleType(
  candidate: DiffChange | undefined,
  current: DiffChange,
  side: "left" | "right",
): boolean {
  if (!candidate || candidate.type !== current.type) {
    return false;
  }

  if (side === "left") {
    return current.type !== "added";
  }

  return current.type !== "removed";
}

function getChangeClass(
  type: DiffChange["type"],
  previousSame = false,
  nextSame = false,
): string {
  const blockShape = cn(
    previousSame ? "rounded-t-none border-t-0" : "rounded-t-md",
    nextSame ? "rounded-b-none border-b-0" : "rounded-b-md",
  );

  if (type === "added") {
    return cn("border border-emerald-100 bg-emerald-50 text-emerald-950", blockShape);
  }

  if (type === "removed") {
    return cn("border border-red-100 bg-red-50 text-red-950", blockShape);
  }

  return "border border-transparent text-slate-700";
}
