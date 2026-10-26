import type { JSX } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { Tooltip } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/cn";
import type { MarkdownHeading } from "./markdown-outline.service";

interface MarkdownOutlineProps {
  headings: MarkdownHeading[];
  open: boolean;
  activeId: string | null;
  onToggle: () => void;
  onNavigate: (id: string) => void;
}

export function MarkdownOutline({
  headings,
  open,
  activeId,
  onToggle,
  onNavigate,
}: MarkdownOutlineProps): JSX.Element {
  const base = Math.min(6, ...headings.map((heading) => heading.level));
  return (
    <section className="mt-2 border-t border-slate-100 pt-1">
      <button
        type="button"
        aria-label={open ? "Collapse outline" : "Expand outline"}
        aria-expanded={open}
        aria-controls="markdown-outline-items"
        onClick={onToggle}
        className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none",
            !open && "-rotate-90",
          )}
        />
        <ListTree aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Outline</span>
        <span className="ml-auto text-[11px]">{headings.length}</span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
        id="markdown-outline-items"
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            aria-label="Document outline"
            onKeyDown={(event) => {
              if (event.ctrlKey || event.metaKey || event.altKey) return;
              const buttons = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
              );
              const current = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const indexes: Record<string, number> = {
                ArrowDown: Math.min(buttons.length - 1, current + 1),
                ArrowUp: Math.max(0, current - 1),
                Home: 0,
                End: buttons.length - 1,
              };
              if (event.key in indexes && buttons[indexes[event.key]]) {
                event.preventDefault();
                buttons[indexes[event.key]].focus();
              }
            }}
          >
            {headings.length ? (
              <ul className="m-0 list-none space-y-0.5 p-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <Tooltip content={heading.title}>
                      <button
                        type="button"
                        aria-current={activeId === heading.id ? "location" : undefined}
                        onClick={() => onNavigate(heading.id)}
                        className={cn(
                          "flex min-h-8 w-full items-center rounded-md transition-colors duration-150 motion-reduce:transition-none py-1 pr-2 text-left text-xs leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600",
                          activeId === heading.id
                            ? "bg-accent-50 font-medium text-accent-700 hover:bg-accent-100"
                            : "text-slate-500 hover:bg-slate-100 hover:text-foreground",
                        )}
                        style={{ paddingLeft: 8 + (heading.level - base) * 8 }}
                      >
                        <span className="min-w-0 truncate">{heading.title}</span>
                      </button>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">
                Add headings with # to navigate your document.
              </p>
            )}
          </nav>
        </div>
      </div>
    </section>
  );
}
