import { describe, expect, it } from "vitest";
import {
  createMarkdownPreviewState,
  estimateMarkdownReadTime,
  hasMarkdownPreviewInput,
  normalizeMarkdownPreviewInput,
  normalizeMarkdownPreviewState,
  renderMarkdownToHtml,
} from "./markdown-preview.service";

describe("markdown-preview service", () => {
  it("normalizes user input", () => {
    expect(normalizeMarkdownPreviewInput("  value  ")).toBe("value");
  });

  it("detects empty input", () => {
    expect(hasMarkdownPreviewInput("   ")).toBe(false);
  });

  it("creates a default persistent tab state", () => {
    const state = createMarkdownPreviewState();

    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe(state.tabs[0]?.id);
    expect(state.viewMode).toBe("split");
  });

  it("never migrates Welcome document content based on text fragments", () => {
    const state = createMarkdownPreviewState();
    state.tabs[0].content = "My Forge Markdown Workspace notes: markdownviewer.org";
    expect(normalizeMarkdownPreviewState(state).tabs).toEqual(state.tabs);
  });

  it("renders markdown as sanitized html", () => {
    const html = renderMarkdownToHtml("# Title\n\n<script>alert('x')</script>");

    expect(html).toContain("<h1>Title</h1>");
    expect(html).not.toContain("<script>");
  });

  it("estimates read time with a minimum of one minute", () => {
    expect(estimateMarkdownReadTime("short note")).toBe(1);
  });
});
