import { z } from "zod";

export const persistedWorkspaceSchema = z.object({
  favoriteToolIds: z.array(z.string()).default([]),
  recentToolIds: z.array(z.string()).default([]),
  collapsedCategoryIds: z.array(z.string()).default([]),
  sidebarCollapsed: z.boolean().default(false),
});

export type PersistedWorkspace = z.infer<typeof persistedWorkspaceSchema>;
