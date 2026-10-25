import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersistedToolState } from "./use-persisted-tool-state";

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("persistent tool drafts", () => {
  it("falls back to an editable initial state when stored JSON is corrupt", () => {
    localStorage.setItem("forge.tool.test", "not json");
    const { result } = renderHook(() => usePersistedToolState("test", "initial"));
    expect(result.current[0]).toBe("initial");
    act(() => result.current[1]("edited"));
    expect(result.current[0]).toBe("edited");
  });

  it("retains edits and exposes storage failure when quota is exceeded", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    const { result } = renderHook(() => usePersistedToolState("test", "initial"));
    act(() => result.current[1]("keep my draft"));
    expect(result.current[0]).toBe("keep my draft");
    expect(result.current[2]).toBe("unavailable");
  });

  it("debounces writes and flushes the latest draft on navigation", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      usePersistedToolState("test", "initial", { debounceMs: 250 }),
    );
    act(() => result.current[1]("first edit"));
    act(() => result.current[1]((previous) => previous + " and latest"));
    expect(localStorage.getItem("forge.tool.test")).toBeNull();
    act(() => vi.advanceTimersByTime(250));
    expect(result.current[2]).toBe("saved");
    act(() => result.current[1]("last edit before navigation"));
    unmount();
    expect(JSON.parse(localStorage.getItem("forge.tool.test") ?? "null")).toBe(
      "last edit before navigation",
    );
  });

  it("flushes pending edits when the page is hidden", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      usePersistedToolState("test", "initial", { debounceMs: 250 }),
    );
    act(() => result.current[1]("pending edit"));
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(JSON.parse(localStorage.getItem("forge.tool.test") ?? "null")).toBe(
      "pending edit",
    );
  });
});
