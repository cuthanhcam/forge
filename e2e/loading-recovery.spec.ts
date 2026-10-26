import { toolRegistry } from "../src/core/registry/tool.registry";
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
  const skeleton = page.getByRole("status", {
    name: "Loading UUID Generator",
    exact: true,
  });
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

test("every registered tool has an appropriate, responsive loading surface", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const screenshots = new Set<string>();
  const features = /\/src\/features\//;
  for (const tool of toolRegistry.filter((item) => item.status === "available")) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(features, async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.goto(tool.route, { waitUntil: "commit" });
      const skeleton = page.getByRole("status", {
        name: `Loading ${tool.name}`,
        exact: true,
      });
      await expect(skeleton).toBeVisible();
      await expect(skeleton).toHaveAttribute("data-loading-layout", tool.loadingLayout);
      expect(
        await page
          .getByRole("main")
          .evaluate((node) => node.scrollWidth <= node.clientWidth),
      ).toBe(true);
      if (!screenshots.has(tool.loadingLayout)) {
        await page.screenshot({
          path: test.info().outputPath(`skeleton-${tool.loadingLayout}.png`),
        });
        screenshots.add(tool.loadingLayout);
      }
      release();
      await expect(skeleton).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: "This page could not load", exact: true }),
      ).toHaveCount(0);
    } finally {
      release();
      await page.unroute(features);
    }
  }
});

test("startup handlers never reactivate against IDs inside preview content", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/tools/markdown-preview");
  await page
    .getByRole("textbox", { name: "Markdown input" })
    .fill(
      '<div id="root"><div id="forge-startup" class="forge-boot"><p id="forge-startup-slow" hidden>Hidden preview content</p><h2 id="forge-startup-error">Preview heading</h2></div></div>',
    );
  const preview = page.getByRole("document", { name: "Rendered Markdown" });
  const node = preview.locator("#forge-startup");
  const hidden = node.locator("#forge-startup-slow");
  await expect(node).toBeAttached();
  await expect(hidden).toHaveAttribute("hidden", "");
  await page.evaluate(() =>
    window.dispatchEvent(
      new ErrorEvent("error", {
        error: new Error("synthetic startup-scope check"),
        cancelable: true,
      }),
    ),
  );
  await expect(node).not.toHaveAttribute("data-failed", "true");
  await page.clock.runFor(12_100);
  await expect(hidden).toHaveAttribute("hidden", "");
  await expect(
    preview.getByRole("heading", { name: "Preview heading", exact: true }),
  ).toBeAttached();
});
