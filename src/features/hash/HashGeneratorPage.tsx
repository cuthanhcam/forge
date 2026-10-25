import type { JSX, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Fingerprint,
  KeyRound,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  generateHashResult,
  type HashAlgorithm,
  type HashDigest,
  type HashMode,
  type HashOutputFormat,
  type HashResult,
} from "./hash.service";

const sampleInput = `Forge developer workstation
Hash this local payload before sending it through an API.
nonce=2026-07-05&tool=hash-generator`;

export function HashGeneratorPage(): JSX.Element {
  const [input, setInput] = useState(sampleInput);
  const [mode, setMode] = useState<HashMode>("digest");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [format, setFormat] = useState<HashOutputFormat>("hex");
  const [key, setKey] = useState("forge-hmac-secret");
  const [result, setResult] = useState<HashResult>({
    digests: [],
    stats: { bytes: 0, chars: 0, lines: 0 },
  });

  useEffect(() => {
    let cancelled = false;

    void generateHashResult(input, { algorithm, format, key, mode }).then((next) => {
      if (!cancelled) {
        setResult(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [algorithm, format, input, key, mode]);

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  function downloadOutput(): void {
    const blob = new Blob(
      [result.digests.map((digest) => `${digest.label}: ${digest.value}`).join("\n")],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = mode === "hmac" ? "forge-hmac.txt" : "forge-hashes.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModeButton
              active={mode === "digest"}
              icon={<Fingerprint aria-hidden="true" className="h-4 w-4" />}
              label="Digest"
              onClick={() => setMode("digest")}
            />
            <ModeButton
              active={mode === "hmac"}
              icon={<KeyRound aria-hidden="true" className="h-4 w-4" />}
              label="HMAC"
              onClick={() => setMode("hmac")}
            />
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            {mode === "hmac" ? (
              <SegmentedControl
                label="Algorithm"
                onChange={setAlgorithm}
                options={[
                  { label: "SHA-256", value: "SHA-256" },
                  { label: "SHA-384", value: "SHA-384" },
                  { label: "SHA-512", value: "SHA-512" },
                ]}
                value={algorithm}
              />
            ) : null}
            <SegmentedControl
              label="Output"
              onChange={setFormat}
              options={[
                { label: "Hex", value: "hex" },
                { label: "Base64", value: "base64" },
                { label: "Base64URL", value: "base64url" },
              ]}
              value={format}
            />
          </div>
        }
        right={
          <>
            <StatusPill result={result} />
            <Tooltip content="Download output" side="bottom">
              <Button
                aria-label="Download output"
                disabled={result.digests.length === 0}
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
              <div className="flex gap-2 text-[12px] font-semibold normal-case tracking-normal text-accent-600">
                <span>{result.stats.chars.toLocaleString()} chars</span>
                <span>{result.stats.bytes.toLocaleString()} bytes</span>
              </div>
            }
            title="Input"
            tone="blue"
          />
          <div className="flex min-h-0 flex-1 flex-col">
            {mode === "hmac" ? (
              <label className="border-b border-slate-200 bg-slate-50 p-3">
                <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  HMAC secret key
                </span>
                <input
                  className="mt-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-[13px] text-slate-950 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                  onChange={(event) => setKey(event.target.value)}
                  spellCheck={false}
                  value={key}
                />
              </label>
            ) : null}
            <TextPane
              label="Hash input"
              onChange={setInput}
              placeholder="Text to hash..."
              value={input}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                {result.digests.length.toLocaleString()} outputs
              </span>
            }
            title={mode === "hmac" ? "HMAC output" : "Hash outputs"}
            tone={result.error ? "rose" : "emerald"}
          />
          {result.error ? (
            <ErrorPanel message={result.error} />
          ) : (
            <HashList digests={result.digests} onCopy={(value) => void copy(value)} />
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

function StatusPill({ result }: { result: HashResult }): JSX.Element {
  if (result.error) {
    return (
      <span className="hidden h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        Hash error
      </span>
    );
  }

  return (
    <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      Generated locally
    </span>
  );
}

function TextPane({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}): JSX.Element {
  return (
    <label className="block min-h-0 flex-1 bg-white">
      <span className="sr-only">{label}</span>
      <textarea
        className="scrollbar-forge h-full min-h-0 w-full resize-none border-0 bg-white p-4 font-mono text-[13px] leading-6 text-slate-950 outline-none placeholder:text-slate-400 selection:bg-accent-200/80 selection:text-slate-950"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        value={value}
      />
    </label>
  );
}

function HashList({
  digests,
  onCopy,
}: {
  digests: HashDigest[];
  onCopy: (value: string) => void;
}): JSX.Element {
  if (digests.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8 text-center text-[13px] font-medium text-slate-400">
        Enter text to generate hashes.
      </div>
    );
  }

  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="grid gap-3">
        {digests.map((digest) => (
          <section
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            key={digest.label}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-slate-950">{digest.label}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-500">
                  {digest.format}
                </p>
              </div>
              <Button
                className="shrink-0"
                onClick={() => onCopy(digest.value)}
                size="sm"
                variant="secondary"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="mt-3 break-all font-mono text-[13px] leading-6 text-slate-950">
              {digest.value}
            </p>
          </section>
        ))}
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
            <p className="text-[14px] font-semibold">Unable to generate hash</p>
            <p className="mt-1 break-words font-mono text-[13px] leading-5">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
