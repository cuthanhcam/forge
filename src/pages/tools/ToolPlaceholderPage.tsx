import type { JSX, LazyExoticComponent } from "react";
import { lazy, Suspense, useEffect } from "react";
import { Link, useParams } from "react-router";
import { getToolById } from "@/core/registry/tool.registry";
import { useWorkspaceStore } from "@/core/workspace/workspace.store";
import { ToolLayout } from "@/layouts/ToolLayout";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

const toolPages: Record<string, LazyExoticComponent<() => JSX.Element>> = {
  base64: lazy(() =>
    import("@/features/base64").then((module) => ({ default: module.Base64Page })),
  ),
  "case-converter": lazy(() =>
    import("@/features/case-converter").then((module) => ({
      default: module.CaseConverterPage,
    })),
  ),
  "diff-checker": lazy(() =>
    import("@/features/diff-checker").then((module) => ({
      default: module.DiffCheckerPage,
    })),
  ),
  "hash-generator": lazy(() =>
    import("@/features/hash").then((module) => ({ default: module.HashGeneratorPage })),
  ),
  "html-preview": lazy(() =>
    import("@/features/html-preview").then((module) => ({
      default: module.HtmlPreviewPage,
    })),
  ),
  "json-formatter": lazy(() =>
    import("@/features/json").then((module) => ({ default: module.JsonToolsPage })),
  ),
  "json-yaml": lazy(() =>
    import("@/features/json-yaml").then((module) => ({ default: module.JsonYamlPage })),
  ),
  "jwt-decoder": lazy(() =>
    import("@/features/jwt-decoder").then((module) => ({
      default: module.JwtDecoderPage,
    })),
  ),
  "jwt-secret": lazy(() =>
    import("@/features/jwt-secret").then((module) => ({ default: module.JwtSecretPage })),
  ),
  "markdown-preview": lazy(() =>
    import("@/features/markdown-preview").then((module) => ({
      default: module.MarkdownPreviewPage,
    })),
  ),
  "password-generator": lazy(() =>
    import("@/features/password-generator").then((module) => ({
      default: module.PasswordGeneratorPage,
    })),
  ),
  "regex-tester": lazy(() =>
    import("@/features/regex-tester").then((module) => ({
      default: module.RegexTesterPage,
    })),
  ),
  slugify: lazy(() =>
    import("@/features/slugify").then((module) => ({ default: module.SlugifyPage })),
  ),
  timestamp: lazy(() =>
    import("@/features/timestamp").then((module) => ({
      default: module.TimestampPage,
    })),
  ),
  "url-encoder": lazy(() =>
    import("@/features/url-encoder").then((module) => ({
      default: module.UrlEncoderPage,
    })),
  ),
  uuid: lazy(() =>
    import("@/features/uuid").then((module) => ({ default: module.UuidPage })),
  ),
};

export function ToolPlaceholderPage(): JSX.Element {
  const { toolId } = useParams();
  const setActiveTool = useWorkspaceStore((state) => state.setActiveTool);
  const trackRecentTool = useWorkspaceStore((state) => state.trackRecentTool);
  const tool = toolId ? getToolById(toolId) : undefined;

  useEffect(() => {
    if (!tool) {
      setActiveTool(null);
      return;
    }

    setActiveTool(tool.id);
    trackRecentTool(tool.id);

    return () => setActiveTool(null);
  }, [setActiveTool, tool, trackRecentTool]);

  if (!tool) {
    return <NotFoundPage />;
  }

  const ToolPage = toolPages[tool.id];

  if (ToolPage) {
    return (
      <ToolLayout showHeader={false} tool={tool}>
        <Suspense fallback={<LoadingState />}>
          <ToolPage />
        </Suspense>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout tool={tool}>
      <EmptyState
        action={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent-solid px-4 text-sm font-medium text-accent-on-solid shadow-sm transition hover:bg-accent-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            to="/docs"
          >
            View implementation guide
          </Link>
        }
        description="The registry, navigation, and tool shell are in place. Tool-specific service logic and UI will be implemented in the next milestones."
        title={`${tool.name} is queued for implementation`}
      />
    </ToolLayout>
  );
}
