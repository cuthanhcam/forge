import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  PaneHeader,
  ToolSurface,
  ToolTextarea,
  ToolToolbar,
} from "@/shared/components/ToolSurface";
import { testRegex } from "./regex-tester.service";

const sampleText = `Forge includes Markdown Preview, HTML Preview, JSON Formatter, and Regex Tester.
Contact cuthanhcam04@gmail.com or charlie.cu@outlook.com for internal tool feedback.
Issue IDs: FORGE-1024, FORGE-2048, and FORGE-4096.`;

export function RegexTesterPage(): JSX.Element {
  const [pattern, setPattern] = useState("([A-Z]+)-(\\d+)");
  const [flags, setFlags] = useState("gi");
  const [replacement, setReplacement] = useState("$1#$2");
  const [sample, setSample] = useState(sampleText);
  const result = useMemo(
    () => testRegex(pattern, flags, sample, replacement),
    [flags, pattern, replacement, sample],
  );

  function toggleFlag(flag: string): void {
    setFlags((value) =>
      value.includes(flag) ? value.replace(flag, "") : `${value}${flag}`,
    );
  }

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <label className="min-w-[260px] flex-1">
              <span className="sr-only">Pattern</span>
              <input
                className="h-9 w-full rounded-md border border-slate-200 px-3 font-mono text-[13px] text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                onChange={(event) => setPattern(event.target.value)}
                placeholder="Regular expression pattern..."
                value={pattern}
              />
            </label>
            <label className="min-w-[180px] flex-1">
              <span className="sr-only">Replacement</span>
              <input
                className="h-9 w-full rounded-md border border-slate-200 px-3 font-mono text-[13px] text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                onChange={(event) => setReplacement(event.target.value)}
                placeholder="Replacement..."
                value={replacement}
              />
            </label>
          </div>
        }
        right={
          <>
            {["g", "i", "m", "s", "u", "y"].map((flag) => (
              <button
                aria-pressed={flags.includes(flag)}
                className={cn(
                  "h-8 rounded-md px-2 font-mono text-xs font-semibold transition",
                  flags.includes(flag)
                    ? "bg-accent-50 text-accent-700 ring-1 ring-accent-100"
                    : "text-slate-600 hover:bg-slate-100",
                )}
                key={flag}
                onClick={() => toggleFlag(flag)}
                type="button"
              >
                {flag}
              </button>
            ))}
            <Button
              aria-label="Reset"
              onClick={() => {
                setPattern("");
                setReplacement("");
                setSample("");
              }}
              size="icon"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-accent-600">
                /{pattern || "(empty)"}/{flags}
              </span>
            }
            title="Test string"
            tone="blue"
          />
          <ToolTextarea
            className="selection:bg-accent-200/80 selection:text-slate-950"
            label="Sample text"
            onChange={setSample}
            placeholder="Text to test..."
            value={sample}
          />
        </div>
        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                {result.matches.length} matches
              </span>
            }
            title="Results"
            tone={result.error ? "rose" : "emerald"}
          />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            {result.error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-[13px] font-semibold text-rose-700">
                {result.error}
              </div>
            ) : (
              <div className="grid gap-4">
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                      <p className="text-[13px] font-bold text-slate-950">
                        Highlight preview
                      </p>
                    </div>
                    <Button
                      onClick={() => void copy(result.replaced)}
                      size="sm"
                      variant="secondary"
                    >
                      <Copy aria-hidden="true" className="h-4 w-4" />
                      Copy replace
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-950">
                    {result.highlighted.map((segment, index) => (
                      <span
                        className={
                          segment.match
                            ? "rounded bg-emerald-200/80 px-0.5 text-emerald-950 ring-1 ring-emerald-300"
                            : undefined
                        }
                        key={`${segment.text}-${index}`}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </pre>
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-slate-950">Replacement</p>
                    <Button
                      onClick={() => void copy(result.replaced)}
                      size="sm"
                      variant="secondary"
                    >
                      <Copy aria-hidden="true" className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-950">
                    {result.replaced || "-"}
                  </p>
                </section>

                <div className="grid gap-3">
                  {result.matches.length === 0 ? (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-[13px] font-medium text-slate-500">
                      No matches.
                    </p>
                  ) : null}
                  {result.matches.map((match, index) => (
                    <section
                      className="rounded-lg border border-slate-200 bg-white p-3"
                      key={`${match.index}-${index}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-bold text-slate-950">
                          Match {index + 1}
                        </p>
                        <span className="font-mono text-[12px] font-semibold text-slate-500">
                          {match.index}-{match.end}
                        </span>
                      </div>
                      <p className="mt-2 break-all font-mono text-[13px] leading-6 text-slate-950">
                        {match.match || "(empty match)"}
                      </p>
                      {match.groups.length > 0 ? (
                        <div className="mt-3 grid gap-2">
                          {match.groups.map((group, groupIndex) => (
                            <div
                              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                              key={`${group}-${groupIndex}`}
                            >
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                Group {groupIndex + 1}
                              </p>
                              <p className="mt-1 break-all font-mono text-[13px] text-slate-950">
                                {group || "(empty)"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolSurface>
  );
}
