import { Tooltip } from "@/shared/ui/tooltip";
import type { JSX } from "react";
import { NavLink } from "react-router";
import type { ToolDefinition } from "@/core/registry/tool.definition";
import { cn } from "@/shared/lib/cn";

interface SidebarToolItemProps {
  collapsed?: boolean;
  tool: ToolDefinition;
}

export function SidebarToolItem({
  collapsed = false,
  tool,
}: SidebarToolItemProps): JSX.Element {
  const Icon = tool.icon;

  return (
    <Tooltip content={tool.name} side="right">
      <NavLink
        aria-label={tool.name}
        // A string className remains compatible with Radix's asChild prop merging.
        className="group relative flex h-8 items-center overflow-hidden rounded-md px-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600 motion-reduce:transition-none [&.active]:bg-accent-50 [&.active]:text-accent-700 [&.active]:ring-1 [&.active]:ring-inset [&.active]:ring-accent-200"
        to={tool.route}
      >
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span
          aria-hidden={collapsed}
          className={cn(
            "absolute left-8 right-2 truncate transition-opacity duration-150 motion-reduce:transition-none",
            collapsed ? "opacity-0" : "opacity-100",
          )}
        >
          {tool.name}
        </span>
      </NavLink>
    </Tooltip>
  );
}
