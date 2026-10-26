import type { LucideIcon } from "lucide-react";
import type { ToolCategory } from "./tool.categories";

export type ToolStatus = "planned" | "available";

export const toolLoadingLayouts = [
  "markdown",
  "preview",
  "diff",
  "data",
  "jwt",
  "generator",
  "transform",
  "timestamp",
  "regex",
] as const;
export type ToolLoadingLayout = (typeof toolLoadingLayouts)[number];

export interface ToolDefinition {
  category: ToolCategory;
  description: string;
  features: string[];
  icon: LucideIcon;
  id: string;
  keywords: string[];
  name: string;
  persist: boolean;
  route: string;
  status: ToolStatus;
  loadingLayout: ToolLoadingLayout;
}
