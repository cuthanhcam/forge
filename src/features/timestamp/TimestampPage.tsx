import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import { convertTimestampInput } from "./timestamp.service";

export function TimestampPage(): JSX.Element {
  const [input, setInput] = useState("");
  const [tick, setTick] = useState(Date.now());
  const conversion = useMemo(() => {
    void tick;

    return convertTimestampInput(input);
  }, [input, tick]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Timestamp or date</span>
              <input
                className="h-9 w-full rounded-md border border-slate-200 px-3 font-mono text-[13px] text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                onChange={(event) => setInput(event.target.value)}
                placeholder="Unix seconds, milliseconds, ISO date, or readable date..."
                value={input}
              />
            </label>
          </div>
        }
        right={
          <>
            <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Live
            </span>
            <Button
              className="h-9 px-3"
              onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
              size="sm"
              variant="secondary"
            >
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              Now
            </Button>
            <Button
              aria-label="Reset to live time"
              onClick={() => setInput("")}
              size="icon"
              variant="ghost"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader title="Current time" tone="blue" />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            {conversion ? (
              <div className="grid gap-3">
                <PrimaryTime label="Unix seconds" value={String(conversion.seconds)} />
                <PrimaryTime
                  label="Unix milliseconds"
                  value={String(conversion.milliseconds)}
                />
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Local datetime input
                  </p>
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-[13px] text-slate-950 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                    onChange={(event) => setInput(event.target.value)}
                    aria-label="Local datetime input"
                    type="datetime-local"
                    value={conversion.dateInput}
                  />
                </div>
              </div>
            ) : (
              <ErrorPanel />
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              conversion ? (
                <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                  {conversion.relative}
                </span>
              ) : null
            }
            title="Converted values"
            tone={conversion ? "emerald" : "rose"}
          />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            {conversion ? (
              <div className="grid gap-3">
                {[
                  ["ISO 8601", conversion.iso],
                  ["UTC", conversion.utc],
                  ["Local", conversion.local],
                  ["Unix seconds", String(conversion.seconds)],
                  ["Unix milliseconds", String(conversion.milliseconds)],
                  ["Unix microseconds", String(conversion.microseconds)],
                  ["Unix nanoseconds", String(conversion.nanoseconds)],
                ].map(([label, value]) => (
                  <ResultCard
                    key={label}
                    label={label}
                    onCopy={() => void copy(value)}
                    value={value}
                  />
                ))}
              </div>
            ) : (
              <ErrorPanel />
            )}
          </div>
        </div>
      </div>
    </ToolSurface>
  );
}

function PrimaryTime({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-accent-100 bg-accent-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent-600">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-[22px] font-bold leading-8 text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ResultCard({
  label,
  onCopy,
  value,
}: {
  label: string;
  onCopy: () => void;
  value: string;
}): JSX.Element {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold text-slate-950">{label}</p>
        <Button className="shrink-0" onClick={onCopy} size="sm" variant="secondary">
          <Copy aria-hidden="true" className="h-4 w-4" />
          Copy
        </Button>
      </div>
      <p className="mt-3 break-all font-mono text-[13px] leading-6 text-slate-950">
        {value}
      </p>
    </section>
  );
}

function ErrorPanel(): JSX.Element {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-[13px] font-semibold text-rose-700">
      Unable to parse that timestamp or date.
    </div>
  );
}
