import type { HtmlPreviewState } from "./html-preview.schema";

export interface HtmlPreviewInput {
  value: string;
}

interface PersistedHtmlPreviewState extends Omit<
  HtmlPreviewState,
  "indentSize" | "lineWrap"
> {
  indentSize?: number;
  lineWrap?: boolean;
}

const sampleHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Forge HTML Preview</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f8fafc;
        --card: #ffffff;
        --text: #0f172a;
        --muted: #64748b;
        --primary: #2563eb;
        --accent: #10b981;
        --border: #e2e8f0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: Inter, system-ui, sans-serif;
        margin: 0;
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
      }

      header {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        color: white;
        padding: 48px 32px;
      }

      header p {
        max-width: 720px;
        color: rgb(255 255 255 / 0.84);
        font-size: 1.05rem;
      }

      main {
        display: grid;
        gap: 24px;
        max-width: 1120px;
        margin: 0 auto;
        padding: 32px;
      }

      .panel {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 12px 30px rgb(15 23 42 / 0.06);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .metric {
        border-left: 4px solid var(--primary);
      }

      .metric strong {
        display: block;
        font-size: 2rem;
        line-height: 1;
      }

      .muted {
        color: var(--muted);
      }

      mark {
        border-radius: 6px;
        background: #fef3c7;
        padding: 2px 6px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 10px;
      }

      th,
      td {
        border: 1px solid var(--border);
        padding: 12px;
        text-align: left;
      }

      th {
        background: #f1f5f9;
      }

      input,
      select,
      textarea,
      button {
        font: inherit;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        margin-top: 6px;
        padding: 10px 12px;
      }

      button {
        border: 0;
        border-radius: 10px;
        background: var(--primary);
        color: white;
        cursor: pointer;
        padding: 10px 14px;
      }

      blockquote {
        border-left: 4px solid var(--accent);
        color: var(--muted);
        margin: 0;
        padding-left: 16px;
      }

      pre {
        overflow: auto;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
      }

      canvas {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 12px;
      }

      details {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 14px 16px;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        padding: 6px 10px;
        font-weight: 700;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: currentColor;
      }

      @media (max-width: 720px) {
        header,
        main {
          padding: 24px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Forge HTML Preview</h1>
      <p>
        Edit HTML, run scripts in a sandboxed iframe, and inspect how common
        semantic elements, controls, tables, canvas, and responsive layouts render.
      </p>
    </header>

    <main>
      <section class="grid" aria-label="Summary metrics">
        <article class="panel metric">
          <span class="muted">Elements covered</span>
          <strong>32+</strong>
          <p>Headings, text styles, lists, tables, forms, media, and scripts.</p>
        </article>
        <article class="panel metric">
          <span class="muted">Preview mode</span>
          <strong>Safe</strong>
          <p>Output runs inside an isolated iframe with Forge scroll styling.</p>
        </article>
        <article class="panel metric">
          <span class="muted">Workflow</span>
          <strong>Fast</strong>
          <p>Beautify, minify, copy, download, and preview without leaving the page.</p>
        </article>
      </section>

      <section class="panel">
        <h2>Text and Semantic HTML</h2>
        <p>
          This starter document includes <strong>bold text</strong>,
          <em>emphasis</em>, <mark>highlighted notes</mark>, inline
          <code>code</code>, and semantic sections that are useful for quick
          rendering checks.
        </p>
        <blockquote>
          A good preview should make structure, spacing, interactivity, and overflow
          problems easy to spot before the HTML is exported.
        </blockquote>
      </section>

      <section class="panel">
        <h2>Lists and Details</h2>
        <div class="grid">
          <div>
            <h3>Checklist</h3>
            <ul>
              <li>Validate typography and spacing</li>
              <li>Check responsive behavior</li>
              <li>Verify table and form controls</li>
            </ul>
          </div>
          <details open>
            <summary>What is included?</summary>
            <p>
              Cards, lists, form fields, tables, a code block, a canvas chart, and
              a small script that updates the chart label.
            </p>
          </details>
        </div>
      </section>

      <section class="panel">
        <h2>Data Table</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>HTML rendering</td>
              <td>Ready</td>
              <td>Full documents and fragments are supported.</td>
            </tr>
            <tr>
              <td>Inline scripts</td>
              <td>Sandboxed</td>
              <td>Useful for lightweight UI interactions and demos.</td>
            </tr>
            <tr>
              <td>Formatter</td>
              <td>Available</td>
              <td>HTML, CSS inside style tags, and JavaScript inside script tags.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Form Controls</h2>
        <form>
          <label>
            Project name
            <input value="Forge Preview Demo" />
          </label>
          <label>
            Environment
            <select>
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </label>
          <label>
            Notes
            <textarea rows="4">Use this area to test multiline form styling.</textarea>
          </label>
          <button type="button" id="notifyButton">Update status</button>
        </form>
      </section>

      <section class="panel">
        <h2>Code and Canvas</h2>
        <pre><code>const preview = {
  renderer: "sandboxed iframe",
  supportsScripts: true,
  formatter: ["html", "css", "javascript"]
};</code></pre>
        <canvas id="chart" width="900" height="220"></canvas>
        <p class="muted" id="chartLabel">Chart rendered with canvas.</p>
      </section>
    </main>

    <script>
      const canvas = document.getElementById("chart");
      const ctx = canvas.getContext("2d");
      const values = [34, 68, 52, 88, 74, 96, 63];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2563eb";
      ctx.beginPath();

      values.forEach((value, index) => {
        const x = 70 + index * 120;
        const y = 180 - value;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.stroke();

      document.getElementById("notifyButton").addEventListener("click", () => {
        document.getElementById("chartLabel").textContent =
          "Status updated at " + new Date().toLocaleTimeString();
      });
    </script>
  </body>
</html>`;

const previewScrollbarStyle = `<style data-forge-preview-scrollbar>
html {
  scrollbar-color: rgb(148 163 184 / 0.65) transparent;
  scrollbar-width: thin;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgb(148 163 184 / 0.45);
  border: 3px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(100 116 139 / 0.7);
  border: 3px solid transparent;
  background-clip: padding-box;
}
</style>`;

export function createHtmlPreviewState(): HtmlPreviewState {
  return {
    autoUpdate: true,
    html: sampleHtml,
    indentSize: 2,
    lineWrap: true,
    previewHtml: sampleHtml,
  };
}

export function normalizeHtmlPreviewState(
  input: PersistedHtmlPreviewState,
): HtmlPreviewState {
  const indentSize = input.indentSize;

  return {
    autoUpdate: input.autoUpdate,
    html: input.html,
    indentSize:
      typeof indentSize === "number" &&
      Number.isInteger(indentSize) &&
      indentSize >= 1 &&
      indentSize <= 10
        ? indentSize
        : 2,
    lineWrap: typeof input.lineWrap === "boolean" ? input.lineWrap : true,
    previewHtml: input.previewHtml,
  };
}

export function normalizeHtmlPreviewInput(input: string): string {
  return input.trim();
}

export function hasHtmlPreviewInput(input: string): boolean {
  return normalizeHtmlPreviewInput(input).length > 0;
}

export function createHtmlPreviewDocument(input: string): string {
  const html = normalizeHtmlPreviewInput(input);

  if (!html) {
    return `<!doctype html><html><head>${previewScrollbarStyle}</head><body></body></html>`;
  }

  if (/<html[\s>]/i.test(html)) {
    return injectPreviewScrollbarStyle(html);
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${previewScrollbarStyle}
</head>
<body>
${html}
</body>
</html>`;
}

function injectPreviewScrollbarStyle(document: string): string {
  if (/data-forge-preview-scrollbar/i.test(document)) {
    return document;
  }

  if (/<\/head>/i.test(document)) {
    return document.replace(/<\/head>/i, `${previewScrollbarStyle}\n</head>`);
  }

  if (/<html[\s>]/i.test(document)) {
    return document.replace(
      /<html([^>]*)>/i,
      `<html$1><head>${previewScrollbarStyle}</head>`,
    );
  }

  return `${previewScrollbarStyle}${document}`;
}

export async function minifyHtml(input: string): Promise<string> {
  const { compactHtmlTags } = await import("./html-format.service");
  return compactHtmlTags(input);
}

export async function beautifyHtml(input: string, indentSize = 2): Promise<string> {
  const { formatHtml } = await import("./html-format.service");
  return formatHtml(input, indentSize);
}
