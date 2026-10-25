import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Copy, Download, Link2, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  PaneHeader,
  ToolSurface,
  ToolTextarea,
  ToolToolbar,
} from "@/shared/components/ToolSurface";
import { createSlug, type SlugifyOptions } from "./slugify.service";

export function SlugifyPage(): JSX.Element {
  const [input, setInput] = useState("Forge Markdown Preview Design Language");
  const [options, setOptions] = useState<SlugifyOptions>({
    lowercase: true,
    maxLength: 80,
    removeNumbers: false,
    removeStopWords: false,
    separator: "-",
  });
  const slug = useMemo(() => createSlug(input, options), [input, options]);

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  function updateOptions(next: Partial<SlugifyOptions>): void {
    setOptions((current) => ({ ...current, ...next }));
  }

  function download(): void {
    const blob = new Blob([slug], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-slug.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-sky-600">
            <Link2 aria-hidden="true" className="h-4 w-4" />
            URL-safe slug
          </div>
        }
        right={
          <>
            <Button
              className="h-9 px-3"
              disabled={!slug}
              onClick={() => void copy(slug)}
              size="sm"
              variant="secondary"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copy
            </Button>
            <Button
              aria-label="Download output"
              disabled={!slug}
              onClick={download}
              size="icon"
              variant="ghost"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Clear input"
              onClick={() => setInput("")}
              size="icon"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-sky-600">
                {input.length.toLocaleString()} chars
              </span>
            }
            title="Input"
            tone="blue"
          />
          <ToolTextarea
            className="selection:bg-sky-200/80 selection:text-slate-950"
            label="Slug input"
            onChange={setInput}
            placeholder="Text to slugify..."
            value={input}
          />
        </div>
        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                {slug.length.toLocaleString()} chars
              </span>
            }
            title="Slug"
            tone="emerald"
          />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <p className="min-w-0 flex-1 break-all font-mono text-[18px] font-semibold leading-8 text-slate-950">
                  {slug || "-"}
                </p>
                <Button
                  className="shrink-0"
                  disabled={!slug}
                  onClick={() => void copy(slug)}
                  size="sm"
                  variant="secondary"
                >
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </section>

            <section className="mt-4 grid gap-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Options
              </p>
              <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { label: "Dash", value: "-" },
                  { label: "Underscore", value: "_" },
                ].map((option) => (
                  <button
                    className={cn(
                      "h-8 rounded px-2.5 text-[12px] font-semibold transition",
                      options.separator === option.value
                        ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
                    )}
                    key={option.value}
                    onClick={() =>
                      updateOptions({
                        separator: option.value as SlugifyOptions["separator"],
                      })
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <label className="block rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Max length
                  <span className="font-mono text-[13px] text-slate-950">
                    {options.maxLength}
                  </span>
                </span>
                <input
                  className="mt-3 w-full accent-sky-600"
                  max={160}
                  min={16}
                  onChange={(event) =>
                    updateOptions({ maxLength: Number(event.target.value) })
                  }
                  type="range"
                  value={options.maxLength}
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckOption
                  checked={options.lowercase}
                  label="Lowercase"
                  onChange={(lowercase) => updateOptions({ lowercase })}
                />
                <CheckOption
                  checked={options.removeStopWords}
                  label="Remove stop words"
                  onChange={(removeStopWords) => updateOptions({ removeStopWords })}
                />
                <CheckOption
                  checked={options.removeNumbers}
                  label="Remove numbers"
                  onChange={(removeNumbers) => updateOptions({ removeNumbers })}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </ToolSurface>
  );
}

function CheckOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input
        checked={checked}
        className="accent-sky-600"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}
