import type { JSX, ReactNode } from "react";
import type { ToolDefinition } from "@/core/registry/tool.definition";
import { Badge } from "@/shared/ui/badge";

interface ToolLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  showHeader?: boolean;
  tool: ToolDefinition;
}

export function ToolLayout({
  actions,
  children,
  showHeader = true,
  tool,
}: ToolLayoutProps): JSX.Element {
  const Icon = tool.icon;

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-hidden px-3 py-3 md:px-4 md:py-4 2xl:px-5">
      <div className="flex h-full min-h-0 w-full flex-col">
        {showHeader ? (
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-white shadow-sm shadow-sky-500/20">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="truncate text-[18px] font-semibold tracking-normal text-slate-950">
                    {tool.name}
                  </h1>
                  <Badge tone={tool.status === "available" ? "success" : "neutral"}>
                    {tool.status === "available" ? "Available" : "Planned"}
                  </Badge>
                </div>
                <p className="mt-1 max-w-3xl text-[13px] leading-5 text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </div>
            {actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : null}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}
