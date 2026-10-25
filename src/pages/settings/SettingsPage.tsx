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
  const activeToolId = useWorkspaceStore((state) => state.activeToolId);
  const favoriteToolIds = useWorkspaceStore((state) => state.favoriteToolIds);
  const recentToolIds = useWorkspaceStore((state) => state.recentToolIds);
  const sidebarCollapsed = useWorkspaceStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar);
  const activeTool = toolRegistry.find((tool) => tool.id === activeToolId);

  return (
    <MainLayout
      eyebrow="Workspace"
      subtitle="Keep Forge's application-level preferences small, visible, and useful. Theme lives in the header so appearance stays one click away from every page."
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
                <Badge>Header menu</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Light, Dark, and System are controlled from the header. That keeps
                appearance available across tools without burying it inside Settings.
              </p>
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
                Forge keeps tool drafts and UI preferences in this browser. It does not
                require an account or send workspace state to a server.
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
                  href="https://github.com/orcace/forge/issues"
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  GitHub issues
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
