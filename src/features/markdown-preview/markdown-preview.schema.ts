import { z } from "zod";

export const MarkdownPreviewSchema = z.object({
  value: z.string(),
});

export type MarkdownPreviewForm = z.infer<typeof MarkdownPreviewSchema>;

export const MarkdownPreviewTabSchema = z.object({
  content: z.string(),
  id: z.string(),
  title: z.string(),
  updatedAt: z.number(),
});

export const MarkdownPreviewViewModeSchema = z.enum(["editor", "split", "preview"]);

export const MarkdownPreviewStateSchema = z.object({
  activeTabId: z.string(),
  previewVisible: z.boolean().optional(),
  syncScroll: z.boolean(),
  tabs: z.array(MarkdownPreviewTabSchema).min(1),
  tabsCollapsed: z.boolean().optional(),
  outlineOpen: z.boolean().optional(),
  viewMode: MarkdownPreviewViewModeSchema.optional(),
});

export type MarkdownPreviewTab = z.infer<typeof MarkdownPreviewTabSchema>;
export type MarkdownPreviewViewMode = z.infer<typeof MarkdownPreviewViewModeSchema>;
export type MarkdownPreviewState = Omit<
  z.infer<typeof MarkdownPreviewStateSchema>,
  "previewVisible" | "viewMode" | "outlineOpen"
> & {
  tabsCollapsed: boolean;
  outlineOpen: boolean;
  viewMode: MarkdownPreviewViewMode;
};
