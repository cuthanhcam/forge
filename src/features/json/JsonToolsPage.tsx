import type { ChangeEvent, JSX, KeyboardEvent, ReactNode, UIEvent } from "react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileJson2,
  ListTree,
  Rows3,
  RotateCcw,
  SortAsc,
  TriangleAlert,
  WrapText,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  formatJson,
  minifyJson,
  sortJsonKeys,
  type JsonFormatResult,
  type JsonIndent,
  type JsonStats,
} from "./json.service";

type JsonMode = "format" | "minify" | "sort";
type JsonView = "formatted" | "tree";

const initialJson = `{
  "name": "Forge",
  "local": true,
  "tools": ["json", "markdown", "diff"],
  "release": {
    "channel": "developer",
    "version": 1,
    "features": {
      "format": true,
      "minify": true,
      "sortKeys": true
    }
  }
}`;

export function JsonToolsPage(): JSX.Element {
  const [input, setInput] = useState(initialJson);
  const [mode, setMode] = useState<JsonMode>("format");
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [view, setView] = useState<JsonView>("formatted");
  const [resultLineWrap, setResultLineWrap] = useState(true);
  const result = useMemo(
    () => transformInput(input, mode, indent),
    [indent, input, mode],
  );
  const outputLineCount = result.value ? result.value.split(/\r\n|\n|\r/).length : 0;

  async function copyOutput(): Promise<void> {
    await navigator.clipboard.writeText(result.value);
  }

  function updateFromResult(value: string): void {
    setInput(value);
  }

  function downloadOutput(): void {
    const blob = new Blob([result.value], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = mode === "minify" ? "forge-json.min.json" : "forge-json.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModeButton
              active={mode === "format"}
              icon={<Braces aria-hidden="true" className="h-4 w-4" />}
              label="Format"
              onClick={() => setMode("format")}
            />
            <ModeButton
              active={mode === "minify"}
              icon={<Rows3 aria-hidden="true" className="h-4 w-4" />}
              label="Minify"
              onClick={() => setMode("minify")}
            />
            <ModeButton
              active={mode === "sort"}
              icon={<SortAsc aria-hidden="true" className="h-4 w-4" />}
              label="Sort keys"
              onClick={() => setMode("sort")}
            />
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            <IndentControl
              disabled={mode === "minify"}
              onChange={setIndent}
              value={indent}
            />
          </div>
        }
        right={
          <>
            <StatusPill result={result} />
            <button
              aria-pressed={!resultLineWrap}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-2.5 text-[12px] font-semibold transition",
                !resultLineWrap
                  ? "bg-accent-50 text-accent-700 ring-1 ring-accent-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              onClick={() => setResultLineWrap((current) => !current)}
              type="button"
            >
              <WrapText aria-hidden="true" className="h-4 w-4" />
              Disable line wrap
            </button>
            <Tooltip content="Copy output" side="bottom">
              <Button
                aria-label="Copy output"
                className="h-9 px-3"
                disabled={!result.value}
                onClick={() => void copyOutput()}
                size="sm"
                variant="secondary"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy
              </Button>
            </Tooltip>
            <Tooltip content="Download JSON" side="bottom">
              <Button
                aria-label="Download JSON"
                disabled={!result.value}
                onClick={downloadOutput}
                size="icon"
                variant="ghost"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Clear" side="bottom">
              <Button
                aria-label="Clear"
                onClick={() => setInput("")}
                size="icon"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-accent-600">
                {input.length.toLocaleString()} chars
              </span>
            }
            title="JSON input"
            tone="blue"
          />
          <JsonCodeEditor
            indent={indent}
            label="JSON input"
            lineWrap
            onChange={setInput}
            placeholder="Paste JSON..."
            value={input}
          />
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <ResultHeaderActions lineCount={outputLineCount} stats={result.stats} />
            }
            title={
              <span className="flex min-w-0 items-center gap-2">
                <span>Result</span>
                <OutputTabs disabled={!result.parsed} onChange={setView} value={view} />
              </span>
            }
            tone={result.error ? "rose" : "emerald"}
          />
          {result.error ? (
            <JsonErrorPanel result={result} />
          ) : view === "tree" && result.parsed !== undefined ? (
            <JsonTreeView value={result.parsed} />
          ) : (
            <JsonFormattedView
              indent={indent}
              lineWrap={resultLineWrap}
              onChange={updateFromResult}
              value={result.value}
            />
          )}
        </div>
      </div>
    </ToolSurface>
  );
}

