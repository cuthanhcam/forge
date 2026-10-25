import { expect, test } from "@playwright/test";
import { contrast } from "./support/contrast";

const ranges = [
  {
    tool: "jwt-secret",
    label: "Secret length in bits",
    min: 32,
    max: 512,
    step: 8,
    center: 256,
  },
  { tool: "uuid", label: "UUID quantity", min: 1, max: 100, step: 1, center: 51 },
  {
    tool: "slugify",
    label: "Slug maximum length",
    min: 16,
    max: 160,
    step: 1,
    center: 88,
  },
  { tool: "password-generator", label: "Length", min: 8, max: 128, step: 1, center: 68 },
  { tool: "password-generator", label: "Words", min: 3, max: 12, step: 1, center: 8 },
];

for (const range of ranges) {
  test(`${range.tool} ${range.label} has accurate pointer and keyboard values`, async ({
    page,
    isMobile,
  }) => {
    await page.goto(`/tools/${range.tool}`);
    if (range.label === "Words")
      await page.getByRole("button", { name: "Passphrase", exact: true }).click();
    const slider = page.getByRole("slider", { name: range.label, exact: true });
    await slider.scrollIntoViewIfNeeded();
    await slider.focus();
    await slider.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.min));
    await slider.press("PageUp");
    await expect(slider).toHaveAttribute(
      "aria-valuenow",
      String(Math.min(range.max, range.min + range.step * 10)),
    );
    await slider.press("Home");
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.min + range.step));
    await slider.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.max));
    await slider.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.max - range.step));
    let box = (await slider.boundingBox())!;
    const centerX = box.x + box.width / 2;
    let y = box.y + box.height / 2;
    if (isMobile) await page.touchscreen.tap(centerX, y);
    else await page.mouse.click(centerX, y);
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.center));
    // Drag the real native thumb; sampled values must never move backwards or exceed bounds.
    await slider.press("Home");
    box = (await slider.boundingBox())!;
    y = box.y + box.height / 2;
    const points: number[] = [];
    const session = isMobile ? await page.context().newCDPSession(page) : null;
    if (session)
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: box.x + 8, y }],
      });
    else {
      await page.mouse.move(box.x + 8, y);
      await page.mouse.down();
    }
    for (let index = 1; index <= 10; index++) {
      const x = box.x + 8 + ((box.width - 16) * index) / 10;
      if (session)
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y }],
        });
      else await page.mouse.move(x, y);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      points.push(Number(await slider.getAttribute("aria-valuenow")));
    }
    if (session) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await session.detach();
    } else await page.mouse.up();
    expect(
      points.every(
        (value, index) =>
          value >= range.min &&
          value <= range.max &&
          (index === 0 || value >= points[index - 1]),
      ),
    ).toBe(true);
    expect(new Set(points).size, JSON.stringify(points)).toBeGreaterThan(3);
    expect((await slider.boundingBox())!.y).toBeCloseTo(box.y, 0);
    await expect(slider).toHaveAttribute("aria-valuenow", String(range.max));
    await expect(slider).toHaveAttribute("aria-valuemin", String(range.min));
    await expect(slider).toHaveAttribute("aria-valuemax", String(range.max));
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme} JWT segment labels, previews and signature remain readable`, async ({
    page,
  }) => {
    await page.addInitScript(
      (mode) => localStorage.setItem("forge.theme", JSON.stringify(mode)),
      theme,
    );
    await page.goto("/tools/jwt-decoder");
    await expect(page.getByRole("textbox", { name: "JWT input" })).toBeVisible();
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-solid")
          .trim(),
      ),
    ).toBe("#2563eb");
    const segments = page.locator(".jwt-segment");
    await expect(segments).toHaveCount(3);
    for (const selector of [
      ".jwt-segment",
      ".jwt-segment-badge",
      ".jwt-signature-text",
      'pre[aria-hidden="true"] > span',
    ]) {
      const nodes = page.locator(selector);
      await expect(nodes).toHaveCount(
        selector === ".jwt-signature-text" ? 1 : selector.startsWith("pre") ? 5 : 3,
      );
      for (const node of await nodes.all())
        expect(await contrast(node), selector).toBeGreaterThanOrEqual(4.5);
    }
    await page.screenshot({ path: test.info().outputPath(`jwt-${theme}.png`) });
  });
}
