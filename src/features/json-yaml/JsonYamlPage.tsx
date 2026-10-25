import type { ChangeEvent, JSX, KeyboardEvent, ReactNode, UIEvent } from "react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileJson2,
  ListTree,
  RotateCcw,
  TriangleAlert,
  WrapText,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  convertJsonYaml,
  type JsonYamlDirection,
  type JsonYamlIndent,
  type JsonYamlResult,
  type JsonYamlStats,
} from "./json-yaml.service";

type ConverterView = "text" | "tree";
type SyntaxKind = "json" | "yaml";

const initialJson = `{
  "name": "Forge",
  "local": true,
  "tools": ["json", "yaml", "diff"],
  "release": {
    "channel": "developer",
    "features": {
      "convert": true,
      "treeView": true
    }
  }
}`;

export function JsonYamlPage(): JSX.Element {
  const [direction, setDirection] = useState<JsonYamlDirection>("json-to-yaml");
  const [input, setInput] = useState(initialJson);
  const [indent, setIndent] = useState<JsonYamlIndent>(2);
  const [view, setView] = useState<ConverterView>("text");
  const [resultLineWrap, setResultLineWrap] = useState(true);
  const result = useMemo(
    () => convertJsonYaml(input, direction, indent),
    [direction, indent, input],
  );
  const outputLineCount = result.value ? result.value.split(/\r\n|\n|\r/).length : 0;
  const inputSyntax = direction === "json-to-yaml" ? "json" : "yaml";
  const outputSyntax = direction === "json-to-yaml" ? "yaml" : "json";

  function swapDirection(): void {
    setDirection((value) => (value === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml"));

    if (result.value) {
      setInput(result.value);
    }
  }

  async function copyOutput(): Promise<void> {
    await navigator.clipboard.writeText(result.value);
  }

  function downloadOutput(): void {
    const blob = new Blob([result.value], {
      type:
        direction === "json-to-yaml"
          ? "application/yaml;charset=utf-8"
          : "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      direction === "json-to-yaml" ? "forge-data.yaml" : "forge-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DirectionButton
              active={direction === "json-to-yaml"}
              icon={<FileJson2 aria-hidden="true" className="h-4 w-4" />}
              label="JSON to YAML"
              onClick={() => setDirection("json-to-yaml")}
            />
            <DirectionButton
              active={direction === "yaml-to-json"}
              icon={<FileCode2 aria-hidden="true" className="h-4 w-4" />}
              label="YAML to JSON"
              onClick={() => setDirection("yaml-to-json")}
            />
            <Tooltip
              content="Swap direction and use current output as input"
              side="bottom"
            >
              <Button
                aria-label="Swap direction"
                disabled={!result.value}
                onClick={swapDirection}
                size="icon"
                variant="ghost"
              >
                <ArrowLeftRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            <IndentControl onChange={setIndent} value={indent} />
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
            <Tooltip content="Download output" side="bottom">
              <Button
                aria-label="Download output"
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
            title={direction === "json-to-yaml" ? "JSON input" : "YAML input"}
            tone={direction === "json-to-yaml" ? "blue" : "violet"}
          />
          <CodeEditor
            indent={indent}
            label="Converter input"
            lineWrap
            onChange={setInput}
            placeholder={direction === "json-to-yaml" ? "Paste JSON..." : "Paste YAML..."}
            syntax={inputSyntax}
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
                <span>
                  {direction === "json-to-yaml" ? "YAML output" : "JSON output"}
                </span>
                <OutputTabs disabled={!result.parsed} onChange={setView} value={view} />
              </span>
            }
            tone={result.error ? "rose" : "emerald"}
          />
          {result.error ? (
            <ErrorPanel result={result} />
          ) : view === "tree" && result.parsed !== undefined ? (
            <TreeView value={result.parsed} />
          ) : (
            <ResultText
              indent={indent}
              lineWrap={resultLineWrap}
              syntax={outputSyntax}
              value={result.value}
            />
          )}
        </div>
      </div>
    </ToolSurface>
  );
}

interface DirectionButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function DirectionButton({
  active,
  icon,
  label,
  onClick,
}: DirectionButtonProps): JSX.Element {
  return (
    <Button onClick={onClick} size="sm" variant={active ? "secondary" : "ghost"}>
      {icon}
      {label}
    </Button>
  );
}

interface IndentControlProps {
  onChange: (value: JsonYamlIndent) => void;
  value: JsonYamlIndent;
}

function IndentControl({ onChange, value }: IndentControlProps): JSX.Element {
  const options: Array<{ label: string; value: JsonYamlIndent }> = [
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
          className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
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

function StatusPill({ result }: { result: JsonYamlResult }): JSX.Element {
  if (result.error) {
    return (
      <span className="hidden h-9 max-w-[24rem] items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        <span className="truncate">
          Conversion error
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
      Ready
    </span>
  );
}

interface OutputTabsProps {
  disabled: boolean;
  onChange: (value: ConverterView) => void;
  value: ConverterView;
}

function OutputTabs({ disabled, onChange, value }: OutputTabsProps): JSX.Element {
  return (
    <div className="flex rounded-md bg-white/80 p-1 normal-case tracking-normal ring-1 ring-inset ring-emerald-100">
      <button
        className={cn(
          "flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-semibold transition",
          value === "text"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        onClick={() => onChange("text")}
        type="button"
      >
        <FileCode2 aria-hidden="true" className="h-3.5 w-3.5" />
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

function ResultHeaderActions({
  lineCount,
  stats,
}: {
  lineCount: number;
  stats?: JsonYamlStats;
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

interface ResultTextProps {
  indent: JsonYamlIndent;
  lineWrap: boolean;
  syntax: SyntaxKind;
  value: string;
}

function ResultText({ indent, lineWrap, syntax, value }: ResultTextProps): JSX.Element {
  if (!value) {
    return <EmptyResult />;
  }

  return (
    <CodeEditor
      indent={indent}
      label="Converter output"
      lineWrap={lineWrap}
      readOnly
      syntax={syntax}
      value={value}
    />
  );
}

interface CodeEditorProps {
  indent: JsonYamlIndent;
  label: string;
  lineWrap: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  syntax: SyntaxKind;
  value: string;
}

function CodeEditor({
  indent,
  label,
  lineWrap,
  onChange,
  placeholder,
  readOnly = false,
  syntax,
  value,
}: CodeEditorProps): JSX.Element {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const lines = useMemo(() => value.split(/\r\n|\n|\r/), [value]);
  const tabSize = indent === "tab" ? 4 : indent;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    onChange?.(event.target.value);
  }

  function handleScroll(event: UIEvent<HTMLTextAreaElement>): void {
    const { scrollLeft, scrollTop } = event.currentTarget;

    setScroll({ left: scrollLeft, top: scrollTop });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (readOnly || !onChange || event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const editor = event.currentTarget;
    const indentText = getIndentText(indent);
    const nextEdit = event.shiftKey
      ? unindentText(value, editor.selectionStart, editor.selectionEnd, indentText)
      : indentTextBlock(value, editor.selectionStart, editor.selectionEnd, indentText);

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
                  {highlightLine(line, index, syntax)}
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
          readOnly={readOnly}
          spellCheck={false}
          style={{ tabSize }}
          value={value}
          wrap={lineWrap ? "soft" : "off"}
        />
      </label>
    </div>
  );
}

function highlightLine(
  line: string,
  lineIndex: number,
  syntax: SyntaxKind,
): JSX.Element[] {
  return syntax === "json"
    ? highlightJsonLine(line, lineIndex)
    : highlightYamlLine(line, lineIndex);
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

function highlightYamlLine(line: string, lineIndex: number): JSX.Element[] {
  const separatorIndex = line.indexOf(":");

  if (/^\s*-\s/.test(line)) {
    const dashIndex = line.indexOf("-");

    return [
      <span className="text-slate-900" key={`${lineIndex}-prefix`}>
        {line.slice(0, dashIndex)}
      </span>,
      <span className="font-semibold text-violet-700" key={`${lineIndex}-dash`}>
        -
      </span>,
      <span className="text-emerald-700" key={`${lineIndex}-value`}>
        {line.slice(dashIndex + 1) || "\u00a0"}
      </span>,
    ];
  }

  if (separatorIndex !== -1) {
    return [
      <span className="text-accent-700" key={`${lineIndex}-key`}>
        {line.slice(0, separatorIndex + 1)}
      </span>,
      <span className="text-emerald-700" key={`${lineIndex}-value`}>
        {line.slice(separatorIndex + 1) || "\u00a0"}
      </span>,
    ];
  }

  return [
    <span className="text-slate-900" key={`${lineIndex}-plain`}>
      {line || "\u00a0"}
    </span>,
  ];
}

interface TextEditResult {
  selectionEnd: number;
  selectionStart: number;
  value: string;
}

function getIndentText(indent: JsonYamlIndent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

function indentTextBlock(
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

function unindentText(
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

function ErrorPanel({ result }: { result: JsonYamlResult }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <div className="flex items-start gap-3">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">Unable to convert</p>
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

function TreeView({ value }: { value: unknown }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4 font-mono text-[13px] leading-6">
      <TreeNode name="root" value={value} />
    </div>
  );
}

interface TreeNodeProps {
  name?: string;
  value: unknown;
}

function TreeNode({ name, value }: TreeNodeProps): JSX.Element {
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
        <ScalarValue value={value} />
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
            <TreeNode key={key} name={key} value={item} />
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

function ScalarValue({ value }: { value: unknown }): JSX.Element {
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
      Convert JSON or YAML to inspect the output here.
    </div>
  );
}
