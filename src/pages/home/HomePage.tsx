import { SiteFooter } from "@/shared/components/SiteFooter";
import { Tooltip } from "@/shared/ui/tooltip";
import { useMemo, useRef, useState, type JSX } from "react";
import { ArrowDown, ArrowUpRight, Search, X } from "lucide-react";
import { Link } from "react-router";
import { toolCategoryDefinitions } from "@/core/registry/tool.categories";
import { toolRegistry } from "@/core/registry/tool.registry";
import { searchTools } from "@/core/search/search.service";

const availableTools = toolRegistry.filter((tool) => tool.status === "available");

export function HomePage(): JSX.Element {
  const [query, setQuery] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const directoryRef = useRef<HTMLElement>(null);
  function exploreTools(): void {
    const scroll = scrollRef.current;
    const directory = directoryRef.current;
    if (!scroll || !directory) return;
    // Scroll only the page: scrollIntoView also moves overflow-hidden shell ancestors.
    scroll.scrollTo({
      top:
        scroll.scrollTop +
        directory.getBoundingClientRect().top -
        scroll.getBoundingClientRect().top -
        32,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    filterRef.current?.focus({ preventScroll: true });
  }
  function clearFilter(): void {
    setQuery("");
    filterRef.current?.focus({ preventScroll: true });
  }
  const matches = useMemo(
    () => searchTools(availableTools, query).map(({ tool }) => tool),
    [query],
  );
  const groups = toolCategoryDefinitions
    .map((category) => ({
      ...category,
      tools: matches.filter((tool) => tool.category === category.id),
    }))
    .filter((category) => category.tools.length > 0);

  return (
    <main
      ref={scrollRef}
      className="scrollbar-forge min-h-0 min-w-0 flex-1 overflow-auto break-words bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <section
          aria-labelledby="forge-signature"
          className="forge-home-signature flex min-h-[calc(100dvh-7.5rem)] flex-col justify-center py-8 sm:py-12"
        >
          <div className="mb-8 flex items-center gap-3 sm:mb-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground">
              <img alt="" src="/forge-black.svg" className="h-6 w-6 dark:hidden" />
              <img alt="" src="/forge-white.svg" className="hidden h-6 w-6 dark:block" />
            </span>
            <span className="text-3xl font-semibold tracking-tight">
              Forge<span className="text-accent-600">.</span>
            </span>
          </div>
          <h1
            className="max-w-full text-[clamp(2.1rem,7vw,6.9rem)] font-black leading-[0.92] tracking-normal"
            id="forge-signature"
          >
            <span className="block">Where rough </span>
            <span className="block bg-brand-gradient bg-clip-text text-transparent">
              input becomes{" "}
            </span>
            <span className="block bg-brand-gradient bg-clip-text text-transparent">
              usable work.
            </span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            A little clarity for the things you build.
          </p>
          <button
            className="mt-8 inline-flex min-h-10 w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            onClick={exploreTools}
            type="button"
          >
            Explore tools <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </button>
        </section>
        <section
          className="scroll-mt-8 pt-8"
          ref={directoryRef}
          aria-labelledby="directory-title"
        >
          <header className="mb-8 max-w-2xl">
            <h2
              id="directory-title"
              className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]"
            >
              Tools for everyday development
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Format data, preview documents, compare text and work with tokens in one
              workspace.
            </p>
          </header>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-accent-600 sm:max-w-md">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />
              <label className="sr-only" htmlFor="home-tool-filter">
                Filter tools
              </label>
              <input
                id="home-tool-filter"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a tool"
                ref={filterRef}
                type="search"
                value={query}
              />
              {query ? (
                <Tooltip content="Clear filter" side="bottom">
                  <button
                    aria-label="Clear filter"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                    onClick={clearFilter}
                    type="button"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </Tooltip>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground" role="status">
              {matches.length} {matches.length === 1 ? "tool" : "tools"}
              {query.trim() ? " found" : " available"}
            </p>
          </div>

          <div className="space-y-8" role="region" aria-label="Tool directory">
            {groups.map((category) => (
              <section aria-labelledby={`category-${category.id}`} key={category.id}>
                <h3
                  className="mb-3 text-base font-semibold"
                  id={`category-${category.id}`}
                >
                  {category.id}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        aria-labelledby={`home-${tool.id}`}
                        aria-describedby={`home-${tool.id}-description`}
                        className="group min-w-0 rounded-lg border border-border bg-card p-4 transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                        key={tool.id}
                        to={tool.route}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                          />
                          <h4
                            className="min-w-0 flex-1 text-sm font-medium"
                            id={`home-${tool.id}`}
                          >
                            {tool.name}
                          </h4>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="hidden h-4 w-4 shrink-0 text-muted-foreground opacity-0 sm:block transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        </div>
                        <p
                          className="mt-2 text-sm leading-6 text-muted-foreground"
                          id={`home-${tool.id}-description`}
                        >
                          {tool.description}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
            {groups.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <h2 className="text-base font-medium">No matching tools</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a tool name, format or task, such as JSON, Markdown or encode.
                </p>
                <button
                  className="mt-4 rounded text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                  onClick={clearFilter}
                  type="button"
                >
                  Show all tools
                </button>
              </div>
            ) : null}
          </div>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}
