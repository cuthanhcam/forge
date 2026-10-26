export interface DiagramView {
  x: number;
  y: number;
  scale: number;
}
export const minimumDiagramScale = 0.01;
export const maximumDiagramScale = 8;
export function clampDiagramScale(scale: number): number {
  return Math.max(minimumDiagramScale, Math.min(maximumDiagramScale, scale));
}
export function zoomDiagram(
  view: DiagramView,
  scale: number,
  anchor: { x: number; y: number },
): DiagramView {
  const next = clampDiagramScale(scale);
  const ratio = next / view.scale;
  return {
    scale: next,
    x: anchor.x - (anchor.x - view.x) * ratio,
    y: anchor.y - (anchor.y - view.y) * ratio,
  };
}

/** The renderer has sanitized this SVG. Scope IDs so inline and expanded copies cannot collide. */
export function scopeDiagramSvg(
  svg: string,
  prefix: string,
): { svg: string; width: number; height: number } {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  const box = (root.getAttribute("viewBox") ?? "").trim().split(/[ ,]+/).map(Number);
  const width =
    box.length === 4 && box[2] > 0
      ? box[2]
      : parseFloat(root.getAttribute("width") ?? "") || 800;
  const height =
    box.length === 4 && box[3] > 0
      ? box[3]
      : parseFloat(root.getAttribute("height") ?? "") || 600;
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
  const ids = new Map(
    nodes.filter((node) => node.id).map((node) => [node.id, `${prefix}-${node.id}`]),
  );
  // Compile once per SVG, rather than once per attribute/ID on complex graphs.
  const references = ids.size
    ? new RegExp(
        `#(${[...ids.keys()]
          .sort((a, b) => b.length - a.length)
          .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")})(?![\\w-])`,
        "g",
      )
    : null;
  const replaceReferences = (value: string): string =>
    references
      ? value.replace(references, (_match, id: string) => `#${ids.get(id)}`)
      : value;
  for (const node of nodes) {
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name === "id")
        node.setAttribute(attribute.name, ids.get(attribute.value)!);
      else if (
        attribute.name === "aria-labelledby" ||
        attribute.name === "aria-describedby"
      )
        node.setAttribute(
          attribute.name,
          attribute.value
            .split(/\s+/)
            .map((id) => ids.get(id) ?? id)
            .join(" "),
        );
      else node.setAttribute(attribute.name, replaceReferences(attribute.value));
    }
    if (node.localName === "style")
      node.textContent = replaceReferences(node.textContent ?? "");
  }
  root.setAttribute("width", String(width));
  root.setAttribute("height", String(height));
  root.setAttribute("style", "display:block;width:100%;height:100%;max-width:none");
  root.setAttribute("role", "img");
  if (!root.hasAttribute("aria-labelledby"))
    root.setAttribute("aria-label", "Mermaid diagram");
  return { svg: new XMLSerializer().serializeToString(root), width, height };
}
