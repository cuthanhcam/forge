import type { JSX } from "react";

export function LoadingState(): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      aria-busy="true"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <span className="sr-only">Preparing your workspace.</span>
      <div
        aria-hidden="true"
        data-loading-skeleton=""
        className="flex min-h-0 flex-1 flex-col gap-3 motion-safe:animate-pulse"
      >
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-3">
          <div className="h-7 w-28 rounded-md bg-slate-100" />
          <div className="h-5 w-20 rounded bg-slate-100" />
          <div className="ml-auto h-7 w-16 rounded-md bg-slate-100" />
        </div>
        <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 md:grid-cols-2 md:grid-rows-1">
          {[0, 1].map((pane) => (
            <div
              key={pane}
              className="overflow-hidden rounded-lg border border-border bg-white p-5"
            >
              <div className="mb-6 h-4 w-24 rounded bg-slate-100" />
              <div className="space-y-3">
                {[72, 90, 64, 82, 52, 88, 68, 40].map((width, index) => (
                  <div
                    key={index}
                    className="h-3 rounded bg-slate-100"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
