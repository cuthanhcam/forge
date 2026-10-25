import type { JSX } from "react";
import type { ToolDefinition } from "@/core/registry/tool.definition";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

interface CommandPaletteItemProps {
  active: boolean;
  onSelect: () => void;
  tool: ToolDefinition;
}

export function CommandPaletteItem({
  active,
  onSelect,
  tool,
}: CommandPaletteItemProps): JSX.Element {
  const Icon = tool.icon;

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition",
        active ? "bg-accent-50 ring-1 ring-accent-100" : "hover:bg-slate-50",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-950">{tool.name}</p>
          <Badge className="h-5 px-1.5 text-[10px]" tone="neutral">
            {tool.category}
          </Badge>
          <Badge
            className="h-5 px-1.5 text-[10px]"
            tone={tool.status === "available" ? "success" : "neutral"}
          >
            {tool.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{tool.description}</p>
        <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
          {tool.features.map((feature) => (
            <span
              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
              key={feature}
            >
              {feature}
            </span>
          ))}
        </div>
        <p className="mt-2 truncate font-mono text-[10px] text-slate-400">{tool.route}</p>
      </div>
    </button>
  );
}
