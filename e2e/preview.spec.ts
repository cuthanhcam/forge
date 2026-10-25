import { expect, test } from "@playwright/test";

test("HTML preview keeps editable source and a constrained iframe", async ({ page }) => {
  await page.goto("/tools/html-preview");
  const editor = page.getByRole("textbox", { name: "HTML input" });
  await editor.fill("<h1>Preview check</h1>");
  await expect(
    page
      .frameLocator('iframe[title="HTML preview output"]')
      .getByRole("heading", { name: "Preview check" }),
  ).toBeVisible();
  await expect(page.getByTitle("HTML preview output")).toHaveAttribute(
    "sandbox",
    "allow-scripts",
  );
  await expect(editor).toHaveValue("<h1>Preview check</h1>");
});
