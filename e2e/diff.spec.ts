import { expect, test, type Page } from "@playwright/test";
import { contrast } from "./support/contrast";

const original =
  Array.from(
    { length: 90 },
    (_, index) =>
      `Line ${index + 1}: ${index === 30 ? "original ".repeat(45) : "unchanged content"}`,
  ).join("\n") + "\n";
const changed = original.replace("original ".repeat(45), "updated");

async function seed(page: Page, theme = "dark"): Promise<void> {
  await page.addInitScript(
    ({ left, right, theme }) => {
      if (!localStorage.getItem("forge.tool.diff-checker"))
        localStorage.setItem(
          "forge.tool.diff-checker",
          JSON.stringify({
            left,
            right,
            inputVisible: true,
            lineWrap: true,
            syntax: "Plain text",
          }),
        );
      localStorage.setItem("forge.theme", JSON.stringify(theme));
    },
    { left: original, right: changed, theme },
  );
  await page.goto("/tools/diff-checker");
}

test("numbered diff inputs retain content and scroll through wrap, options collapse and reload", async ({
  page,
}) => {
  await seed(page);
  const leftRegion = page.getByRole("region", {
    name: "Original text editor",
    exact: true,
  });
  const rightRegion = page.getByRole("region", {
    name: "Changed text editor",
    exact: true,
  });
  const left = page.getByRole("textbox", { name: "Original text", exact: true });
  const right = page.getByRole("textbox", { name: "Changed text", exact: true });
  await expect(left).toHaveValue(original);
  await expect(right).toHaveValue(changed);
  for (const region of [leftRegion, rightRegion])
    await expect(region.locator("[data-line-number]")).toHaveCount(91);
  await left.focus();
  await left.press("Control+End");
  await expect
    .poll(() => left.evaluate((node) => (node as HTMLTextAreaElement).selectionStart))
    .toBe(original.length);
  await left.hover();
  await page.mouse.wheel(0, 10000);
  await expect
    .poll(() =>
      left.evaluate((node) =>
        Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop),
      ),
    )
    .toBeLessThan(2);
  await expect
    .poll(() =>
      leftRegion.evaluate((region) => {
        const editor = region.querySelector("textarea")!;
        const gutter = region.querySelector("[data-line-number-gutter]")!;
        return Math.abs(editor.scrollTop - gutter.scrollTop);
      }),
    )
    .toBeLessThan(1);
  await page.getByRole("button", { name: "Collapse diff options", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Expand diff options", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(left).toHaveValue(original);
  await expect(right).toHaveValue(changed);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Expand diff options", exact: true }),
  ).toBeVisible();
  await expect(left).toHaveValue(original);
  await page.getByRole("button", { name: "Expand diff options", exact: true }).click();
  await page.getByRole("button", { name: "Disable line wrap", exact: true }).click();
  await expect(left).toHaveAttribute("wrap", "off");
  await left.focus();
  await left.press("Control+End");
  await expect(leftRegion.locator("[data-line-number]").last()).toHaveText("91");
  await left.hover();
  await page.mouse.wheel(0, 10000);
  await expect
    .poll(() =>
      left.evaluate((node) =>
        Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop),
      ),
    )
    .toBeLessThan(2);
});

for (const theme of ["light", "dark"]) {
  test(`${theme} comparison has quiet rows, aligned wrapping and stable synchronized scroll`, async ({
    page,
  }) => {
    await seed(page, theme);
    await page.getByRole("textbox", { name: "Original text", exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: test.info().outputPath(`diff-input-${theme}.png`) });
    await page.getByRole("button", { name: "View", exact: true }).click();
    const left = page.getByRole("region", { name: "Original comparison", exact: true });
    const right = page.getByRole("region", { name: "Changed comparison", exact: true });
    const firstRow = left.locator("[data-diff-row]").first();
    await expect(firstRow).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
    const sizes = async (): Promise<boolean> => {
      const first = await left
        .locator("[data-diff-row]")
        .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().height));
      const second = await right
        .locator("[data-diff-row]")
        .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().height));
      return (
        first.length > 0 &&
        first.length === second.length &&
        first.every((size, index) => Math.abs(size - second[index]) < 1)
      );
    };
    await expect.poll(sizes).toBe(true);
    await page
      .getByRole("button", { name: "Collapse diff options", exact: true })
      .click();
    await expect.poll(sizes).toBe(true);
    for (const size of [
      { width: 768, height: 600 },
      { width: 1280, height: 600 },
    ]) {
      await page.setViewportSize(size);
      await expect.poll(sizes).toBe(true);
    }
    await left.focus();
    await left.press("Control+End");
    await expect
      .poll(() =>
        right.evaluate((node) =>
          Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop),
        ),
      )
      .toBeLessThan(2);
    await page.getByRole("button", { name: "Expand diff options", exact: true }).click();
    await page.getByRole("button", { name: "Hide unchanged lines", exact: true }).click();
    await expect.poll(sizes).toBe(true);
    await expect(left.locator("[data-diff-row]")).toHaveCount(2);
    await page.getByRole("button", { name: "Unified", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Unified", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Unified diff", { exact: true })).toBeVisible();
    expect(
      await contrast(page.getByText("Unified diff", { exact: true })),
    ).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: test.info().outputPath(`diff-${theme}.png`) });
  });
}
