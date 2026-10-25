import type { JSX } from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, Fingerprint, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  createUuidBatch,
  validateUuid,
  type UuidFormat,
  type UuidVersion,
} from "./uuid.service";

export function UuidPage(): JSX.Element {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [format, setFormat] = useState<UuidFormat>("standard");
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(0);
  const [validationInput, setValidationInput] = useState("");
  const values = useMemo(() => {
    void seed;

    return createUuidBatch({ count, format, version });
  }, [count, format, seed, version]);
  const validation = useMemo(() => validateUuid(validationInput), [validationInput]);

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  async function copyAll(): Promise<void> {
    await copy(values.join("\n"));
  }

  function download(): void {
    const blob = new Blob([values.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-uuids.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModeButton
              active={version === "v4"}
              label="UUID v4"
              onClick={() => setVersion("v4")}
            />
            <ModeButton
              active={version === "v7"}
              label="UUID v7"
              onClick={() => setVersion("v7")}
            />
            <ModeButton
              active={version === "nil"}
              label="Nil"
              onClick={() => setVersion("nil")}
            />
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            <SegmentedControl
              onChange={setFormat}
              options={[
                { label: "Standard", value: "standard" },
                { label: "Uppercase", value: "uppercase" },
                { label: "Compact", value: "compact" },
                { label: "Braces", value: "braces" },
              ]}
              value={format}
            />
          </div>
        }
        right={
          <>
            <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Local crypto
            </span>
            <Button
              className="h-9 px-3"
              onClick={() => setSeed((value) => value + 1)}
              size="sm"
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Generate
            </Button>
            <Tooltip content="Download UUIDs" side="bottom">
              <Button
                aria-label="Download UUIDs"
                onClick={download}
                size="icon"
                variant="ghost"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader title="Options" tone="blue" />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            <section className="grid gap-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Batch size
              </p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[1, 10, 25, 100].map((value) => (
                  <PresetCard
                    active={count === value}
                    key={value}
                    label={String(value)}
                    onClick={() => setCount(value)}
                    value={value === 1 ? "Single" : "Bulk"}
                  />
                ))}
              </div>
              <label className="mt-2 block rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Quantity
                  <span className="font-mono text-[13px] text-slate-950">{count}</span>
                </span>
                <input
                  className="mt-3 w-full accent-sky-600"
                  max={100}
                  min={1}
                  onChange={(event) => setCount(Number(event.target.value))}
                  type="range"
                  value={count}
                />
              </label>
            </section>

            <section className="mt-6">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Validate UUID
              </p>
              <textarea
                aria-label="Validate UUID"
                className="scrollbar-forge min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 font-mono text-[13px] leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                onChange={(event) => setValidationInput(event.target.value)}
                placeholder="Paste a UUID to inspect version and variant..."
                spellCheck={false}
                value={validationInput}
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Metric
                  label="Version"
                  value={validationInput ? validation.version : "-"}
                />
                <Metric
                  label="Variant"
                  value={validationInput ? validation.variant : "-"}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <Button onClick={() => void copyAll()} size="sm" variant="secondary">
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy all
              </Button>
            }
            title={`${values.length} UUIDs`}
            tone="emerald"
          />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            <div className="grid gap-2">
              {values.map((value, index) => (
                <section
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  key={`${value}-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Fingerprint
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-emerald-600"
                      />
                      <p className="truncate text-[13px] font-bold text-slate-950">
                        UUID {index + 1}
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={() => void copy(value)}
                      size="sm"
                      variant="secondary"
                    >
                      <Copy aria-hidden="true" className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="mt-3 break-all font-mono text-[13px] leading-6 text-slate-950">
                    {value}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolSurface>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <Button onClick={onClick} size="sm" variant={active ? "secondary" : "ghost"}>
      {label}
    </Button>
  );
}

function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          className={cn(
            "h-8 rounded px-2.5 text-[12px] font-semibold transition",
            value === option.value
              ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100"
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

function PresetCard({
  active,
  label,
  onClick,
  value,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  value: string;
}): JSX.Element {
  return (
    <button
      className={cn(
        "rounded-lg border p-3 text-left transition",
        active
          ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="block text-[14px] font-bold text-slate-950">{label}</span>
      <span className="mt-1 block text-[12px] font-semibold text-sky-700">{value}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-[14px] font-semibold text-slate-950">{value}</p>
    </div>
  );
}
