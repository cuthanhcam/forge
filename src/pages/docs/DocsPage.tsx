import { NotFoundPage } from "@/pages/not-found/NotFoundPage";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { useLayoutEffect, useRef } from "react";
import type { JSX } from "react";
import { BookOpen, ChevronRight, Keyboard, Route } from "lucide-react";
import { Link, NavLink, useNavigate, useParams } from "react-router";
import { cn } from "@/shared/lib/cn";
import { DocsMarkdown } from "./DocsMarkdown";
import { docPages, getDocPage } from "./docs.content";
import { createToc } from "./docs.toc";

const docIcons: Record<string, typeof BookOpen> = {
  guides: Route,
  overview: BookOpen,
  shortcuts: Keyboard,
};

export function DocsPage(): JSX.Element {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLElement>(null);
  const { docId } = useParams();
  const page = getDocPage(docId);
  const toc = createToc(page.markdown);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page.id]);

  if (docId && !docPages.some((doc) => doc.id === docId)) return <NotFoundPage />;

  function scrollToHeading(id: string): void {
    const target = scrollRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    const owner = scrollRef.current;
    if (target && owner)
      owner.scrollTo({
        top:
          owner.scrollTop +
          target.getBoundingClientRect().top -
          owner.getBoundingClientRect().top -
          16,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <main
      ref={scrollRef}
      className="scrollbar-forge min-h-0 min-w-0 flex-1 overflow-auto px-4 pb-5 md:px-6 lg:px-8"
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col">
        <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
          <aside className="scrollbar-forge sticky top-5 hidden max-h-[calc(100dvh-6rem)] min-h-0 self-start overflow-y-auto border-r border-slate-200 pr-4 pt-5 lg:block">
            <div>
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Documentation
              </p>
              <nav className="space-y-1 p-1" aria-label="Documentation navigation">
                {docPages.map((doc) => {
                  const Icon = docIcons[doc.id] ?? BookOpen;

                  return (
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          "flex items-start gap-2 rounded-md px-2 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600",
                          isActive || (!docId && doc.id === "overview")
                            ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                        )
                      }
                      key={doc.id}
                      end={doc.id === "overview"}
                      to={doc.id === "overview" ? "/docs" : `/docs/${doc.id}`}
                    >
                      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate">{doc.title}</span>
                        <span className="mt-0.5 block text-[11px] font-medium leading-4 text-slate-400">
                          {doc.description}
                        </span>
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="min-w-0 max-w-full py-5">
            <label className="mb-4 block text-sm text-muted-foreground lg:hidden">
              Documentation page
              <select
                aria-label="Documentation page"
                className="mt-2 w-full rounded-md border border-border bg-white p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                value={page.id}
                onChange={(event) => {
                  void navigate(
                    event.target.value === "overview"
                      ? "/docs"
                      : `/docs/${event.target.value}`,
                  );
                }}
              >
                {docPages.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="min-w-0 max-w-full rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
              <div className="border-b border-slate-200 bg-gradient-soft px-5 py-4">
                <div className="flex flex-wrap items-center gap-1 text-[12px] font-semibold">
                  <Link className="text-slate-500 transition hover:text-slate-950" to="/">
                    Forge
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  <Link
                    className="text-slate-500 transition hover:text-slate-950"
                    to="/docs"
                  >
                    Docs
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="text-slate-950">{page.title}</span>
                </div>
                <p className="mt-2 max-w-[calc(100vw-5.5rem)] break-words text-sm leading-6 text-slate-600 md:max-w-2xl">
                  {page.description}
                </p>
              </div>
              <div className="px-5 py-6 md:px-8">
                <DocsMarkdown markdown={page.markdown} />
              </div>
            </div>
          </section>

          <aside className="scrollbar-forge sticky top-5 hidden max-h-[calc(100dvh-6rem)] min-h-0 self-start overflow-y-auto border-l border-slate-200 pl-4 pt-5 xl:block">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                On this page
              </p>
              <nav className="space-y-1" aria-label="Table of contents">
                {toc.map((item) => (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2 py-1.5 text-left text-[12px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
                      item.level === 3 && "pl-5 font-medium",
                    )}
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    type="button"
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
