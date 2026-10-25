import DOMPurify from "dompurify";
import type mermaid from "mermaid";

type DiagramTheme = "default" | "dark";
let sequence = 0;
let renderQueue: Promise<unknown> = Promise.resolve();
let modulePromise: Promise<{ default: typeof mermaid }> | undefined;

/** Mermaid configuration is global. Serialize configuration and rendering so
 * old jobs cannot apply a different theme to a newer document's render. */
export function renderMermaidDiagram(
  source: string,
  theme: DiagramTheme,
  isCurrent: () => boolean,
): Promise<string | null> {
  const task = renderQueue.then(async () => {
    if (!isCurrent()) return null;
    modulePromise ??= import("mermaid").catch((error: unknown) => {
      modulePromise = undefined;
      throw error;
    });
    const { default: mermaid } = await modulePromise;
    if (!isCurrent()) return null;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme,
      htmlLabels: false,
      flowchart: { htmlLabels: false },
      suppressErrorRendering: true,
    });
    // Keep temporary/error SVGs outside React-owned content, but measurable.
    const staging = document.createElement("div");
    staging.style.cssText =
      "position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none";
    document.body.append(staging);
    try {
      const { svg } = await mermaid.render(
        `forge-mermaid-${++sequence}`,
        source,
        staging,
      );
      if (!isCurrent()) return null;
      return DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
    } finally {
      staging.remove();
    }
  });
  // A malformed diagram must not poison the queue for following diagrams.
  renderQueue = task.catch(() => undefined);
  return task;
}
