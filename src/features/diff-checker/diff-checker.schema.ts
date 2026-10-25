import { z } from "zod";

export const DiffCheckerSchema = z.object({
  value: z.string(),
});

export type DiffCheckerForm = z.infer<typeof DiffCheckerSchema>;

export const DiffCheckerLayoutSchema = z.enum(["split", "unified"]);

export const DiffCheckerStateSchema = z.object({
  hideUnchanged: z.boolean().optional(),
  hideWhitespace: z.boolean().optional(),
  inputVisible: z.boolean().optional(),
  ignoreBlankLines: z.boolean().optional(),
  layout: DiffCheckerLayoutSchema.optional(),
  optionsCollapsed: z.boolean().optional(),
  left: z.string(),
  lineWrap: z.boolean().optional(),
  right: z.string(),
  syncScroll: z.boolean().optional(),
  syntax: z.string().optional(),
});

export type DiffCheckerLayout = z.infer<typeof DiffCheckerLayoutSchema>;
export type DiffCheckerState = Omit<
  z.infer<typeof DiffCheckerStateSchema>,
  | "hideUnchanged"
  | "hideWhitespace"
  | "ignoreBlankLines"
  | "inputVisible"
  | "layout"
  | "lineWrap"
  | "syncScroll"
  | "syntax"
  | "optionsCollapsed"
> & {
  hideUnchanged: boolean;
  hideWhitespace: boolean;
  ignoreBlankLines: boolean;
  inputVisible: boolean;
  layout: DiffCheckerLayout;
  optionsCollapsed: boolean;
  lineWrap: boolean;
  syncScroll: boolean;
  syntax: string;
};
