import { expect, test } from "@playwright/test";

for (const tool of ["markdown", "html"]) {
  test(`${tool} divider supports pointer, keyboard, reset and stacked layouts`, async ({
    page,
  }) => {
    await page.goto(`/tools/${tool}-preview`);
    const editor = page.getByRole("textbox", {
      name: tool === "markdown" ? "Markdown input" : "HTML input",
    });
    await editor.fill("A document that must survive pane resizing.\n".repeat(30));
    const before = await editor.inputValue();
    const divider = page.getByRole("separator", { name: "Resize editor and preview" });
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    const vertical = (await divider.getAttribute("aria-orientation")) === "vertical";
    const root = page.locator("[data-resizable-panes]");
    const area = await root.boundingBox();
    const handle = await divider.boundingBox();
    if (!area || !handle) throw new Error("Missing preview geometry");
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      vertical ? area.x + area.width * 0.3 : handle.x + handle.width / 2,
      vertical ? handle.y + handle.height / 2 : area.y + area.height * 0.3,
      { steps: 8 },
    );
    await page.mouse.up();
    await expect
      .poll(async () => Number(await divider.getAttribute("aria-valuenow")))
      .toBeLessThan(36);
    const first = await page
      .getByRole("region", { name: "Editor", exact: true })
      .boundingBox();
    const second = await page
      .getByRole("region", { name: "Preview", exact: true })
      .boundingBox();
    if (!first || !second) throw new Error("Missing pane geometry");
    expect(vertical ? second.width : second.height).toBeGreaterThan(
      vertical ? first.width : first.height,
    );
    await page.screenshot({ path: test.info().outputPath(`${tool}-resized.png`) });
    await divider.focus();
    await divider.press("Home");
    await expect(divider).toHaveAttribute("aria-valuenow", "20");
    await divider.press("End");
    await expect(divider).toHaveAttribute("aria-valuenow", "80");
    await divider.press("Enter");
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await page.setViewportSize({ width: 390, height: 700 });
    await expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    await divider.press("ArrowUp");
    await expect(divider).toHaveAttribute("aria-valuenow", "48");
    await expect(editor).toHaveValue(before);
    await expect
      .poll(() => root.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
    await expect(
      page.getByText("Draft saved in this browser", { exact: true }),
    ).toHaveCount(0);
    for (const [width, height] of [
      [320, 568],
      [768, 1024],
      [1024, 768],
      [1280, 600],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(() =>
          page
            .getByRole("main")
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
        )
        .toBe(true);
      await expect
        .poll(() =>
          root.evaluate(
            (element) =>
              element.scrollWidth <= element.clientWidth && element.clientHeight > 80,
          ),
        )
        .toBe(true);
      await expect(editor).toHaveValue(before);
    }
  });
}

test("collapsed Markdown tabs expose rename, duplicate and delete with mouse and keyboard", async ({
  page,
}) => {
  await page.goto("/tools/markdown-preview");
  await page.getByRole("button", { name: "New tab", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill("# Keep my notes");
  await page.getByRole("button", { name: "Collapse tabs", exact: true }).click();
  const tab = page.getByRole("button", { name: "Untitled 2", exact: true });
  await tab.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Rename", exact: true }).click();
  const name = page.getByRole("textbox", { name: "Tab name" });
  await expect(name).toBeFocused();
  await name.fill("My notes");
  await name.press("Enter");
  const renamed = page.getByRole("button", { name: "My notes", exact: true });
  await expect(renamed).toBeFocused();
  await renamed.press("Shift+F10");
  await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
  const copy = page.getByRole("button", { name: "My notes copy", exact: true });
  await expect(copy).toBeFocused();
  await expect(editor).toHaveValue("# Keep my notes");
  await copy.press("Shift+F10");
  await page.getByRole("menu").press("End");
  await expect(page.getByRole("menuitem", { name: "Delete", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(copy).toHaveCount(0);
  await expect(renamed).toBeFocused();
  await expect(editor).toHaveValue("# Keep my notes");
  const aside = page.getByRole("complementary", { name: "Markdown tabs" });
  const toggle = page.getByRole("button", { name: "Expand tabs", exact: true });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    const area = await aside.boundingBox();
    const button = await toggle.boundingBox();
    if (!area || !button) throw new Error("Missing tab footer");
    expect(area.y + area.height - button.y - button.height).toBeLessThan(16);
  }
  await page.screenshot({ path: test.info().outputPath("markdown-collapsed-tabs.png") });
  await toggle.click();
  await page.getByRole("button", { name: "My notes actions", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
});

test("sidebar collapse keeps links mounted, animates width and respects reduced motion", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "Desktop sidebar collapse");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Tool navigation" });
  const link = nav.getByRole("link", { name: "JSON Formatter", exact: true });
  await link.evaluate((element) => {
    element.setAttribute("data-motion-probe", "same-node");
  });
  const sidebar = page.locator("[data-sidebar]");
  const expanded = (await sidebar.boundingBox())?.width ?? 0;
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  const widths = await sidebar.evaluate(
    (element) =>
      new Promise<number[]>((resolve) => {
        const samples: number[] = [];
        const sample = (): void => {
          samples.push(element.getBoundingClientRect().width);
          if (samples.length < 8) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      }),
  );
  expect(widths.some((width) => width > 56 && width < expanded)).toBe(true);
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(56);
  await expect(link).toHaveAttribute("data-motion-probe", "same-node");
  await link.focus();
  await expect(link).toBeFocused();
  await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(expanded);
  await expect(link).toHaveAttribute("data-motion-probe", "same-node");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sidebar).toHaveCSS("transition-property", "none");
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(56);
});

test("mobile navigation contains focus and returns it when dismissed", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "Mobile navigation drawer");
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Open navigation", exact: true });
  await opener.click();
  await expect(opener).toHaveAttribute("aria-expanded", "true");
  const drawer = page.getByRole("dialog", { name: "Navigation", exact: true });
  const first = drawer.getByRole("link", { name: "Go to home", exact: true });
  await expect(first).toBeFocused();
  await first.press("Shift+Tab");
  expect(
    await drawer.evaluate((element) => element.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute("aria-expanded", "false");
});

test("touch hold exposes actions on a collapsed Markdown tab", async ({ page }) => {
  test.skip(!test.info().project.use.hasTouch, "Touch interaction");
  await page.goto("/tools/markdown-preview");
  await page.getByRole("button", { name: "Collapse tabs", exact: true }).click();
  const tab = page.getByRole("button", { name: "Welcome", exact: true });
  const box = await tab.boundingBox();
  if (!box) throw new Error("Missing tab");
  const touch = {
    pointerId: 42,
    pointerType: "touch",
    button: 0,
    isPrimary: true,
    clientX: box.x + 10,
    clientY: box.y + 10,
  };
  await tab.dispatchEvent("pointerdown", touch);
  await expect(
    page.getByRole("menuitem", { name: "Duplicate", exact: true }),
  ).toBeVisible();
  await page
    .locator('[data-markdown-document][aria-pressed="true"]')
    .dispatchEvent("pointerup", touch);
  await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Welcome copy", exact: true }),
  ).toBeVisible();
});
