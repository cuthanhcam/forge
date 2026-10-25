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
    <NavLink
      aria-label={tool.name}
      className={({ isActive }) =>
        cn(
          "group relative flex h-8 items-center overflow-hidden rounded-md px-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 motion-reduce:transition-none",
          isActive
            ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        )
      }
      title={collapsed ? tool.name : undefined}
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
  );
}
