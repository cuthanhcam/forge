import { describe, expect, it } from "vitest";
import { buildMarkdownOutline } from "./markdown-outline.service";
import { renderMarkdownToHtml } from "./markdown-preview.service";

describe("Markdown outline", () => {
  it("uses rendered headings and inline text, excluding fenced code and reserving duplicate slugs", () => {
    const result = buildMarkdownOutline(
      renderMarkdownToHtml(
        "# A **bold** heading\n\n## Repeat\n## Repeat\n## Repeat-1\n\n```md\n# Not a heading\n```",
      ),
    );
    expect(result.headings.map((heading) => heading.title)).toEqual([
      "A bold heading",
      "Repeat",
      "Repeat",
      "Repeat-1",
    ]);
    expect(result.headings.map((heading) => heading.level)).toEqual([1, 2, 2, 2]);
    expect(new Set(result.headings.map((heading) => heading.id)).size).toBe(4);
    expect(result.headings[2].id).toBe("forge-heading-repeat-1");
    expect(result.headings[3].id).toBe("forge-heading-repeat-1-1");
  });
  it("preserves safe author anchors, supports Unicode and remaps heading links without clobbering IDs", () => {
    const result = buildMarkdownOutline(
      renderMarkdownToHtml(
        '[Go](#location)\n\n# location\n# Ti?ng Vi?t\n\n<h2 id="custom">Custom</h2>\n\n[Author](#custom)',
      ),
    );
    const parsed = new DOMParser().parseFromString(result.html, "text/html");
    expect(parsed.querySelector("h1")?.id).toBe("forge-heading-location");
    expect(result.headings[1].title).toBe("Ti?ng Vi?t");
    expect(parsed.querySelector('a[href="#forge-heading-location"]')).not.toBeNull();
    expect(parsed.querySelector('h2[id="custom"]')).not.toBeNull();
    expect(parsed.querySelector('a[href="#custom"]')).not.toBeNull();
  });
});
