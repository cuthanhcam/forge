import { projectLinks } from "@/core/config/project-links";
import { useThemeStore } from "@/core/theme/theme.store";
import { themeOptions } from "@/core/theme/theme.options";
import type { JSX } from "react";
import {
  BookOpen,
  Database,
  ExternalLink,
  LifeBuoy,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  Paintbrush,
  Star,
} from "lucide-react";
import { toolRegistry } from "@/core/registry/tool.registry";
import { useWorkspaceStore } from "@/core/workspace/workspace.store";
import { MainLayout } from "@/layouts/MainLayout";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const persistedTools = toolRegistry.filter((tool) => tool.persist);

export function SettingsPage(): JSX.Element {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const activeToolId = useWorkspaceStore((state) => state.activeToolId);
  const favoriteToolIds = useWorkspaceStore((state) => state.favoriteToolIds);
  const recentToolIds = useWorkspaceStore((state) => state.recentToolIds);
  const sidebarCollapsed = useWorkspaceStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);
  const activeTool = toolRegistry.find((tool) => tool.id === activeToolId);

  return (
    <MainLayout
      eyebrow="Workspace"
      subtitle="Make the workspace yours. Choose an appearance, adjust navigation, and understand what stays in this browser."
      title="Settings"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/[0.03]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              {sidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-950">Navigation</h2>
                <Badge>{sidebarCollapsed ? "Collapsed" : "Expanded"}</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                The left navigation is the product map for Forge. Keep it open while
                exploring tools, or collapse it when you want more editor room.
              </p>
              <Button className="mt-4" onClick={toggleSidebar} size="sm">
                {sidebarCollapsed ? (
                  <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
                )}
                {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/[0.03]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Paintbrush aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-950">Appearance</h2>
                <Badge>
                  {mode === "system"
                    ? "Follow device"
                    : mode === "dark"
                      ? "Dark"
                      : "Light"}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose Light, Dark, or follow your device. This preference is shared with
                the header and remembered in this browser.
              </p>
              <fieldset className="mt-4 flex flex-wrap gap-2">
                <legend className="sr-only">Appearance theme</legend>
                {themeOptions.map(({ mode: option, label, icon: Icon }) => (
                  <label key={option} className="relative cursor-pointer">
                    <input
                      className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      type="radio"
                      name="appearance"
                      value={option}
                      checked={mode === option}
                      onChange={() => setMode(option)}
                    />
                    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground transition-colors hover:bg-slate-100 peer-checked:border-accent-600 peer-checked:bg-accent-50 peer-checked:text-accent-700 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {label}
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/[0.03]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Database aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">Local workspace</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Markdown, HTML, Diff, JSON and Regex drafts can be saved in this browser.
                JWT tokens, verification secrets and generated passwords are not saved by
                Forge. Browser storage is readable by people or extensions with access to
                your profile; it is not a secure vault.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={<MonitorCog aria-hidden="true" className="h-4 w-4" />}
                  label="Active tool"
                  value={activeTool?.name ?? "None"}
                />
                <StatCard
                  icon={<Star aria-hidden="true" className="h-4 w-4" />}
                  label="Favorites"
                  value={favoriteToolIds.length.toString()}
                />
                <StatCard
                  icon={<Database aria-hidden="true" className="h-4 w-4" />}
                  label="Persisted tools"
                  value={persistedTools.length.toString()}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                To remove drafts and preferences, clear this site&apos;s data in your
                browser settings. Export important drafts first. Clearing a tool input may
                not remove previously saved browser data.{" "}
                <a
                  className="text-accent-700 underline underline-offset-4"
                  href="/privacy"
                >
                  Read the privacy model
                </a>
                .
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Recent tools tracked: {recentToolIds.length}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/[0.03]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <LifeBuoy aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">
                Help and documentation
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use docs for product conventions and GitHub issues for bugs, requests, or
                reproducible tool problems.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-medium text-foreground shadow-sm transition hover:border-accent-200 hover:bg-accent-50"
                  href="/docs"
                >
                  <BookOpen aria-hidden="true" className="h-4 w-4" />
                  Product docs
                </a>
                <a
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-medium text-foreground shadow-sm transition hover:border-accent-200 hover:bg-accent-50"
                  href={projectLinks.reportIssue}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  Report an issue
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}
