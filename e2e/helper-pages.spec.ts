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
  ).toHaveAttribute("href", "/support/issue");
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

test("help menu uses local routes while header shortcuts keep the dialog", async ({
  page,
  isMobile,
}) => {
  await page.goto("/settings");
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  else {
    await page
      .locator("#forge-sidebar")
      .getByRole("button", { name: "Collapse sidebar", exact: true })
      .click();
    await page.getByRole("link", { name: "Settings", exact: true }).hover();
    await expect(
      page.getByRole("tooltip", { name: "Settings", exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Help", exact: true }).click();
  const issue = page
    .getByRole("link", { name: "Report an issue", exact: true })
    .filter({ has: page.locator("span") });
  await expect(issue).toHaveAttribute("href", "/support/issue");
  await expect(issue).not.toHaveAttribute("target", "_blank");
  await expect(
    page.getByRole("link", { name: "Markdown Preview", exact: true }),
  ).toHaveCSS("height", "32px");
  await expect(
    page.getByRole("link", { name: "Markdown Preview", exact: true }),
  ).toHaveCSS("box-shadow", "none");
  await expect(page.getByRole("link", { name: "Settings", exact: true })).toHaveCSS(
    "height",
    "36px",
  );
  await issue.click();
  await expect(page).toHaveURL(/\/support\/issue$/);
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Help", exact: true }).click();
  await page.getByRole("link", { name: "Keyboard shortcuts", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/shortcuts$/);
  if (!isMobile) {
    const headerButton = page.getByRole("button", {
      name: "View keyboard shortcuts",
      exact: true,
    });
    await headerButton.hover();
    await expect(
      page.getByRole("tooltip", { name: "View keyboard shortcuts", exact: true }),
    ).toBeVisible();
    await headerButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(headerButton).toBeFocused();
  }
});

test("informational footers stay in their scroll owner and out of tool workspaces", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/settings",
    "/docs",
    "/support/ask",
    "/privacy",
    "/terms",
    "/missing-page",
  ]) {
    await page.goto(route);
    const footer = page.getByRole("contentinfo", { name: "Forge footer" });
    await expect(footer).toHaveCount(1);
    await footer.evaluate((node) => {
      let owner = node.parentElement;
      while (owner && !/auto|scroll/.test(getComputedStyle(owner).overflowY))
        owner = owner.parentElement;
      if (owner) owner.scrollTop = owner.scrollHeight;
    });
    await expect(footer).toBeInViewport();
    const contacts = footer.getByRole("navigation", { name: "Maintainer contacts" });
    await expect(contacts.getByRole("link")).toHaveCount(5);
    await expect(
      contacts.getByRole("link", { name: "GitHub profile", exact: true }),
    ).toHaveAttribute("href", "https://github.com/cuthanhcam");
    await expect(
      contacts.getByRole("link", { name: "LinkedIn", exact: true }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/cuthanhcam");
    await expect(
      contacts.getByRole("link", { name: "Email maintainer", exact: true }),
    ).toHaveAttribute("href", "mailto:cuthanhcam04@gmail.com");
    await expect(
      contacts.getByRole("link", { name: "Facebook", exact: true }),
    ).toHaveAttribute("href", "https://www.facebook.com/cuthanhcam");
    await expect(
      contacts.getByRole("link", { name: "Instagram", exact: true }),
    ).toHaveAttribute("href", "https://instagram.com/cuthanhcam");
    expect(
      await page
        .locator("header")
        .first()
        .evaluate((node) => node.getBoundingClientRect().top),
    ).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
  }
  for (const route of [
    "markdown-preview",
    "html-preview",
    "diff-checker",
    "jwt-decoder",
  ]) {
    await page.goto(`/tools/${route}`);
    await expect(page.getByRole("contentinfo", { name: "Forge footer" })).toHaveCount(0);
  }
});

test("policy pages explain actual data boundaries and docs selection stays inside its scroll area", async ({
  page,
  isMobile,
}) => {
  await page.goto("/privacy");
  const content = page.getByRole("article");
  await expect(
    content.getByRole("heading", { name: "Storage and retention", exact: true }),
  ).toBeVisible();
  await expect(
    content.getByText(/JWT tokens, verification secrets and generated passwords/),
  ).toBeAttached();
  await expect(
    content.getByRole("heading", {
      name: "Preview documents and network requests",
      exact: true,
    }),
  ).toBeAttached();
  await page.goto("/terms");
  await expect(
    content.getByRole("heading", {
      name: "Tokens and cryptographic checks",
      exact: true,
    }),
  ).toBeAttached();
  await expect(
    content.getByText(/JWT decoding does not authenticate a token/),
  ).toBeAttached();
  await expect(
    content.getByRole("link", { name: "MIT license", exact: true }),
  ).toHaveAttribute("href", "https://github.com/cuthanhcam/forge/blob/main/LICENSE");
  if (!isMobile) {
    await page.goto("/docs");
    const navigation = page.getByRole("navigation", { name: "Documentation navigation" });
    for (const name of [/Product docs/, /Guides/]) {
      const link = navigation.getByRole("link", { name });
      await link.click();
      await expect(link).toHaveAttribute("aria-current", "page");
      const linkBox = (await link.boundingBox())!;
      const navBox = (await navigation.boundingBox())!;
      expect(linkBox.x).toBeGreaterThan(navBox.x);
      expect(linkBox.x + linkBox.width).toBeLessThan(navBox.x + navBox.width);
    }
    await page.screenshot({ path: test.info().outputPath("docs-navigation.png") });
  }
});
