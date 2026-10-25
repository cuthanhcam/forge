import type { JSX, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Download,
  Link2,
  ListTree,
  RotateCcw,
  Rows3,
  TextCursorInput,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  transformUrl,
  type QueryParam,
  type UrlEncoderResult,
  type UrlMode,
  type UrlPart,
  type UrlStrategy,
} from "./url-encoder.service";

type ResultView = "text" | "breakdown";

const sampleUrl =
  "https://forge.cuthanhcam.workers.dev/tools/url-encoder?name=Markdown Preview&redirect=/tools/json-yaml&lang=vi-VN#result panel";

export function UrlEncoderPage(): JSX.Element {
  const [mode, setMode] = useState<UrlMode>("encode");
  const [strategy, setStrategy] = useState<UrlStrategy>("component");
  const [input, setInput] = useState(sampleUrl);
  const [decodePlus, setDecodePlus] = useState(true);
  const [encodeSpaceAsPlus, setEncodeSpaceAsPlus] = useState(false);
  const [view, setView] = useState<ResultView>("text");
  const result = useMemo(
    () =>
      transformUrl(input, mode, {
        decodePlus,
        encodeSpaceAsPlus,
        strategy,
      }),
    [decodePlus, encodeSpaceAsPlus, input, mode, strategy],
  );

  function swapMode(): void {
    setMode((current) => (current === "encode" ? "decode" : "encode"));
    if (result.value) {
      setInput(result.value);
    }
  }

  async function copyOutput(): Promise<void> {
    await navigator.clipboard.writeText(result.value);
  }

  function downloadOutput(): void {
    const blob = new Blob([result.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      mode === "encode" ? "forge-url-encoded.txt" : "forge-url-decoded.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModeButton
              active={mode === "encode"}
              icon={<Link2 aria-hidden="true" className="h-4 w-4" />}
              label="Encode"
              onClick={() => setMode("encode")}
            />
            <ModeButton
              active={mode === "decode"}
              icon={<TextCursorInput aria-hidden="true" className="h-4 w-4" />}
              label="Decode"
              onClick={() => setMode("decode")}
            />
            <Tooltip content="Swap mode and use current output as input" side="bottom">
              <Button
                aria-label="Swap mode"
                disabled={!result.value}
                onClick={swapMode}
                size="icon"
                variant="ghost"
              >
                <ArrowLeftRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            <SegmentedControl
              label="Mode"
              onChange={setStrategy}
              options={[
                { label: "Component", value: "component" },
                { label: "Full URL", value: "full-url" },
                { label: "Form", value: "form" },
              ]}
              value={strategy}
            />
          </div>
        }
        right={
          <>
            <StatusPill result={result} />
            <ToggleButton
              active={mode === "encode" ? encodeSpaceAsPlus : decodePlus}
              label={mode === "encode" ? "Space as +" : "Decode +"}
              onClick={() =>
                mode === "encode"
                  ? setEncodeSpaceAsPlus((current) => !current)
                  : setDecodePlus((current) => !current)
              }
            />
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
            title={mode === "encode" ? "Raw URL or text" : "Encoded input"}
            tone="blue"
          />
          <TextPane
            label="URL input"
            onChange={setInput}
            placeholder={
              mode === "encode"
                ? "Paste URL, query string, or text..."
                : "Paste percent-encoded text..."
            }
            value={input}
          />
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                <span>{result.stats.chars.toLocaleString()} chars</span>
                <span className="h-1 w-1 rounded-full bg-emerald-300" />
                <span>{result.stats.params.toLocaleString()} params</span>
              </div>
            }
            title={
              <span className="flex min-w-0 items-center gap-2">
                <span>{mode === "encode" ? "Encoded output" : "Decoded output"}</span>
                <OutputTabs onChange={setView} value={view} />
              </span>
            }
            tone={result.error ? "rose" : "emerald"}
          />
          {result.error ? (
            <ErrorPanel message={result.error} />
          ) : view === "breakdown" ? (
            <BreakdownPanel parts={result.parts} queryParams={result.queryParams} />
          ) : (
            <TextPane label="URL output" readOnly value={result.value} />
          )}
        </div>
      </div>
    </ToolSurface>
  );
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

interface SegmentedControlProps<T extends string> {
  label: string;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
}

function SegmentedControl<T extends string>({
  label,
  onChange,
  options,
  value,
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      <span className="hidden px-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 md:inline">
        {label}
      </span>
      {options.map((option) => (
        <button
          className={cn(
            "h-7 rounded px-2 text-[12px] font-semibold transition",
            value === option.value
              ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
          )}
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

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-2.5 text-[12px] font-semibold transition",
        active
          ? "bg-accent-50 text-accent-700 ring-1 ring-accent-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      )}
      onClick={onClick}
      type="button"
    >
      {active ? (
        <ToggleRight aria-hidden="true" className="h-4 w-4" />
      ) : (
        <ToggleLeft aria-hidden="true" className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

function OutputTabs({
  onChange,
  value,
}: {
  onChange: (value: ResultView) => void;
  value: ResultView;
}): JSX.Element {
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
        <Rows3 aria-hidden="true" className="h-3.5 w-3.5" />
        Text
      </button>
      <button
        className={cn(
          "flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-semibold transition",
          value === "breakdown"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        onClick={() => onChange("breakdown")}
        type="button"
      >
        <ListTree aria-hidden="true" className="h-3.5 w-3.5" />
        Parts
      </button>
    </div>
  );
}

function StatusPill({ result }: { result: UrlEncoderResult }): JSX.Element {
  if (result.error) {
    return (
      <span className="hidden h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        Invalid encoding
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

function TextPane({
  label,
  onChange,
  placeholder,
  readOnly = false,
  value,
}: {
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}): JSX.Element {
  return (
    <label className="block min-h-0 flex-1 bg-white">
      <span className="sr-only">{label}</span>
      <textarea
        className="scrollbar-forge h-full min-h-0 w-full resize-none border-0 bg-white p-4 font-mono text-[13px] leading-6 text-slate-950 outline-none placeholder:text-slate-400 selection:bg-accent-200/80 selection:text-slate-950"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        value={value}
      />
    </label>
  );
}

function BreakdownPanel({
  parts,
  queryParams,
}: {
  parts: UrlPart[];
  queryParams: QueryParam[];
}): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="grid gap-4">
        <section className="overflow-hidden rounded-lg border border-accent-100 bg-accent-50/50">
          <div className="border-b border-accent-100 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-accent-700">
            URL parts
          </div>
          {parts.length > 0 ? (
            parts.map((part) => (
              <BreakdownRow key={part.label} label={part.label} value={part.value} />
            ))
          ) : (
            <p className="p-3 text-[13px] font-medium text-slate-500">
              No full URL parts detected.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50/50">
          <div className="border-b border-emerald-100 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            Query params
          </div>
          {queryParams.length > 0 ? (
            queryParams.map((param, index) => (
              <div
                className="grid border-b border-emerald-100 last:border-b-0 md:grid-cols-[13rem_minmax(0,1fr)]"
                key={`${param.key}-${index}`}
              >
                <div className="border-emerald-100 px-3 py-2 font-mono text-[13px] font-semibold text-accent-700 md:border-r">
                  {param.key}
                </div>
                <div className="break-words px-3 py-2 font-mono text-[13px] leading-5 text-slate-950">
                  {param.value}
                </div>
              </div>
            ))
          ) : (
            <p className="p-3 text-[13px] font-medium text-slate-500">
              No query parameters detected.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: UrlPart): JSX.Element {
  return (
    <div className="grid border-b border-accent-100 last:border-b-0 md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="border-accent-100 px-3 py-2 text-[13px] font-semibold text-accent-700 md:border-r">
        {label}
      </div>
      <div className="break-words px-3 py-2 font-mono text-[13px] leading-5 text-slate-950">
        {value}
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <div className="flex items-start gap-3">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold">Unable to decode</p>
            <p className="mt-1 break-words font-mono text-[13px] leading-5">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
