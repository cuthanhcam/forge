import { expect, test } from "@playwright/test";

test("appearance shares the header preference and remembers system mode", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Change theme", exact: true }).click();
  await expect(
    page.getByRole("menuitemradio", { name: "Dark", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page.getByRole("menuitemradio", { name: "Light", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Light", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "System", exact: true }).check();
  await page.reload();
  await expect(page.getByRole("radio", { name: "System", exact: true })).toBeChecked();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(
    page.getByRole("link", { name: "Report an issue", exact: true }),
  ).toHaveAttribute("href", "https://forge.cuthanhcam.workers.dev/support/issue");
});

test("support provides safe reporting paths without submitting a draft", async ({
  page,
  isMobile,
}) => {
  await page.goto("/support/issue");
  await expect(page.getByText(/Use synthetic examples and redact tokens/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open issue", exact: true }),
  ).toHaveAttribute("href", "https://github.com/cuthanhcam/forge/issues");
  if (!isMobile)
    await expect(
      page.getByRole("link", { name: "Open Forge on GitHub", exact: true }),
    ).toHaveAttribute("href", "https://github.com/cuthanhcam/forge");
  await page
    .getByRole("textbox", { name: "Subject", exact: true })
    .fill("Synthetic reproduction");
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("No real credentials included.");
  await expect(
    page.getByRole("link", { name: "Open email", exact: true }),
  ).toHaveAttribute(
    "href",
    /subject=Synthetic%20reproduction&body=No%20real%20credentials/,
  );
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toHaveValue(
    "",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
});

test("practical documentation is reachable on desktop and phone", async ({
  page,
  isMobile,
}) => {
  await page.goto("/docs");
  if (isMobile)
    await page
      .getByRole("combobox", { name: "Documentation page" })
      .selectOption("safety");
  else
    await page
      .getByRole("navigation", { name: "Documentation navigation" })
      .getByRole("link", { name: /Tokens and safety/ })
      .click();
  await expect(
    page.getByRole("heading", { name: "Decode is not validation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "JWT best current practices, RFC 8725" }),
  ).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc8725");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
});
