import { describe, expect, it } from "vitest";
import {
  beautifyHtml,
  createHtmlPreviewDocument,
  createHtmlPreviewState,
  hasHtmlPreviewInput,
  minifyHtml,
  normalizeHtmlPreviewInput,
} from "./html-preview.service";

describe("html-preview service", () => {
  it("normalizes user input", () => {
    expect(normalizeHtmlPreviewInput("  value  ")).toBe("value");
  });

  it("detects empty input", () => {
    expect(hasHtmlPreviewInput("   ")).toBe(false);
  });

  it("creates the default preview state", () => {
    const state = createHtmlPreviewState();

    expect(state.autoUpdate).toBe(true);
    expect(state.previewHtml).toBe(state.html);
  });

  it("wraps html fragments in a full document", () => {
    const document = createHtmlPreviewDocument("<h1>Hello</h1>");

    expect(document).toContain("<!doctype html>");
    expect(document).toContain("<h1>Hello</h1>");
  });

  it("injects preview chrome into full html documents", () => {
    const document = "<html><body>Ready</body></html>";
    const previewDocument = createHtmlPreviewDocument(document);

    expect(previewDocument).toContain("<body>Ready</body>");
    expect(previewDocument).toContain("data-forge-preview-scrollbar");
  });

  it("compacts tag syntax while preserving text spacing", async () => {
    expect(
      await minifyHtml(
        '<main   class="a  b"  >  <span>one</span> <span>two</span>  </main  >',
      ),
    ).toBe('<main class="a  b">  <span>one</span> <span>two</span>  </main>');
  });

  it("beautifies html with a custom indent size", async () => {
    expect(await beautifyHtml("<main>\n<h1>Title</h1>\n</main>", 4)).toContain(
      "    <h1>Title</h1>",
    );
  });

  const protectedContent = `<script>const value = "a  b > c"; const tpl = \`first
    second; { ? : }\`;</script><style>.x::after { content: "a  b;{}"; }</style><pre>  first
    second
</pre><textarea>  user
    input </textarea><!-- keep  this comment -->`;

  it("does not rewrite embedded strings, scripts, styles or preformatted text", async () => {
    expect(await minifyHtml(protectedContent)).toBe(protectedContent);
    const formatted = await beautifyHtml(protectedContent);
    for (const tag of ["script", "style", "pre", "textarea"]) {
      const original = new DOMParser()
        .parseFromString(protectedContent, "text/html")
        .querySelector(tag)?.textContent;
      const output = new DOMParser()
        .parseFromString(formatted, "text/html")
        .querySelector(tag)?.textContent;
      expect(output).toBe(original);
    }
    expect(formatted).toContain("<!-- keep  this comment -->");
  });

  it("preserves quoted angle brackets, raw attribute values and unquoted slashes", async () => {
    expect(await minifyHtml("<img   src=x/>")).toBe("<img src=x/>");
    expect(await minifyHtml("<img   src=x />")).toBe("<img src=x />");
    expect(
      await minifyHtml("<div   data-value=\"a  >  b\"   title='two  spaces' >x</div>"),
    ).toBe("<div data-value=\"a  >  b\" title='two  spaces'>x</div>");
  });

  it("preserves whitespace in an explicitly preformatted container", async () => {
    const input = '<div style="white-space: pre">  first\n    second\n</div>';
    expect((await beautifyHtml(input)).trimEnd()).toBe(input);
  });

  it("handles template content and foreign self-closing tags", async () => {
    expect(
      await minifyHtml(
        '<template><svg  viewBox="0 0 10 10" ><path  d="M 1  2" /></svg></template>',
      ),
    ).toBe('<template><svg viewBox="0 0 10 10"><path d="M 1  2" /></svg></template>');
  });

  it("rejects malformed HTML instead of rewriting a repaired parse tree", async () => {
    await expect(beautifyHtml('<div title="unfinished>')).rejects.toThrow("Invalid HTML");
    await expect(minifyHtml('<div title="unfinished>')).rejects.toThrow("Invalid HTML");
    await expect(minifyHtml('<div a="1" a="2"></div>')).rejects.toThrow(
      "duplicate-attribute",
    );
  });
});
