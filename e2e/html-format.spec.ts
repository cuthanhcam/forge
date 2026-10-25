import { expect, test } from "@playwright/test";

const source = `<main   data-note="two  spaces > preserved" >
<span>Hello</span> <span>world</span>
<pre>  first
    second</pre>
<style>.label::after { content: "a  b;{}"; }</style>
<script>const text = "a  b"; const literal = \`first
    second; { ? : }\`;</script>
</main>`;

test("HTML transforms preserve raw content and expose recoverable parse errors", async ({
  page,
}) => {
  await page.goto("/tools/html-preview");
  const editor = page.getByRole("textbox", { name: "HTML input" });
  await page.getByRole("button", { name: "Auto", exact: true }).click();
  await editor.fill(source);
  await page.getByRole("button", { name: "Minify HTML", exact: true }).click();
  await expect(editor).toHaveValue(
    source.replace(
      '<main   data-note="two  spaces > preserved" >',
      '<main data-note="two  spaces > preserved">',
    ),
  );
  await page.getByRole("button", { name: "Beautify HTML", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Beautify HTML", exact: true }),
  ).toBeEnabled();
  const formatted = await editor.inputValue();
  for (const tag of ["script", "style", "pre"]) {
    const unchanged = await page.evaluate(
      ({ before, after, tag }) => {
        const parser = new DOMParser();
        return (
          parser.parseFromString(before, "text/html").querySelector(tag)?.textContent ===
          parser.parseFromString(after, "text/html").querySelector(tag)?.textContent
        );
      },
      { before: source, after: formatted, tag },
    );
    expect(unchanged).toBe(true);
  }
  await editor.fill('<div title="unfinished>');
  await page.getByRole("button", { name: "Beautify HTML", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("left unchanged");
  await expect(editor).toHaveValue('<div title="unfinished>');
  await editor.fill('<div   id="recovered" >OK</div>');
  await page.getByRole("button", { name: "Minify HTML", exact: true }).click();
  await expect(editor).toHaveValue('<div id="recovered">OK</div>');
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("typing while the formatter loads keeps the newer source", async ({ page }) => {
  let release: (() => void) | undefined;
  let requested: (() => void) | undefined;
  const ready = new Promise<void>((resolve) => {
    requested = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/html-format.service.ts*", async (route) => {
    requested?.();
    await gate;
    await route.continue();
  });
  await page.goto("/tools/html-preview");
  const editor = page.getByRole("textbox", { name: "HTML input" });
  await editor.fill('<main   id="old" >Old</main>');
  await page.getByRole("button", { name: "Beautify HTML", exact: true }).click();
  await ready;
  await editor.fill('<main id="new">Keep my new edit</main>');
  release?.();
  await expect(
    page.getByRole("button", { name: "Beautify HTML", exact: true }),
  ).toBeEnabled();
  // A second formatter action also waits for the first module load to complete.
  await page.getByRole("button", { name: "Minify HTML", exact: true }).click();
  await expect(editor).toHaveValue('<main id="new">Keep my new edit</main>');
  await expect(
    page.getByRole("button", { name: "Minify HTML", exact: true }),
  ).toBeEnabled();
});
