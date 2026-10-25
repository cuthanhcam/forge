import DOMPurify from "dompurify";
import csharp from "highlight.js/lib/languages/csharp";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import { marked, Renderer } from "marked";
import markedKatex from "marked-katex-extension";
import type { MarkdownPreviewState, MarkdownPreviewTab } from "./markdown-preview.schema";

interface PersistedMarkdownPreviewState extends Omit<
  MarkdownPreviewState,
  "tabsCollapsed" | "viewMode"
> {
  tabsCollapsed?: boolean;
  previewVisible?: boolean;
  viewMode?: MarkdownPreviewState["viewMode"];
}

export interface MarkdownPreviewInput {
  value: string;
}

export const markdownPreviewGuide = `# Markdown Syntax Guide

A complete reference for all Markdown features supported by Forge Markdown Preview.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Text Formatting

**Bold text** using \`**text**\`

*Italic text* using \`*text*\`

***Bold and italic*** using \`***text***\`

~~Strikethrough~~ using \`~~text~~\`

Inline \`code\` using backticks

## Links and Images

[GitHub - cuthanhcam](https://github.com/cuthanhcam)

Auto-linked URL: https://github.com/cuthanhcam

## Lists

### Ordered List

1. First item
2. Second item
3. Third item
    1. Indented item
    2. Another indented item
4. Fourth item

### Unordered List

- Apple
- Banana
    - Yellow banana
    - Green banana
- Cherry

### Task List

- [x] Write the documentation
- [x] Add syntax highlighting
- [ ] Review pull request
- [ ] Deploy to production

## Blockquotes

> "The best way to predict the future is to invent it." - Alan Kay

Nested blockquotes:

> First level
> > Second level
> > > Third level

## Tables

| Feature           | Supported |  Notes              |
|:------------------|:---------:|--------------------:|
| GFM Tables        | Yes       | Full support        |
| Left aligned      | Yes       | Use \`:---\`          |
| Center aligned    | Yes       | Use \`:---:\`         |
| Right aligned     | Yes       | Use \`---:\`          |

## Code Blocks

### C#

\`\`\`csharp
using System;

public static class Program
{
    public static string Greet(string name)
    {
        var message = $"Hello, {name}!";
        Console.WriteLine(message);
        return message;
    }
}
\`\`\`

### Rust

\`\`\`rust
fn fibonacci(count: usize) -> Vec<u64> {
    let mut values = Vec::with_capacity(count);
    let (mut a, mut b) = (0, 1);

    for _ in 0..count {
        values.push(a);
        (a, b) = (b, a + b);
    }

    values
}

fn main() {
    println!("{:?}", fibonacci(10));
}
\`\`\`

### JSON

\`\`\`json
{
  "name": "Forge Markdown Preview",
  "version": "1.0.0",
  "features": ["editor", "split", "preview", "sync", "export"]
}
\`\`\`

## Mathematical Expressions

Inline math: $E = mc^2$ and $\\alpha + \\beta = \\gamma$

Display equations:

$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## Mermaid Diagrams

### Flowchart

\`\`\`mermaid
flowchart LR
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[Deploy]
    D --> B
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    User->>Editor: Type markdown
    Editor->>Preview: Render content
    Preview-->>User: Live preview
    User->>Export: Save as PDF
\`\`\`

## HTML Elements

Superscript: x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup>

Subscript: H<sub>2</sub>O, CO<sub>2</sub>

Keyboard keys: Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save

<abbr title="Hypertext Markup Language">HTML</abbr> abbreviation with tooltip

<mark>Highlighted text</mark> for emphasis

## Horizontal Rules

Three different syntaxes all produce horizontal rules:

---

***

___

## Escaping Characters

Use backslash to display literal characters:

\\*Not italic\\* and \\*\\*not bold\\*\\*

\\# Not a heading

\\- Not a list item
`;

let rendererConfigured = false;

hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cs", csharp);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("rs", rust);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function configureMarkedRenderer(): void {
  if (rendererConfigured) {
    return;
  }

  const renderer = new Renderer();

  renderer.code = ({ text, lang, escaped }) => {
    const language = (lang ?? "").trim().split(/\s+/)[0]?.toLowerCase();
    const code = escaped ? text : escapeHtml(text);

    if (language === "mermaid") {
      return `<div class="mermaid">${code}</div>`;
    }

    const highlightedCode =
      language && hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : code;
    const languageClass = language ? ` language-${escapeHtml(language)}` : "";

    return `<pre><code class="hljs${languageClass}">${highlightedCode}</code></pre>`;
  };

  marked.use(
    markedKatex({
      nonStandard: true,
      throwOnError: false,
    }),
    { renderer },
  );
  rendererConfigured = true;
}

export function normalizeMarkdownPreviewState(
  input: PersistedMarkdownPreviewState,
): MarkdownPreviewState {
  return {
    activeTabId: input.activeTabId,
    syncScroll: input.syncScroll,
    tabsCollapsed: input.tabsCollapsed ?? false,
    // Normalize layout preferences only; document text always belongs to the user.
    tabs: input.tabs,
    viewMode: input.viewMode ?? (input.previewVisible === false ? "editor" : "split"),
  };
}

export function createMarkdownPreviewTab(index: number): MarkdownPreviewTab {
  return {
    content: index === 1 ? markdownPreviewGuide : "",
    id: crypto.randomUUID(),
    title: index === 1 ? "Welcome" : `Untitled ${index}`,
    updatedAt: Date.now(),
  };
}

export function createMarkdownPreviewGuideTab(): MarkdownPreviewTab {
  return {
    content: markdownPreviewGuide,
    id: crypto.randomUUID(),
    title: "Markdown Guide",
    updatedAt: Date.now(),
  };
}

export function createMarkdownPreviewState(): MarkdownPreviewState {
  const tab = createMarkdownPreviewTab(1);

  return {
    activeTabId: tab.id,
    syncScroll: true,
    tabs: [tab],
    tabsCollapsed: false,
    viewMode: "split",
  };
}

export function normalizeMarkdownPreviewInput(input: string): string {
  return input.trim();
}

export function hasMarkdownPreviewInput(input: string): boolean {
  return normalizeMarkdownPreviewInput(input).length > 0;
}

export function renderMarkdownToHtml(input: string): string {
  configureMarkedRenderer();

  const rawHtml = marked.parse(input, {
    async: false,
    breaks: true,
    gfm: true,
  });

  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["class"],
    USE_PROFILES: { html: true },
  });
}

export function estimateMarkdownReadTime(input: string): number {
  const words = normalizeMarkdownPreviewInput(input).split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 220));
}
