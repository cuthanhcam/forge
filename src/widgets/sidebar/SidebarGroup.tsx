import type { JSX } from "react";
import { useWorkspaceStore } from "@/core/workspace/workspace.store";
import { ChevronDown } from "lucide-react";
import type { ToolCategoryDefinition } from "@/core/registry/tool.categories";
import type { ToolDefinition } from "@/core/registry/tool.definition";
import { cn } from "@/shared/lib/cn";
import { SidebarToolItem } from "./SidebarToolItem";

interface SidebarGroupProps {
  category: ToolCategoryDefinition;
  sidebarCollapsed?: boolean;
  tools: ToolDefinition[];
}

export function SidebarGroup({
  category,
  sidebarCollapsed = false,
  tools,
}: SidebarGroupProps): JSX.Element {
  const open = useWorkspaceStore(
    (state) => !state.collapsedCategoryIds.includes(category.id),
  );
  const toggleCategory = useWorkspaceStore((state) => state.toggleCategory);
  const Icon = category.icon;

  return (
    <section>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none",
          sidebarCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
        aria-hidden={sidebarCollapsed}
        inert={sidebarCollapsed}
      >
        <div className="min-h-0 overflow-hidden">
          <button
            aria-expanded={open}
            className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={() => toggleCategory(category.id)}
            type="button"
          >
            <Icon aria-hidden="true" className="h-3.5 w-3.5 text-slate-300" />
            <span className="min-w-0 flex-1 text-left">{category.id}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-3.5 w-3.5 transition motion-reduce:transition-none",
                !open && "-rotate-90",
              )}
            />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open || sidebarCollapsed
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
          "motion-reduce:transition-none",
        )}
      >
        <div
          className="min-h-0 overflow-hidden px-1 py-0.5"
          inert={!open && !sidebarCollapsed}
        >
          <div
            className={cn(
              "space-y-1 transition-[margin,padding,border-color] duration-200 motion-reduce:transition-none",
              sidebarCollapsed
                ? "ml-0 border-l-0 pl-0"
                : "ml-2 border-l border-slate-200 pl-2",
            )}
          >
            {tools.map((tool) => (
              <SidebarToolItem collapsed={sidebarCollapsed} key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
