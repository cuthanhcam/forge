import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "@/app/App";

describe("App", () => {
  it("renders the Forge app shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /Where rough input becomes usable work\./,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "JSON Formatter" }).length,
    ).toBeGreaterThan(0);
  });

  it("opens the command palette with the keyboard shortcut", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search tools" })).toHaveFocus();
    expect(screen.getByText("16 tools")).toBeInTheDocument();
    expect(screen.getByText("Tree view")).toBeInTheDocument();
  });

  it("opens the keyboard shortcuts dialog", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "View keyboard shortcuts" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Keyboard shortcuts" }),
    ).toBeInTheDocument();
  });

  it("closes the keyboard shortcuts dialog with escape", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "View keyboard shortcuts" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
