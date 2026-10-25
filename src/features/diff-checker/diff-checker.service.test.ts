import { describe, expect, it } from "vitest";
import {
  hasDiffCheckerInput,
  normalizeDiffCheckerInput,
  normalizeDiffCheckerState,
} from "./diff-checker.service";

describe("diff-checker service", () => {
  it("normalizes user input", () => {
    expect(normalizeDiffCheckerInput("  value  ")).toBe("value");
  });

  it("opens options for older saved drafts without changing either source", () => {
    const state = normalizeDiffCheckerState({ left: "original\n", right: "changed\n" });
    expect(state.optionsCollapsed).toBe(false);
    expect(state.left).toBe("original\n");
    expect(state.right).toBe("changed\n");
  });

  it("detects empty input", () => {
    expect(hasDiffCheckerInput("   ")).toBe(false);
  });
});
