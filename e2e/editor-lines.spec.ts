import { expect, test } from "@playwright/test";

const source = [
  "First line",
  "A long logical line that wraps to several visual rows. ".repeat(12),
  "",
  "\tTabbed line \t with spaces",
  "\u754c\u9762 ki\u1ec3m tra \u{1f44b} ".repeat(25),
  "x".repeat(250),
  ...Array.from({ length: 55 }, (_, index) => `Line ${index + 7}`),
  "",
].join("\n");

for (const tool of ["markdown", "html"] as const) {
  test(`${tool} line numbers align with native wrapping, scrolling and resize`, async ({
    page,
  }) => {
    await page.goto(`/tools/${tool}-preview`);
    const editor = page.getByRole("textbox", {
      name: tool === "markdown" ? "Markdown input" : "HTML input",
    });
    await editor.fill(source);
    const gutter = page.locator("[data-line-number-gutter]");
    await expect(gutter.locator("[data-line-number]")).toHaveCount(
      source.split("\n").length,
    );
    await expect(gutter.locator('[data-line-number="1"]')).toHaveText("1");

    // Compare gutter offsets with the native textarea's own wrapping engine,
    // not with the component's measuring mirror.
    const alignmentError = async (): Promise<number> =>
      editor.evaluate((input: HTMLTextAreaElement) => {
        const root = input.closest("[data-numbered-editor]");
        const track = root?.querySelector("[data-line-number-gutter]")?.firstElementChild;
        if (!track) throw new Error("Missing line-number track");
        const native = input.cloneNode(false) as HTMLTextAreaElement;
        native.removeAttribute("id");
        native.style.position = "absolute";
        native.style.width = `${input.getBoundingClientRect().width}px`;
        native.style.height = "0px";
        native.style.minHeight = "0px";
        native.style.flex = "none";
        native.style.visibility = "hidden";
        native.style.overflowY = "scroll";
        input.parentElement?.append(native);
        try {
          const computed = getComputedStyle(native);
          const lineHeight = parseFloat(computed.lineHeight);
          const padding =
            parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
          return Math.max(
            ...[1, 2, 3, 4, 5, 6, 60, 61].map((index) => {
              native.value = [...input.value.split("\n").slice(0, index), "X"].join("\n");
              const expected = native.scrollHeight - lineHeight - padding;
              const number = track.querySelector(`[data-line-number="${index + 1}"]`);
              if (!number) throw new Error("Missing logical line");
              const actual =
                number.getBoundingClientRect().top - track.getBoundingClientRect().top;
              return Math.abs(actual - expected);
            }),
          );
        } finally {
          native.remove();
        }
      });
    await expect.poll(alignmentError).toBeLessThan(2);
    await editor.evaluate((input) => {
      input.scrollTop = 0;
    });
    await expect(gutter.locator('[data-line-number="1"]')).toBeInViewport();
    await page.screenshot({ path: test.info().outputPath(`${tool}-line-numbers.png`) });
    await gutter.locator("..").hover();
    await page.mouse.wheel(0, 500);
    await expect
      .poll(() => editor.evaluate((input) => input.scrollTop))
      .toBeGreaterThan(100);
    await editor.evaluate((input: HTMLTextAreaElement) => {
      input.scrollTop = input.scrollHeight;
    });
    await expect
      .poll(() => gutter.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(100);
    await expect
      .poll(() =>
        editor.evaluate((input: HTMLTextAreaElement) => {
          const gutter = input
            .closest("[data-numbered-editor]")
            ?.querySelector("[data-line-number-gutter]");
          return Math.abs(input.scrollTop - (gutter?.scrollTop ?? -1000));
        }),
      )
      .toBeLessThan(2);
    await expect(
      gutter.locator(`[data-line-number="${source.split("\n").length}"]`),
    ).toBeInViewport();
    await page.setViewportSize({ width: 640, height: 700 });
    await expect.poll(alignmentError).toBeLessThan(2);
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await expect.poll(alignmentError).toBeLessThan(2);
    await editor.fill("one\n\nthree\n");
    await expect(gutter.locator("[data-line-number]")).toHaveCount(4);
    await editor.fill("");
    await expect(gutter.locator("[data-line-number]")).toHaveCount(1);
    await expect(editor).toHaveValue("");
  });
}

test("HTML line numbers stay fixed when line wrapping is disabled", async ({ page }) => {
  await page.goto("/tools/html-preview");
  const editor = page.getByRole("textbox", { name: "HTML input" });
  await editor.fill("<p>" + "long ".repeat(100) + "</p>\nsecond\nthird");
  await page.getByRole("button", { name: "Disable line wrap" }).click();
  const gutter = page.locator("[data-line-number-gutter]");
  await expect(gutter.locator("[data-line-number]")).toHaveCount(3);
  await expect
    .poll(() =>
      gutter
        .locator('[data-line-number="1"]')
        .evaluate((row) => row.getBoundingClientRect().height),
    )
    .toBe(24);
  await editor.evaluate((input: HTMLTextAreaElement) => {
    input.scrollLeft = input.scrollWidth;
  });
  await expect
    .poll(() => editor.evaluate((input) => input.scrollLeft))
    .toBeGreaterThan(100);
  await expect(gutter.locator('[data-line-number="1"]')).toBeInViewport();
  await expect(gutter).toHaveJSProperty("scrollLeft", 0);
});
