import { expect, test } from "@playwright/test";

test("home lists tools, filters by task and recovers from an empty search", async ({
  page,
}) => {
  await page.goto("/");
  const main = page.getByRole("main");
  const cards = main.locator('[aria-label="Tool directory"] a');
  await expect(cards).toHaveCount(16);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    "Where rough input becomes usable work.",
  );
  await expect(
    main.getByRole("heading", { name: "Tools for everyday development" }),
  ).toBeAttached();
  await main.getByRole("button", { name: "Explore tools" }).click();
  await expect(main.getByRole("searchbox", { name: "Filter tools" })).toBeFocused();
  const filter = main.getByRole("searchbox", { name: "Filter tools" });
  await filter.fill("mermaid");
  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveText(/Markdown Preview/);
  await filter.fill("no-such-tool-123");
  await expect(main.getByRole("heading", { name: "No matching tools" })).toBeVisible();
  await main.getByRole("button", { name: "Show all tools" }).click();
  await expect(cards).toHaveCount(16);
  await filter.fill("JSON Formatter");
  await filter.press("Tab");
  await expect(main.getByRole("button", { name: "Clear filter" })).toBeFocused();
  await filter.fill("");
  await main.getByRole("link", { name: "JSON Formatter", exact: true }).click();
  await expect(page).toHaveURL(/\/tools\/json-formatter$/);
});

test("UI font is self-hosted and home stays readable at narrow widths and large text", async ({
  page,
}) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => document.fonts.check('14px "Inter Variable"'))).toBe(
    true,
  );
  const main = page.getByRole("main");
  for (const element of [
    main.getByRole("heading", { level: 1 }),
    main.getByRole("searchbox"),
    main.getByRole("heading", { name: "Editors", exact: true }),
  ]) {
    await expect(element).toHaveCSS("font-family", /Inter Variable/);
  }
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(
    fontRequests.every((url) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true);
  const noOverflow = async (): Promise<boolean> =>
    main.evaluate((element) => element.scrollWidth <= element.clientWidth);
  await expect.poll(noOverflow).toBe(true);
  await page.screenshot({ path: test.info().outputPath("home-light.png") });
  await main.getByRole("button", { name: "Explore tools" }).click();
  await expect(main.getByRole("searchbox")).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath("home-directory.png") });
  await page.setViewportSize({ width: 320, height: 568 });
  await expect.poll(noOverflow).toBe(true);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
    document.documentElement.classList.add("dark");
  });
  await expect.poll(noOverflow).toBe(true);
  await main.getByRole("link", { name: "Terms", exact: true }).scrollIntoViewIfNeeded();
  await expect(main.getByRole("link", { name: "Terms", exact: true })).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath("home-dark-large-text.png") });
});

test("editor gutters use consistent code typography", async ({ page }) => {
  let gutterFont: string | undefined;
  for (const tool of ["markdown", "html"]) {
    await page.goto(`/tools/${tool}-preview`);
    const editor = page.getByRole("textbox", {
      name: tool === "markdown" ? "Markdown input" : "HTML input",
    });
    const font = await editor.evaluate((element) => getComputedStyle(element).fontFamily);
    const gutter = page.locator("[data-line-number-gutter]");
    const family = await gutter.evaluate(
      (element) => getComputedStyle(element).fontFamily,
    );
    expect(family).not.toContain("Inter Variable");
    await expect(gutter).toHaveCSS("font-size", "13px");
    if (gutterFont) expect(family).toBe(gutterFont);
    gutterFont = family;
    if (tool === "html") expect(font).not.toContain("Inter Variable");
    else await expect(page.locator(".forge-markdown")).toHaveCSS("font-family", font);
    expect(
      await page
        .locator("body")
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain("Inter Variable");
  }
});

test("Explore tools keeps the application header anchored", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  const header = page
    .locator("header")
    .filter({ has: page.getByRole("heading", { name: "Home", exact: true }) });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await main.evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
    await main.getByRole("button", { name: "Explore tools" }).click();
    await expect(main.getByRole("searchbox")).toBeInViewport();
    await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
    await main.evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).toBeInViewport({ ratio: 1 });
  }
});
