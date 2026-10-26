import { beforeEach, describe, expect, it, vi } from "vitest";

describe("workspace preference persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });
  it("restores legacy preferences and synchronously saves collapse changes without route data", async () => {
    localStorage.setItem(
      "forge.workspace",
      JSON.stringify({ sidebarCollapsed: true, favoriteToolIds: ["json-formatter"] }),
    );
    const { useWorkspaceStore } = await import("./workspace.store");
    expect(useWorkspaceStore.getState().sidebarCollapsed).toBe(true);
    expect(useWorkspaceStore.getState().favoriteToolIds).toEqual(["json-formatter"]);
    useWorkspaceStore.getState().toggleSidebar();
    useWorkspaceStore.getState().toggleCategory("Editors");
    useWorkspaceStore.getState().setActiveTool("markdown-preview");
    const saved: unknown = JSON.parse(localStorage.getItem("forge.workspace")!);
    expect(saved).toMatchObject({
      sidebarCollapsed: false,
      collapsedCategoryIds: ["Editors"],
    });
    expect(saved).not.toHaveProperty("activeToolId");
    vi.resetModules();
    const restored = await import("./workspace.store");
    expect(restored.useWorkspaceStore.getState().collapsedCategoryIds).toEqual([
      "Editors",
    ]);
  });
  it("keeps toggles usable with corrupt storage or rejected writes", async () => {
    localStorage.setItem("forge.workspace", "broken json");
    const { useWorkspaceStore } = await import("./workspace.store");
    expect(useWorkspaceStore.getState().sidebarCollapsed).toBe(false);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => useWorkspaceStore.getState().toggleSidebar()).not.toThrow();
    expect(useWorkspaceStore.getState().sidebarCollapsed).toBe(true);
  });
});
