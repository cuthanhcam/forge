import { describe, expect, it } from "vitest";
import {
  clampDiagramScale,
  scopeDiagramSvg,
  zoomDiagram,
} from "./diagram-viewer.service";

describe("diagram viewport geometry", () => {
  it("keeps the world point under the zoom anchor fixed and enforces limits", () => {
    const next = zoomDiagram({ x: -10, y: 20, scale: 0.5 }, 1, { x: 50, y: 80 });
    expect(next.x + 120 * next.scale).toBe(50);
    expect(next.y + 120 * next.scale).toBe(80);
    expect(clampDiagramScale(0)).toBe(0.01);
    expect(clampDiagramScale(99)).toBe(8);
  });
  it("scopes IDs, CSS, marker references and accessible labels for independent copies", () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" id="root" viewBox="0 0 1200 800" aria-labelledby="title"><style>#root .node{fill:red}</style><title id="title">Flow</title><defs><marker id="arrow"/></defs><path id="node" marker-end="url(#arrow)"/><use href="#node"/></svg>';
    const first = scopeDiagramSvg(source, "inline");
    const second = scopeDiagramSvg(source, "expanded");
    expect(first.width).toBe(1200);
    expect(first.height).toBe(800);
    expect(first.svg).toContain('id="inline-root"');
    expect(first.svg).toContain("#inline-root .node");
    expect(first.svg).toContain("url(#inline-arrow)");
    expect(first.svg).toContain('aria-labelledby="inline-title"');
    expect(first.svg).toContain('href="#inline-node"');
    expect(second.svg).not.toContain('id="inline-');
    expect(second.svg).toContain("url(#expanded-arrow)");
  });
});