function transformInput(
  input: string,
  mode: JsonMode,
  indent: JsonIndent,
): JsonFormatResult {
  if (mode === "minify") {
    return minifyJson(input);
  }

  if (mode === "sort") {
    return sortJsonKeys(input, indent);
  }

  return formatJson(input, indent);
}

interface ModeButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function ModeButton({ active, icon, label, onClick }: ModeButtonProps): JSX.Element {
  return (
    <Button onClick={onClick} size="sm" variant={active ? "secondary" : "ghost"}>
      {icon}
      {label}
    </Button>
  );
}

interface IndentControlProps {
  disabled: boolean;
  onChange: (value: JsonIndent) => void;
  value: JsonIndent;
}

function IndentControl({ disabled, onChange, value }: IndentControlProps): JSX.Element {
  const options: Array<{ label: string; value: JsonIndent }> = [
    { label: "1 space", value: 1 },
    { label: "2 spaces", value: 2 },
    { label: "3 spaces", value: 3 },
    { label: "4 spaces", value: 4 },
    { label: "6 spaces", value: 6 },
    { label: "8 spaces", value: 8 },
    { label: "Tab", value: "tab" },
  ];
  const selectedLabel = value === "tab" ? "Tab" : String(value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Indent size"
          className={cn(
            "flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950",
            disabled && "pointer-events-none opacity-50",
          )}
          disabled={disabled}
          type="button"
        >
          <Code2 aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">
            {value === "tab" ? "Indent" : "Spaces"}
          </span>
          <span className="text-slate-950">{selectedLabel}</span>
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-50 min-w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
          sideOffset={6}
        >
          {options.map((option) => (
            <DropdownMenu.Item
              className="markdown-menu-item justify-between"
              key={option.label}
              onSelect={() => onChange(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value ? (
                <Check aria-hidden="true" className="h-4 w-4 text-accent-600" />
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface StatusPillProps {
  result: JsonFormatResult;
}

function StatusPill({ result }: StatusPillProps): JSX.Element {
  if (result.error) {
    return (
      <span className="hidden h-9 max-w-[24rem] items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        <span className="truncate">
          Invalid JSON
          {result.errorLine && result.errorColumn
            ? ` at ${result.errorLine}:${result.errorColumn}`
            : ""}
        </span>
      </span>
    );
  }

  return (
    <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      Valid JSON
    </span>
  );
}

interface OutputTabsProps {
  disabled: boolean;
  onChange: (value: JsonView) => void;
  value: JsonView;
}

function OutputTabs({ disabled, onChange, value }: OutputTabsProps): JSX.Element {
  return (
    <div className="flex rounded-md bg-white/80 p-1 normal-case tracking-normal ring-1 ring-inset ring-emerald-100">
      <button
        className={cn(
          "flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-semibold transition",
          value === "formatted"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        onClick={() => onChange("formatted")}
        type="button"
      >
        <FileJson2 aria-hidden="true" className="h-3.5 w-3.5" />
        Text
      </button>
      <button
        className={cn(
          "flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-semibold transition",
          value === "tree"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        disabled={disabled}
        onClick={() => onChange("tree")}
        type="button"
      >
        <ListTree aria-hidden="true" className="h-3.5 w-3.5" />
        Tree
      </button>
    </div>
  );
}

interface JsonFormattedViewProps {
  indent: JsonIndent;
  lineWrap: boolean;
  onChange: (value: string) => void;
  value: string;
}

function JsonFormattedView({
  indent,
  lineWrap,
  onChange,
  value,
}: JsonFormattedViewProps): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {value ? (
        <JsonCodeEditor
          indent={indent}
          label="Editable formatted JSON output"
          lineWrap={lineWrap}
          onChange={onChange}
          value={value}
        />
      ) : (
        <EmptyResult />
      )}
    </div>
  );
}

function ResultHeaderActions({
  lineCount,
  stats,
}: {
  lineCount: number;
  stats?: JsonStats;
}): JSX.Element | null {
  if (!stats) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
      <span>{lineCount.toLocaleString()} lines</span>
      <span className="h-1 w-1 rounded-full bg-emerald-300" />
      <span>{stats.objects.toLocaleString()} objects</span>
      <span>{stats.arrays.toLocaleString()} arrays</span>
      <span>{stats.keys.toLocaleString()} keys</span>
    </div>
  );
}

interface JsonCodeEditorProps {
  indent: JsonIndent;
  label: string;
  lineWrap: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

function JsonCodeEditor({
  indent,
  label,
  lineWrap,
  onChange,
  placeholder,
  value,
}: JsonCodeEditorProps): JSX.Element {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const lines = useMemo(() => value.split(/\r\n|\n|\r/), [value]);
  const tabSize = indent === "tab" ? 4 : indent;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    onChange(event.target.value);
  }

  function handleScroll(event: UIEvent<HTMLTextAreaElement>): void {
    const { scrollLeft, scrollTop } = event.currentTarget;

    setScroll({ left: scrollLeft, top: scrollTop });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const editor = event.currentTarget;
    const indentText = getIndentText(indent);
    const nextEdit = event.shiftKey
      ? unindentJsonText(value, editor.selectionStart, editor.selectionEnd, indentText)
      : indentJsonText(value, editor.selectionStart, editor.selectionEnd, indentText);

    onChange(nextEdit.value);
    window.requestAnimationFrame(() => {
      editor.setSelectionRange(nextEdit.selectionStart, nextEdit.selectionEnd);
    });
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="min-h-full min-w-full font-mono text-[13px] leading-6"
          style={{
            tabSize,
            transform: `translateY(${-scroll.top}px)`,
          }}
        >
          {lines.map((line, index) => (
            <div
              className="grid min-h-6 grid-cols-[4rem_minmax(0,1fr)]"
              key={`${index}-${line}`}
            >
              <span className="select-none border-r border-slate-100 bg-slate-50/70 pr-3 text-right text-[12px] text-slate-400">
                {index + 1}
              </span>
              <span className="min-w-0 overflow-hidden px-4">
                <span
                  className={cn(
                    "block",
                    lineWrap
                      ? "min-w-0 whitespace-pre-wrap break-words"
                      : "w-max whitespace-pre",
                  )}
                  style={{
                    transform: lineWrap ? undefined : `translateX(${-scroll.left}px)`,
                  }}
                >
                  {highlightJsonLine(line, index)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <label className="relative block h-full min-h-0 bg-transparent">
        <span className="sr-only">{label}</span>
        <textarea
          className={cn(
            "scrollbar-forge relative h-full min-h-0 w-full resize-none border-0 bg-transparent py-0 pl-[5rem] pr-4 font-mono text-[13px] leading-6 text-transparent caret-slate-950 outline-none placeholder:text-slate-400 selection:bg-accent-200/70 selection:text-transparent",
            lineWrap ? "overflow-auto" : "overflow-auto whitespace-pre",
          )}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          style={{ tabSize }}
          value={value}
          wrap={lineWrap ? "soft" : "off"}
        />
      </label>
    </div>
  );
}

interface TextEditResult {
  selectionEnd: number;
  selectionStart: number;
  value: string;
}

function getIndentText(indent: JsonIndent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

function indentJsonText(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentText: string,
): TextEditResult {
  if (selectionStart === selectionEnd) {
    return {
      selectionEnd: selectionEnd + indentText.length,
      selectionStart: selectionStart + indentText.length,
      value: `${value.slice(0, selectionStart)}${indentText}${value.slice(selectionEnd)}`,
    };
  }

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const block = value.slice(lineStart, selectionEnd);
  const indentedBlock = block.replace(/^/gm, indentText);
  const added = indentedBlock.length - block.length;

  return {
    selectionEnd: selectionEnd + added,
    selectionStart: selectionStart + indentText.length,
    value: `${value.slice(0, lineStart)}${indentedBlock}${value.slice(selectionEnd)}`,
  };
}

function unindentJsonText(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  indentText: string,
): TextEditResult {
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const blockEnd =
    selectionStart === selectionEnd ? getLineEnd(value, selectionEnd) : selectionEnd;
  const block = value.slice(lineStart, blockEnd);
  let removedBeforeSelection = 0;
  let removedTotal = 0;
  const unindentedBlock = block.replace(/^[\t ]+/gm, (match, offset) => {
    const removable = match.startsWith(indentText)
      ? indentText.length
      : Math.min(match.length, indentText.length);

    if (lineStart + offset < selectionStart) {
      removedBeforeSelection += removable;
    }

    removedTotal += removable;

    return match.slice(removable);
  });

  return {
    selectionEnd: Math.max(selectionStart, selectionEnd - removedTotal),
    selectionStart: Math.max(lineStart, selectionStart - removedBeforeSelection),
    value: `${value.slice(0, lineStart)}${unindentedBlock}${value.slice(blockEnd)}`,
  };
}

function getLineEnd(value: string, position: number): number {
  const lineEnd = value.indexOf("\n", position);

  return lineEnd === -1 ? value.length : lineEnd;
}

function highlightJsonLine(line: string, lineIndex: number): JSX.Element[] {
  return line
    .split(
      /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    )
    .map((part, index) => {
      const className =
        /^"(?:\\.|[^"\\])*"$/.test(part) && line.includes(`${part}:`)
          ? "text-accent-700"
          : /^"/.test(part)
            ? "text-emerald-700"
            : /^(true|false|null)$/.test(part)
              ? "font-semibold text-violet-700"
              : /^-?\d/.test(part)
                ? "text-orange-700"
                : "text-slate-900";

      return (
        <span className={className} key={`${lineIndex}-${part}-${index}`}>
          {part || "\u00a0"}
        </span>
      );
    });
}

function JsonErrorPanel({ result }: { result: JsonFormatResult }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <div className="flex items-start gap-3">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">Invalid JSON</p>
            <p className="mt-1 break-words font-mono text-[13px] leading-5">
              {result.error}
            </p>
            {result.errorLine && result.errorColumn ? (
              <p className="mt-3 text-[12px] font-semibold text-rose-700">
                Line {result.errorLine}, column {result.errorColumn}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonTreeView({ value }: { value: unknown }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4 font-mono text-[13px] leading-6">
      <JsonTreeNode name="root" value={value} />
    </div>
  );
}

interface JsonTreeNodeProps {
  name?: string;
  value: unknown;
}

function JsonTreeNode({ name, value }: JsonTreeNodeProps): JSX.Element {
  const [open, setOpen] = useState(true);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === "object" && !isArray;
  const entries: Array<[string, unknown]> = isArray
    ? (value as unknown[]).map((item, index) => [String(index), item])
    : isObject
      ? Object.entries(value as Record<string, unknown>)
      : [];
  const isExpandable = entries.length > 0;

  if (!isExpandable) {
    return (
      <div className="flex min-w-0 items-start gap-2">
        <TreeName name={name} />
        <JsonScalar value={value} />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <button
        className="flex min-w-0 items-center gap-1 rounded px-1 text-left hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition",
            open && "rotate-90",
          )}
        />
        <TreeName name={name} />
        <span className="text-slate-500">
          {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
        </span>
      </button>
      {open ? (
        <div className="ml-4 border-l border-slate-100 pl-3">
          {entries.map(([key, item]) => (
            <JsonTreeNode key={key} name={key} value={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TreeName({ name }: { name?: string }): JSX.Element | null {
  if (!name) {
    return null;
  }

  return <span className="font-semibold text-accent-700">{name}:</span>;
}

function JsonScalar({ value }: { value: unknown }): JSX.Element {
  if (value === null) {
    return <span className="font-semibold text-violet-700">null</span>;
  }

  if (typeof value === "string") {
    return <span className="break-all text-emerald-700">"{value}"</span>;
  }

  if (typeof value === "number") {
    return <span className="text-orange-700">{value}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="font-semibold text-violet-700">{String(value)}</span>;
  }

  return <span className="text-slate-500">{typeof value}</span>;
}

function EmptyResult(): JSX.Element {
  return (
    <div className="flex min-h-64 items-center justify-center p-8 text-center text-[13px] font-medium text-slate-400">
      Paste JSON to format, validate, minify, sort, or inspect it.
    </div>
  );
}
