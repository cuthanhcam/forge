import { Tooltip } from "@/shared/ui/tooltip";
import { projectLinks } from "@/core/config/project-links";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  AlertTriangle,
  BookOpen,
  HeartHandshake,
  Keyboard,
  MessageCircle,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
  X,
} from "lucide-react";
import { toolCategoryDefinitions } from "@/core/registry/tool.categories";
import { getToolsByCategory } from "@/core/registry/tool.registry";
import { useThemeStore } from "@/core/theme/theme.store";
import type { ThemeMode } from "@/core/theme/theme.types";
import { useWorkspaceStore } from "@/core/workspace/workspace.store";
import { cn } from "@/shared/lib/cn";
import { SidebarGroup } from "./SidebarGroup";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps): JSX.Element {
  const [helpOpen, setHelpOpen] = useState(false);
  const [desktop, setDesktop] = useState(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 1024px)");
    const update = (): void => {
      setDesktop(query.matches);
      if (query.matches) onMobileOpenChange(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [onMobileOpenChange]);
  const helpRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const themeMode = useThemeStore((state) => state.mode);
  const sidebarCollapsed = useWorkspaceStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);
  const ToggleIcon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const effectiveCollapsed = sidebarCollapsed && !mobileOpen;
  const [systemTheme, setSystemTheme] = useState<Exclude<ThemeMode, "system">>("light");

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function updateSystemTheme(): void {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    }

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  const isDarkTheme =
    themeMode === "dark" || (themeMode === "system" && systemTheme === "dark");

  useEffect(() => {
    onMobileOpenChange(false);
    setHelpOpen(false);
  }, [location.pathname, onMobileOpenChange]);

  useEffect(() => {
    if (!mobileOpen || desktop) return;
    const opener =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = (): HTMLElement[] =>
      Array.from(
        asideRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex="0"]',
        ) ?? [],
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.closest("[inert]") &&
          getComputedStyle(element).visibility !== "hidden",
      );
    let frame = 0;
    const focusWhenVisible = (): void => {
      if (asideRef.current?.contains(document.activeElement)) return;
      const activeDialog = document.activeElement?.closest('[role="dialog"]');
      if (activeDialog && activeDialog !== asideRef.current) return;
      const first = focusable()[0];
      first?.focus({ preventScroll: true });
      if (!asideRef.current?.contains(document.activeElement))
        frame = window.requestAnimationFrame(focusWhenVisible);
    };
    frame = window.requestAnimationFrame(focusWhenVisible);
    function handleKeyDown(event: KeyboardEvent): void {
      const activeDialog = document.activeElement?.closest('[role="dialog"]');
      if (
        activeDialog &&
        activeDialog !== asideRef.current &&
        !asideRef.current?.contains(activeDialog)
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileOpenChange(false);
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !asideRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !asideRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, [mobileOpen, desktop, onMobileOpenChange]);

  useEffect(() => {
    if (!helpOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      if (
        event.target instanceof Node &&
        helpRef.current &&
        !helpRef.current.contains(event.target)
      ) {
        setHelpOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [helpOpen]);

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Dismiss navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => onMobileOpenChange(false)}
          type="button"
        />
      ) : null}
      <aside
        aria-label={mobileOpen && !desktop ? "Navigation" : "Primary sidebar"}
        aria-modal={mobileOpen && !desktop ? true : undefined}
        role={mobileOpen && !desktop ? "dialog" : undefined}
        aria-hidden={!mobileOpen && !desktop ? true : undefined}
        inert={!mobileOpen && !desktop}
        id="forge-sidebar"
        ref={asideRef}
        data-sidebar=""
        data-collapsed={effectiveCollapsed}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col bg-white transition-[transform,width,visibility] duration-200 ease-out motion-reduce:transition-none lg:static lg:z-auto lg:h-dvh",
          effectiveCollapsed ? "w-14" : "w-64 lg:w-56 xl:w-64",
          mobileOpen
            ? "translate-x-0"
            : "invisible -translate-x-full lg:visible lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200 px-3",
          )}
        >
          <Link
            aria-label="Go to home"
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-slate-100 dark:hover:bg-white/10"
            to="/"
          >
            <img
              alt=""
              className="h-5.5 w-5.5 object-contain opacity-95 transition group-hover:opacity-100"
              src={isDarkTheme ? "/forge-white.svg" : "/forge-black.svg"}
            />
          </Link>
          <Link
            aria-hidden={effectiveCollapsed}
            tabIndex={effectiveCollapsed ? -1 : undefined}
            className={cn(
              "min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 motion-reduce:transition-none",
              effectiveCollapsed && "opacity-0",
            )}
            to="/"
          >
            <p className="text-[14px] font-bold leading-5 text-slate-950">Forge</p>
            <p className="text-[11px] font-medium text-slate-500">
              Developer Workstation
            </p>
          </Link>
          <button
            aria-label="Close navigation"
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 lg:hidden"
            onClick={() => onMobileOpenChange(false)}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <nav
          aria-label="Tool navigation"
          id="primary-tool-navigation"
          className="scrollbar-forge min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-4"
        >
          <div className="space-y-3">
            {toolCategoryDefinitions.map((category) => {
              const tools = getToolsByCategory(category.id);

              if (tools.length === 0) {
                return null;
              }

              return (
                <SidebarGroup
                  category={category}
                  key={category.id}
                  sidebarCollapsed={effectiveCollapsed}
                  tools={tools}
                />
              );
            })}
          </div>
        </nav>

        <div
          className={cn("relative py-2.5", effectiveCollapsed ? "px-2" : "px-2.5")}
          ref={helpRef}
        >
          {helpOpen ? (
            <div
              className={cn(
                "absolute bottom-full mb-2 z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-950/10 dark:shadow-black/40",
                effectiveCollapsed ? "left-2 w-64" : "left-2.5 w-64",
              )}
            >
              <div className="p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold text-slate-500">
                  Support
                </p>
                <HelpMenuItem
                  icon={MessageCircle}
                  label="Ask a question"
                  onSelect={() => setHelpOpen(false)}
                  to="/support/ask"
                />
                <HelpMenuItem
                  icon={AlertTriangle}
                  label="Report an issue"
                  onSelect={() => setHelpOpen(false)}
                  to={projectLinks.reportIssue}
                />
                <HelpMenuItem
                  icon={HeartHandshake}
                  label="Share feedback"
                  onSelect={() => setHelpOpen(false)}
                  to="/support/feedback"
                />
              </div>
              <div className="border-t border-slate-100 p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold text-slate-500">
                  Documentation
                </p>
                <HelpMenuItem
                  icon={BookOpen}
                  label="Product docs"
                  onSelect={() => setHelpOpen(false)}
                  to="/docs"
                />
                <HelpMenuItem
                  icon={Route}
                  label="Guides"
                  onSelect={() => setHelpOpen(false)}
                  to="/docs/guides"
                />
                <HelpMenuItem
                  icon={Keyboard}
                  label="Keyboard shortcuts"
                  onSelect={() => setHelpOpen(false)}
                  to="/docs/shortcuts"
                />
              </div>
              <div className="border-t border-slate-100 p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold text-slate-500">
                  Trust
                </p>
                <HelpMenuItem
                  icon={ShieldCheck}
                  label="Privacy"
                  onSelect={() => setHelpOpen(false)}
                  to="/privacy"
                />
                <HelpMenuItem
                  icon={ScrollText}
                  label="Terms"
                  onSelect={() => setHelpOpen(false)}
                  to="/terms"
                />
              </div>
            </div>
          ) : null}

          <div className="sidebar-footer-actions" data-collapsed={effectiveCollapsed}>
            <Tooltip content={"Settings"} side="right">
              <NavLink
                aria-label="Settings"
                className={({ isActive }) =>
                  cn(
                    "flex h-9 w-9 items-center justify-center transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600",
                    {
                      "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none":
                        effectiveCollapsed && !isActive,
                      "rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none":
                        effectiveCollapsed && isActive,
                      "rounded-md bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200":
                        !effectiveCollapsed && isActive,
                      "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950":
                        !effectiveCollapsed && !isActive,
                    },
                  )
                }
                to="/settings"
              >
                <Settings aria-hidden="true" className="h-4 w-4 shrink-0" />
              </NavLink>
            </Tooltip>
            <Tooltip content={"Help and documentation"} side="right">
              <button
                aria-expanded={helpOpen}
                aria-label="Help"
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600",
                  {
                    "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none":
                      effectiveCollapsed && !helpOpen,
                    "rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none":
                      effectiveCollapsed && helpOpen,
                    "rounded-md bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200":
                      !effectiveCollapsed && helpOpen,
                    "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950":
                      !effectiveCollapsed && !helpOpen,
                  },
                )}
                onClick={() => setHelpOpen((value) => !value)}
                type="button"
              >
                <HelpCircle aria-hidden="true" className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip
              content={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              side="right"
            >
              <button
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!sidebarCollapsed}
                aria-controls="primary-tool-navigation"
                className={cn(
                  "hidden h-9 w-9 shrink-0 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600 motion-reduce:transition-none lg:flex",
                  effectiveCollapsed
                    ? "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none"
                    : "rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                )}
                onClick={toggleSidebar}
                type="button"
              >
                <ToggleIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HelpMenuItemProps {
  icon: LucideIcon;
  href?: string;
  label: string;
  onSelect?: () => void;
  to?: string;
}

function HelpMenuItem({
  href,
  icon: Icon,
  label,
  onSelect,
  to,
}: HelpMenuItemProps): JSX.Element {
  const className =
    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 [&.active]:bg-accent-50 [&.active]:text-accent-700 [&.active]:ring-1 [&.active]:ring-inset [&.active]:ring-accent-200 dark:[&.active]:ring-1 dark:[&.active]:ring-inset";

  if (to) {
    return (
      <NavLink className={className} end onClick={onSelect} to={to}>
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </NavLink>
    );
  }

  if (href) {
    return (
      <a
        className={className}
        href={href}
        onClick={onSelect}
        rel="noreferrer"
        target="_blank"
      >
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button className={className} onClick={onSelect} type="button">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
