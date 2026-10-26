import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const diagramSource =
  "```mermaid\nflowchart LR\n" +
  Array.from(
    { length: 12 },
    (_, index) => `N${index}[Complex stage ${index}] --> N${index + 1}`,
  ).join("\n") +
  "\n```";

async function ready(page: Page): Promise<void> {
  await page.goto("/tools/markdown-preview");
  await page
    .getByRole("textbox", { name: "Markdown input" })
    .fill(diagramSource + "\n\n" + "A paragraph below the diagram.\n\n".repeat(80));
  await expect(page.locator(".mermaid [data-diagram-artwork] > svg")).toHaveCount(1);
}

const percent = (text: string | null): number => parseInt(text ?? "0");

test("diagram controls zoom/pan without trapping document wheel, then expand with isolated SVG IDs", async ({
  page,
  isMobile,
}) => {
  await ready(page);
  const diagram = page.locator(".mermaid");
  const canvas = diagram.getByRole("region", { name: "Interactive Mermaid diagram" });
  const preview = page.getByRole("document", { name: "Rendered Markdown" });
  await canvas.hover();
  await page.mouse.wheel(0, 250);
  await expect.poll(() => preview.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await preview.evaluate((node) => {
    node.scrollTop = 0;
  });
  const output = diagram.getByLabel("Diagram zoom");
  const initial = percent(await output.textContent());
  await diagram.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect
    .poll(async () => percent(await output.textContent()))
    .toBeGreaterThan(initial);
  await diagram.getByRole("button", { name: "Reset to 100%", exact: true }).click();
  await expect(output).toHaveText("100%");
  const art = diagram.locator("[data-diagram-artwork]");
  const before = await art.getAttribute("style");
  const box = (await canvas.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  if (isMobile) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + 40, y: y + 30 }],
    });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 40, y + 30, { steps: 5 });
    await page.mouse.up();
  }
  await expect.poll(() => art.getAttribute("style")).not.toBe(before);
  const expand = diagram.getByRole("button", { name: "Expand diagram", exact: true });
  await expand.click();
  const dialog = page.getByRole("dialog", { name: "Mermaid diagram 1", exact: true });
  await expect(dialog).toBeVisible();
  const ids = await page
    .locator("[data-diagram-artwork] [id]")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  await dialog.getByRole("button", { name: "Reset to 100%", exact: true }).click();
  const stage = dialog.getByRole("region", { name: "Interactive Mermaid diagram" });
  await stage.focus();
  await stage.press("+");
  await expect(dialog.getByLabel("Diagram zoom")).toHaveText("125%");
  const transformed = await dialog
    .locator("[data-diagram-artwork]")
    .getAttribute("style");
  await stage.press("ArrowRight");
  await expect(dialog.locator("[data-diagram-artwork]")).not.toHaveAttribute(
    "style",
    transformed!,
  );
  await page.setViewportSize({ width: 768, height: 600 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await expect(dialog.getByLabel("Diagram zoom")).toHaveText("125%");
  await stage.press("0");
  expect(percent(await dialog.getByLabel("Diagram zoom").textContent())).toBeLessThan(
    125,
  );
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download SVG", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("forge-diagram-1.svg");
  const file = await readFile(await download.path(), "utf8");
  expect(file).toContain("<svg");
  expect(
    await page.evaluate(
      (svg) =>
        new DOMParser().parseFromString(svg, "image/svg+xml").documentElement.textContent,
      file,
    ),
  ).toMatch(/Complex\s*stage/);
  expect(file).not.toMatch(/<script|onerror=/);
  await page.screenshot({ path: test.info().outputPath("mermaid-expanded.png") });
  await stage.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(expand).toBeFocused();
  await expect(output).toHaveText("100%");
  await page
    .getByRole("textbox", { name: "Markdown input" })
    .fill("```mermaid\ninvalid diagram\n```");
  await expect(page.getByRole("alert")).toContainText("Check the diagram syntax");
  await expect(page.locator(".mermaid [data-diagram-artwork]")).toHaveCount(0);
});

test("two-finger pinch zooms the expanded diagram on touch screens", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touch gesture");
  await ready(page);
  const inline = page
    .locator(".mermaid")
    .getByRole("region", { name: "Interactive Mermaid diagram" });
  const inlineBox = (await inline.boundingBox())!;
  const documentPreview = page.getByRole("document", { name: "Rendered Markdown" });
  const scrollSession = await page.context().newCDPSession(page);
  const touchX = inlineBox.x + inlineBox.width / 2;
  const touchY = inlineBox.y + inlineBox.height / 2;
  await scrollSession.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: touchX, y: touchY }],
  });
  for (let offset = 20; offset <= 100; offset += 20)
    await scrollSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: touchX, y: touchY - offset }],
    });
  await scrollSession.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await scrollSession.detach();
  await expect
    .poll(() => documentPreview.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);

  await page
    .locator(".mermaid")
    .getByRole("button", { name: "Expand diagram", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const canvas = dialog.getByRole("region", { name: "Interactive Mermaid diagram" });
  const box = (await canvas.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const before = percent(await dialog.getByLabel("Diagram zoom").textContent());
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 25, y },
      { x: x + 25, y },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 70, y },
      { x: x + 70, y },
    ],
  });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
  await expect
    .poll(async () => percent(await dialog.getByLabel("Diagram zoom").textContent()))
    .toBeGreaterThan(before);
  await dialog.getByRole("button", { name: "Collapse diagram", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});
