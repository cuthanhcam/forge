import type { JSX, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  RotateCcw,
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
  detectBase64Variant,
  transformBase64,
  type Base64Mode,
  type Base64Result,
  type Base64TextEncoding,
  type Base64Variant,
} from "./base64.service";

const sampleText = `Forge developer workstation
Local-first tools, polished workflows, and UTF-8 text.
Symbols: / ? & = + - _ Vietnamese: Xin chao Forge`;

export function Base64Page(): JSX.Element {
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [input, setInput] = useState(sampleText);
  const [variant, setVariant] = useState<Base64Variant>("standard");
  const [padding, setPadding] = useState(true);
  const [lineWrap, setLineWrap] = useState(false);
  const [textEncoding, setTextEncoding] = useState<Base64TextEncoding>("utf-8");
  const result = useMemo(
    () =>
      transformBase64(input, mode, {
        lineWrap,
        padding,
        textEncoding,
        variant,
      }),
    [input, lineWrap, mode, padding, textEncoding, variant],
  );

  function swapMode(): void {
    setMode((current) => (current === "encode" ? "decode" : "encode"));
    if (result.value) {
      setInput(result.value);
      if (mode === "encode") {
        setVariant(detectBase64Variant(result.value));
      }
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
    anchor.download = mode === "encode" ? "forge-base64.txt" : "forge-decoded.txt";
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
              icon={<FileCode2 aria-hidden="true" className="h-4 w-4" />}
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
              label="Alphabet"
              onChange={setVariant}
              options={[
                { label: "Standard", value: "standard" },
                { label: "URL", value: "url" },
              ]}
              value={variant}
            />
            <SegmentedControl
              label="Text"
              onChange={setTextEncoding}
              options={[
                { label: "UTF-8", value: "utf-8" },
                { label: "UTF-16LE", value: "utf-16le" },
              ]}
              value={textEncoding}
            />
          </div>
        }
        right={
          <>
            <StatusPill result={result} />
            <ToggleButton
              active={padding}
              disabled={mode === "decode"}
              label="Padding"
              onClick={() => setPadding((current) => !current)}
            />
            <ToggleButton
              active={lineWrap}
              disabled={mode === "decode"}
              label="MIME wrap"
              onClick={() => setLineWrap((current) => !current)}
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
              <StatsInline
                bytes={result.inputStats.bytes}
                chars={result.inputStats.chars}
                lines={result.inputStats.lines}
                tone="sky"
              />
            }
            title={mode === "encode" ? "Plain text" : "Base64 input"}
            tone="blue"
          />
          <TextPane
            label="Base64 input"
            onChange={setInput}
            placeholder={
              mode === "encode" ? "Text to encode..." : "Paste Base64 to decode..."
            }
            value={input}
          />
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <StatsInline
                bytes={result.outputStats.bytes}
                chars={result.outputStats.chars}
                lines={result.outputStats.lines}
                tone={result.error ? "rose" : "emerald"}
              />
            }
            title={mode === "encode" ? "Base64 output" : "Decoded text"}
            tone={result.error ? "rose" : "emerald"}
          />
          {result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <TextPane label="Base64 output" readOnly value={result.value} />
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
  disabled = false,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
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
        disabled && "pointer-events-none opacity-40",
      )}
      disabled={disabled}
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

function StatusPill({ result }: { result: Base64Result }): JSX.Element {
  if (result.error) {
    return (
      <span className="hidden h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        Invalid Base64
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

function StatsInline({
  bytes,
  chars,
  lines,
  tone,
}: {
  bytes: number;
  chars: number;
  lines: number;
  tone: "emerald" | "rose" | "sky";
}): JSX.Element {
  const toneClass =
    tone === "rose"
      ? "text-rose-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-accent-600";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-end gap-2 text-[12px] font-semibold normal-case tracking-normal",
        toneClass,
      )}
    >
      <span>{chars.toLocaleString()} chars</span>
      <span className="h-1 w-1 rounded-full bg-current opacity-40" />
      <span>{bytes.toLocaleString()} bytes</span>
      <span>{lines.toLocaleString()} lines</span>
    </div>
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
