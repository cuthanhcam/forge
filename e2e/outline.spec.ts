import { expect, test } from "@playwright/test";

const source =
  "# First section\n\n" +
  "A readable paragraph.\n\n".repeat(40) +
  "## Nested section\n\n" +
  "Another paragraph.\n\n".repeat(40) +
  "### Final section\n\nFinal content.\n\n```md\n# Not a heading\n```";

test("outline follows document headings, navigates only the preview and persists its state", async ({
  page,
}) => {
  await page.goto("/tools/markdown-preview");
  const editor = page.getByRole("textbox", { name: "Markdown input" });
  await editor.fill(source);
  await page.getByRole("button", { name: "Show outline", exact: true }).click();
  const outline = page.getByRole("navigation", { name: "Document outline" });
  await expect(outline.getByRole("button")).toHaveCount(3);
  await outline.getByRole("button", { name: "Final section", exact: true }).click();
  const preview = page.getByRole("document", { name: "Rendered Markdown" });
  await expect(
    preview.getByRole("heading", { name: "Final section", exact: true }),
  ).toBeInViewport();
  await expect(
    outline.getByRole("button", { name: "Final section", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await expect
    .poll(() =>
      page
        .locator("header")
        .first()
        .evaluate((node) => node.getBoundingClientRect().y),
    )
    .toBe(0);
  await expect(editor).toHaveValue(source);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Collapse outline", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(outline.getByRole("button")).toHaveCount(3);
  await page.getByRole("button", { name: "Collapse outline", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Expand outline", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Show outline", exact: true }).click();
  await page.getByRole("button", { name: "Select editor layout", exact: true }).click();
  await page.getByRole("menuitem", { name: "Editor", exact: true }).click();
  await outline.getByRole("button", { name: "Nested section", exact: true }).click();
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Nested section", exact: true }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "New tab", exact: true }).click();
  await expect(outline.getByRole("button")).toHaveCount(0);
  await expect(outline).toContainText("Add headings");
});

test("tab rail animates its width, respects reduced motion and outline can reopen a collapsed rail", async ({
  page,
  isMobile,
}) => {
  await page.goto("/tools/markdown-preview");
  const rail = page.getByRole("complementary", { name: "Markdown tabs" });
  const workbench = rail.locator("..");
  if (!isMobile) {
    await expect(workbench).toHaveCSS("transition-property", "grid-template-columns");
  }
  await page.getByRole("button", { name: "Collapse tabs", exact: true }).click();
  await page.getByRole("button", { name: "Show outline", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Collapse tabs", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Document outline" })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(workbench).toHaveCSS("transition-property", "none");
});
