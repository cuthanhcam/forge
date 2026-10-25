import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { HtmlPreviewPage } from "./HtmlPreviewPage";

describe("HTML preview boundaries", () => {
  beforeEach(() => localStorage.clear());

  it("allows scripts without granting the document the host origin", () => {
    render(<HtmlPreviewPage />);
    const frame = screen.getByTitle("HTML preview output");
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame).toHaveAttribute(
      "srcdoc",
      expect.stringContaining("Forge HTML Preview"),
    );
  });

  it("holds edits until Run when Auto is disabled", async () => {
    const user = userEvent.setup();
    render(<HtmlPreviewPage />);
    const frame = screen.getByTitle("HTML preview output");
    const original = frame.getAttribute("srcdoc");
    const auto = screen.getByRole("button", { name: "Auto" });
    await user.click(auto);
    expect(auto).toHaveAttribute("aria-pressed", "false");
    const input = screen.getByRole("textbox", { name: "HTML input" });
    await user.clear(input);
    await user.type(input, "<h1>Manual document</h1>");
    expect(frame.getAttribute("srcdoc")).toBe(original);
    await user.click(screen.getByRole("button", { name: "Run preview" }));
    expect(frame).toHaveAttribute("srcdoc", expect.stringContaining("Manual document"));
  });
});
