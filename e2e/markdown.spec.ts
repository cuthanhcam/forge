import { expect, test } from "@playwright/test";

const longDocument =
  Array.from(
    { length: 180 },
    (_, index) =>
      `## Section ${index}\n\n${"A paragraph with enough words to wrap in the editor and preview. ".repeat(5)}\n`,
  ).join("\n") + "\n# END OF DOCUMENT";

test.beforeEach(async ({ page }) => {
  await page.goto("/tools/markdown-preview");
  await expect(page.getByRole("textbox", { name: "Markdown input" })).toBeVisible();
});

test("pasting a document into Welcome never replaces it with the guide", async ({
  page,
}) => {
  const content =
    "# My notes\n\nForge Markdown Workspace\n\nhttps://markdownviewer.org\n\nKeep this text";
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(content);
  await expect(editor).toHaveValue(content);
  await expect(page.getByRole("status")).toHaveText("Draft saved in this browser");
  await page.reload();
  await expect(editor).toHaveValue(content);
});

test("long pasted content reaches the end of both panes without scroll feedback", async ({
  page,
}) => {
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(longDocument);
  await expect(editor).toHaveValue(longDocument);
  const preview = page.locator(".forge-markdown").locator("..");
  await expect(
    page.getByRole("heading", { name: "END OF DOCUMENT", exact: true }),
  ).toBeAttached();
  await editor.focus();
  await editor.press("Control+Home");
  await editor.press("Control+End");
  await expect
    .poll(() =>
      editor.evaluate(
        (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThan(8);
  await expect
    .poll(() =>
      preview.evaluate(
        (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThan(8);
  await editor.hover();
  await page.mouse.wheel(0, 100_000);
  await expect
    .poll(() =>
      editor.evaluate(
        (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThan(3);
  await expect(
    page.getByRole("heading", { name: "END OF DOCUMENT", exact: true }),
  ).toBeInViewport();
  await preview.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect
    .poll(() => editor.evaluate((element) => element.scrollTop))
    .toBeLessThan(3);
  await expect(editor).toHaveValue(longDocument);
  await expect(page.getByRole("status")).toHaveText("Draft saved in this browser");
  await page.reload();
  await expect(editor).toHaveValue(longDocument);
});

test("storage quota failure keeps pasted text editable and explains how to save it", async ({
  page,
}) => {
  await page.evaluate(() => {
    const original = localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem = function (key: string, value: string): void {
      if (key === "forge.tool.markdown-preview")
        throw new DOMException("Full", "QuotaExceededError");
      original(key, value);
    };
  });
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill("# Keep this draft even when storage fails");
  await expect(page.getByRole("alert")).toContainText("export Markdown before leaving");
  await expect(editor).toHaveValue("# Keep this draft even when storage fails");
  await editor.press("End");
  await editor.pressSequentially("!");
  await expect(editor).toHaveValue("# Keep this draft even when storage fails!");
});
