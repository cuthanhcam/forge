import { expect, test } from "@playwright/test";

test("navigation category and desktop rail collapse survive an immediate refresh", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  const editors = page.getByRole("button", { name: "Editors", exact: true });
  await editors.click();
  await expect(editors).toHaveAttribute("aria-expanded", "false");
  if (!isMobile)
    await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await page.reload();
  if (isMobile) {
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  } else {
    await expect(
      page.getByRole("button", { name: "Expand sidebar", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  }
  await expect(editors).toHaveAttribute("aria-expanded", "false");
  await editors.click();
  await expect(editors).toHaveAttribute("aria-expanded", "true");
});

test("Markdown tab and Diff option preferences survive reload independently", async ({
  page,
}) => {
  await page.goto("/tools/markdown-preview");
  await page.getByRole("button", { name: "Collapse tabs", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Expand tabs", exact: true }),
  ).toBeVisible();
  await page.goto("/tools/diff-checker");
  await page.getByRole("button", { name: "Collapse diff options", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Expand diff options", exact: true }),
  ).toBeVisible();
});
