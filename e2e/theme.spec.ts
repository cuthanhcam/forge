import { expect, test } from "@playwright/test";

import { contrast } from "./support/contrast";

for (const theme of ["light", "dark"] as const) {
  test(`${theme} workbench keeps blue accents, readable text and coherent hover`, async ({
    page,
  }) => {
    await page.addInitScript((mode) => {
      if (!localStorage.getItem("forge.theme"))
        localStorage.setItem("forge.theme", JSON.stringify(mode));
    }, theme);
    await page.goto("/tools/markdown-preview");
    const editor = page.getByRole("textbox", { name: "Markdown input" });
    await expect(editor).toBeVisible();
    await expect(page.locator("html")).toHaveClass(
      theme === "dark" ? /dark/ : /^(?!.*dark)/,
    );
    const preview = page.getByRole("document", { name: "Rendered Markdown" });
    for (const element of [
      editor,
      preview.locator("h1").first(),
      page.getByRole("button", { name: "Welcome", exact: true }),
      page.locator("[data-line-number-gutter]"),
    ]) {
      expect(await contrast(element)).toBeGreaterThanOrEqual(4.5);
    }
    if (theme === "dark") {
      await expect(editor).toHaveCSS("color", "rgb(201, 209, 217)");
      await expect(preview).toHaveCSS("background-color", "rgb(13, 17, 23)");
      await expect(page.locator("body")).toHaveCSS("background-image", "none");
    }
    const add = page.getByRole("button", { name: "New tab", exact: true });
    const canHover = await page.evaluate(() => matchMedia("(hover: hover)").matches);
    const addBackground = await add.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    await add.hover();
    if (canHover)
      await expect
        .poll(() => add.evaluate((node) => getComputedStyle(node).backgroundColor))
        .not.toBe(addBackground);
    expect(await contrast(add)).toBeGreaterThanOrEqual(4.5);
    const sync = page.getByRole("button", { name: "Toggle sync", exact: true });
    await sync.hover();
    if (canHover) {
      await expect(sync).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(31, 44, 71)" : "rgb(219, 234, 254)",
      );
      await expect(sync).toHaveCSS(
        "color",
        theme === "dark" ? "rgb(134, 171, 249)" : "rgb(29, 78, 216)",
      );
    }
    expect(await contrast(sync)).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: test.info().outputPath(`markdown-${theme}.png`) });
    await page.getByRole("button", { name: "Change theme" }).click();
    const menu = page.getByRole("menu");
    const other = page.getByRole("menuitemradio", {
      name: theme === "dark" ? "Light" : "Dark",
      exact: true,
    });
    await other.hover();
    expect(await contrast(other)).toBeGreaterThanOrEqual(4.5);
    await expect(menu).toBeVisible();
    await other.click();
    await expect(page.locator("html")).toHaveClass(
      theme === "light" ? /dark/ : /^(?!.*dark)/,
    );

    await page.goto("/tools/base64");
    const copy = page.getByRole("button", { name: "Copy output", exact: true });
    await expect(copy).toBeVisible();
    await page.mouse.move(0, 0);
    const before = await copy.evaluate((node) => getComputedStyle(node).backgroundColor);
    await copy.hover();
    if (await page.evaluate(() => matchMedia("(hover: hover)").matches))
      await expect
        .poll(() => copy.evaluate((node) => getComputedStyle(node).backgroundColor))
        .not.toBe(before);
    expect(await contrast(copy)).toBeGreaterThanOrEqual(4.5);
    const input = page.getByRole("textbox", { name: "Base64 input", exact: true });
    await expect(input).toBeVisible();
    // A bordered field exercises the neutral-border bridge separately from textareas.
    await page.goto("/tools/timestamp");
    const field = page.getByRole("textbox", { name: "Timestamp or date", exact: true });
    await field.focus();
    await expect(field).toHaveCSS("border-color", "rgb(59, 118, 246)");
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent-600"),
    );
    expect(accent.trim()).toBe(theme === "light" ? "#6e9af7" : "#2563eb");
  });
}

test("system appearance updates neutral surfaces when the OS theme changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() =>
    localStorage.setItem("forge.theme", JSON.stringify("system")),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Change theme" }).click();
  await expect(
    page.getByRole("menuitemradio", { name: "System", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
});

test("dark Markdown syntax keeps readable colors without white glare", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("forge.theme", JSON.stringify("dark")),
  );
  await page.goto("/tools/markdown-preview");
  await page
    .getByRole("textbox", { name: "Markdown input" })
    .fill(
      '# Readable code\n\n[Documentation](https://example.com)\n\n```javascript\n// A quiet comment\nconst answer = { count: 42, title: "Forge" };\n```\n\n```json\n{"count":42}\n```',
    );
  const preview = page.getByRole("document", { name: "Rendered Markdown" });
  await expect(preview.locator("h1").first()).toHaveText("Readable code");
  await expect(preview.locator("pre code").first()).toContainText("A quiet comment");
  for (const token of [
    ".hljs-comment",
    ".hljs-keyword",
    ".hljs-number",
    ".hljs-string",
    ".hljs-punctuation",
    "a",
  ]) {
    const node = preview.locator(token).first();
    await expect(node).toBeAttached();
    expect(await contrast(node), token).toBeGreaterThanOrEqual(4.5);
  }
});
