import { expect, test } from "@playwright/test";

const entry = "**/src/app/main.tsx*";
const uuidModule = /\/src\/features\/uuid\/index\.ts(?:\?.*)?$/;

test("startup shows a themed visual loader before app code arrives", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("forge.theme", JSON.stringify("dark")),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(entry, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "commit" });
  const startup = page.getByRole("status", { name: "Loading Forge", exact: true });
  await expect(startup).toBeVisible();
  await expect(startup).toHaveAttribute("aria-busy", "true");
  await expect(startup).toHaveCSS("background-color", "rgb(13, 17, 23)");
  await expect(page.locator(".forge-boot-spinner")).toHaveCSS("animation-name", "none");
  await page.screenshot({ path: test.info().outputPath("startup-loader.png") });
  release();
  await expect(
    page.getByRole("heading", {
      name: "Where rough input becomes usable work.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(startup).toHaveCount(0);
});

test("a failed startup module has an independent recovery screen and reload works", async ({
  page,
}) => {
  await page.route(entry, (route) => route.abort("failed"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Forge could not start", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert", { name: "Unable to load Forge", exact: true }),
  ).toBeVisible();
  await page.unroute(entry);
  await page.getByRole("button", { name: "Reload page", exact: true }).click();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explore tools", exact: true }),
  ).toBeVisible();
});

test("lazy tools show skeletons that respect reduced motion and finish loading", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(uuidModule, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/tools/uuid", { waitUntil: "commit" });
  const skeleton = page.getByRole("status", { name: "Loading workspace", exact: true });
  await expect(skeleton).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-loading-skeleton]")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.screenshot({ path: test.info().outputPath("tool-skeleton.png") });
  release();
  await expect(
    page.getByRole("slider", { name: "UUID quantity", exact: true }),
  ).toBeVisible();
  await expect(skeleton).toHaveCount(0);
});

test("failed tool imports keep the shell usable and can recover after reload", async ({
  page,
  isMobile,
}) => {
  await page.route(uuidModule, (route) => route.abort("failed"));
  await page.goto("/tools/uuid");
  await expect(
    page.getByRole("heading", { name: "This page could not load", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Search tools/ })).toBeVisible();
  if (!isMobile)
    await expect(
      page.getByRole("link", { name: "JSON Formatter", exact: true }),
    ).toBeVisible();
  await expect(page.getByRole("contentinfo", { name: "Forge footer" })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath("tool-recovery.png") });
  await page.unroute(uuidModule);
  await page.getByRole("button", { name: "Reload page", exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "UUID quantity", exact: true }),
  ).toBeVisible();
});

test("going offline does not replace the loaded editor or lose its input", async ({
  page,
  context,
}) => {
  await page.goto("/tools/markdown-preview");
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill("# Local draft before disconnect");
  await context.setOffline(true);
  await expect(
    page.getByRole("status", { name: "Offline notice", exact: true }),
  ).toBeVisible();
  await expect(editor).toHaveValue("# Local draft before disconnect");
  await editor.fill("# Still editable while offline");
  await context.setOffline(false);
  await expect(
    page.getByRole("status", { name: "Offline notice", exact: true }),
  ).toHaveCount(0);
  await expect(editor).toHaveValue("# Still editable while offline");
});

test("custom 404s have useful actions and short-page footers sit at the viewport bottom", async ({
  page,
  isMobile,
}) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 1200 });
  for (const route of [
    "/missing-page",
    "/docs/not-a-document",
    "/support/not-a-mode",
    "/tools/not-a-tool",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Page not found", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to home", exact: true }),
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("link", { name: "Browse documentation", exact: true }),
    ).toHaveAttribute("href", "/docs");
    if (!isMobile) {
      const footerBottom = await page
        .getByRole("contentinfo", { name: "Forge footer" })
        .evaluate((node) => node.getBoundingClientRect().bottom);
      const expectedBottom = await page
        .getByRole("main")
        .evaluate(
          (node) =>
            node.getBoundingClientRect().bottom -
            parseFloat(getComputedStyle(node).paddingBottom),
        );
      expect(footerBottom).toBeCloseTo(expectedBottom, 0);
    }
  }
  await page.screenshot({ path: test.info().outputPath("custom-404.png") });
});

test("JavaScript-disabled browsers get a useful startup screen", async ({
  browser,
  isMobile,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    await expect(
      page.getByRole("heading", { name: "Forge needs JavaScript", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Loading Forge", exact: true }),
    ).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("an application render failure has standalone recovery without exposing exception details", async ({
  page,
}) => {
  await page.route(/\/src\/app\/providers\.tsx(?:\?.*)?$/, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "export function AppProviders() { throw new Error('synthetic-private-marker'); }",
    }),
  );
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "This page could not load", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("synthetic-private-marker")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Reload page", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo", { name: "Forge footer" })).toBeAttached();
});
