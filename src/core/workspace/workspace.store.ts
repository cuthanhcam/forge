import {
  persistedWorkspaceSchema,
  type PersistedWorkspace,
} from "@/core/storage/storage.schema";
import { storageKeys } from "@/core/storage/storage.keys";
import { readStorageValue, writeStorageValue } from "@/core/storage/storage.service";
import { create } from "zustand";
import type { WorkspaceActions, WorkspaceState } from "./workspace.types";

const maxRecentTools = 8;

function readPreferences(): PersistedWorkspace {
  try {
    const result = persistedWorkspaceSchema.safeParse(
      readStorageValue(storageKeys.workspace) ?? {},
    );
    if (result.success) return result.data;
  } catch {
    /* Blocked/corrupt storage falls back to usable in-memory preferences. */
  }
  return persistedWorkspaceSchema.parse({});
}

type WorkspaceStore = WorkspaceActions & WorkspaceState;

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeToolId: null,
  ...readPreferences(),
  addFavorite: (toolId) =>
    set((state) => ({
      favoriteToolIds: state.favoriteToolIds.includes(toolId)
        ? state.favoriteToolIds
        : [...state.favoriteToolIds, toolId],
    })),
  removeFavorite: (toolId) =>
    set((state) => ({
      favoriteToolIds: state.favoriteToolIds.filter((id) => id !== toolId),
    })),
  setActiveTool: (toolId) => set({ activeToolId: toolId }),
  toggleFavorite: (toolId) =>
    set((state) => ({
      favoriteToolIds: state.favoriteToolIds.includes(toolId)
        ? state.favoriteToolIds.filter((id) => id !== toolId)
        : [...state.favoriteToolIds, toolId],
    })),
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
  toggleCategory: (categoryId) =>
    set((state) => ({
      collapsedCategoryIds: state.collapsedCategoryIds.includes(categoryId)
        ? state.collapsedCategoryIds.filter((id) => id !== categoryId)
        : [...state.collapsedCategoryIds, categoryId],
    })),
  trackRecentTool: (toolId) =>
    set((state) => ({
      recentToolIds: [
        toolId,
        ...state.recentToolIds.filter((recentToolId) => recentToolId !== toolId),
      ].slice(0, maxRecentTools),
    })),
}));

// Save synchronously after preference changes so an immediate reload cannot race hydration.
// Active route and tool drafts are not part of this preference record.
useWorkspaceStore.subscribe((state, previous) => {
  if (
    state.sidebarCollapsed === previous.sidebarCollapsed &&
    state.collapsedCategoryIds === previous.collapsedCategoryIds &&
    state.favoriteToolIds === previous.favoriteToolIds &&
    state.recentToolIds === previous.recentToolIds
  )
    return;
  try {
    writeStorageValue(storageKeys.workspace, {
      sidebarCollapsed: state.sidebarCollapsed,
      collapsedCategoryIds: state.collapsedCategoryIds,
      favoriteToolIds: state.favoriteToolIds,
      recentToolIds: state.recentToolIds,
    });
  } catch {
    /* Keep the current session usable if storage is unavailable/full. */
  }
});
