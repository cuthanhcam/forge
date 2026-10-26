import { expect, test } from "@playwright/test";

const flowchart = "```mermaid\nflowchart TD\n  Start --> Finish\n```";
const sequence = "```mermaid\nsequenceDiagram\n  Alice->>Bob: Latest message\n```";

test.beforeEach(async ({ page }) => {
  await page.goto("/tools/markdown-preview");
});

test("renders the guide flowchart and sequence diagram", async ({ page }) => {
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(2);
  for (const diagram of await page
    .locator(".mermaid [data-diagram-artwork] > svg")
    .all()) {
    const box = await diagram.boundingBox();
    expect(box?.width).toBeGreaterThan(20);
    expect(box?.height).toBeGreaterThan(20);
  }
});

test("rapid edits show only the latest diagram and survive layout changes", async ({
  page,
}) => {
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(flowchart);
  await editor.fill("```mermaid\nflowchart TD\n  Broken[\n```");
  await editor.fill(sequence);
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
  await expect(page.locator(".mermaid")).toContainText("Latest message");
  await page.getByRole("button", { name: "Select editor layout" }).click();
  await page.getByRole("menuitem", { name: "Preview", exact: true }).click();
  await expect(page.locator(".mermaid")).toContainText("Latest message");
  await page.getByRole("button", { name: "Select editor layout" }).click();
  await page.getByRole("menuitem", { name: "Split", exact: true }).click();
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
});

test("invalid diagram shows an actionable error and valid edits recover", async ({
  page,
}) => {
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill("```mermaid\nthis is not a diagram\n```");
  await expect(page.getByRole("alert")).toContainText("Check the diagram syntax");
  await expect(page.locator(".mermaid")).toContainText("this is not a diagram");
  await editor.fill(flowchart);
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
  await expect(page.locator(".mermaid")).toContainText("Finish");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("scroll and resize preserve rendered diagrams in both themes", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(
    flowchart +
      "\n\n" +
      "A long paragraph for scroll testing.\n\n".repeat(200) +
      "\n# Final section",
  );
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
  await editor.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    page.getByRole("heading", { name: "Final section", exact: true }),
  ).toBeInViewport();
  await page.setViewportSize({ width: 768, height: 600 });
  await expect(
    page.getByRole("heading", { name: "Final section", exact: true }),
  ).toBeInViewport();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
  await expect(page.locator(".mermaid")).toContainText("Finish");
  await expect(
    page.getByRole("heading", { name: "Final section", exact: true }),
  ).toBeInViewport();
  const preview = page.locator(".forge-markdown").locator("..");
  await preview.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath("markdown-dark.png") });
});

test("untrusted Markdown and diagram labels cannot execute scripts", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(
    '<img src="data:image/png;base64,invalid" onerror="window.forgeInjected=true">\n\n```mermaid\nflowchart LR\n  A["&lt;script&gt;alert(1)&lt;/script&gt;"] --> B[Safe]\n```',
  );
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
  await expect(
    page.locator(".forge-markdown [onerror], .forge-markdown script"),
  ).toHaveCount(0);
  expect(await page.evaluate(() => "forgeInjected" in window)).toBe(false);
});
