import type { JSX, ReactNode } from "react";
import type { ToolLoadingLayout } from "@/core/registry/tool.definition";
import { cn } from "@/shared/lib/cn";

function Bar({ className }: { className?: string }): JSX.Element {
  return <div className={cn("h-3 rounded bg-slate-100", className)} />;
}
function Rows({ code = false }: { code?: boolean }): JSX.Element {
  return (
    <div className="space-y-3">
      {[72, 90, 64, 82, 52, 88, 68, 40].map((width, index) => (
        <div
          key={index}
          className="h-3 rounded bg-slate-100"
          style={{ width: `${width}%`, marginLeft: code && index % 3 === 1 ? "6%" : 0 }}
        />
      ))}
    </div>
  );
}
function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        "min-h-0 min-w-0 overflow-hidden rounded-lg border border-border bg-white p-4",
        className,
      )}
    >
      <Bar className="mb-6 w-24" />
      {children}
    </div>
  );
}
function Cards({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-md border border-border p-3">
          <Bar className="mb-3 w-20" />
          <Bar className="w-3/4" />
        </div>
      ))}
    </div>
  );
}
function Controls(): JSX.Element {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((index) => (
        <div key={index}>
          <Bar className="mb-3 w-20" />
          <div className="h-9 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
function Preview(): JSX.Element {
  return (
    <div className="min-h-0 min-w-0 flex-1 [container-type:inline-size]">
      <div className="forge-loading-preview grid h-full min-h-0 grid-rows-2 gap-3">
        <Panel>
          <Rows code />
        </Panel>
        <Panel>
          <Bar className="mb-6 h-6 w-3/5" />
          <Rows />
          <Bar className="mb-4 mt-8 h-5 w-2/5" />
          <Rows />
        </Panel>
      </div>
    </div>
  );
}
function Layout({ layout }: { layout: ToolLoadingLayout }): JSX.Element {
  const split =
    "grid min-h-0 flex-1 grid-rows-2 gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-rows-1";
  switch (layout) {
    case "preview":
      return <Preview />;
    case "markdown":
      return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:grid-rows-1">
          <div className="overflow-hidden rounded-lg border border-border bg-white p-3">
            <Bar className="h-5 w-3/4" />
            <div className="mt-6 hidden md:block">
              <Cards count={2} />
              <Bar className="mb-4 mt-8 w-20" />
              <Rows />
            </div>
          </div>
          <Preview />
        </div>
      );
    case "diff":
      return (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 md:grid-cols-[12rem_minmax(0,1fr)] md:grid-rows-1">
          <div className="overflow-hidden rounded-lg border border-border bg-white p-4">
            <Bar className="h-5 w-24" />
            <div className="mt-6 hidden md:block">
              <Controls />
              <Cards count={1} />
            </div>
          </div>
          <div className="grid min-h-0 grid-cols-2 gap-3">
            <Panel>
              <Rows code />
            </Panel>
            <Panel>
              <Rows code />
            </Panel>
          </div>
        </div>
      );
    case "data":
      return (
        <div className={split}>
          <Panel>
            <Rows code />
          </Panel>
          <Panel>
            <Rows code />
          </Panel>
        </div>
      );
    case "jwt":
      return (
        <div className={split}>
          <Panel>
            <div className="mb-6 grid grid-cols-3 gap-2">
              <Bar className="h-10" />
              <Bar className="h-10" />
              <Bar className="h-10" />
            </div>
            <Rows code />
          </Panel>
          <div className="min-h-0 space-y-3 overflow-hidden">
            <Panel>
              <Bar className="mb-3 w-3/4" />
              <Bar className="w-1/2" />
            </Panel>
            <Panel>
              <Rows code />
            </Panel>
            <Panel>
              <Bar className="w-4/5" />
            </Panel>
          </div>
        </div>
      );
    case "generator":
      return (
        <div className={split}>
          <Panel>
            <Controls />
          </Panel>
          <Panel>
            <div className="mb-5 h-16 rounded-md bg-slate-100" />
            <Cards />
          </Panel>
        </div>
      );
    case "transform":
      return (
        <div className={split}>
          <Panel>
            <Rows />
          </Panel>
          <Panel>
            <Cards />
            <Bar className="mt-6 w-1/2" />
          </Panel>
        </div>
      );
    case "timestamp":
      return (
        <div className={split}>
          <Panel>
            <Bar className="mb-6 h-9 w-3/4" />
            <Cards count={2} />
          </Panel>
          <Panel>
            <Controls />
            <Bar className="mb-3 mt-8 w-20" />
            <Cards count={1} />
          </Panel>
        </div>
      );
    case "regex":
      return (
        <>
          <div className="flex gap-3 rounded-lg border border-border bg-white p-3">
            <Bar className="h-9 flex-1" />
            <Bar className="h-9 w-24" />
          </div>
          <div className={split}>
            <Panel>
              <Rows />
            </Panel>
            <Panel>
              <Cards />
            </Panel>
          </div>
        </>
      );
  }
  const exhaustive: never = layout;
  return exhaustive;
}

/** Share neutral primitives, choose the real tool's layout before its module arrives. */
export function LoadingState({
  layout,
  label,
}: {
  layout: ToolLoadingLayout;
  label: string;
}): JSX.Element {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      data-loading-layout={layout}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        data-loading-skeleton=""
        className="flex min-h-0 flex-1 flex-col gap-3 motion-safe:animate-pulse"
      >
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-3">
          <Bar className="h-7 w-28" />
          <Bar className="h-5 w-20" />
          <Bar className="ml-auto h-7 w-16" />
        </div>
        <Layout layout={layout} />
      </div>
    </div>
  );
}
