import process from "node:process";
import { toolRegistry } from "../src/core/registry/tool.registry";
import { toolCategories } from "../src/core/registry/tool.categories";
import { toolLoadingLayouts } from "../src/core/registry/tool.definition";

const errors: string[] = [];
const ids = new Set<string>();
const routes = new Set<string>();
for (const tool of toolRegistry) {
  if (!/^[a-z][a-z0-9-]*$/.test(tool.id) || ids.has(tool.id))
    errors.push(`Invalid or duplicate tool ID: ${tool.id}`);
  if (routes.has(tool.route) || tool.route !== `/tools/${tool.id}`)
    errors.push(`Invalid or duplicate route: ${tool.route}`);
  if (!tool.name.trim()) errors.push(`Missing name: ${tool.id}`);
  if (!toolCategories.includes(tool.category))
    errors.push(`Unknown category: ${tool.id}`);
  if (!toolLoadingLayouts.includes(tool.loadingLayout))
    errors.push(`Unknown loading layout: ${tool.id}`);
  ids.add(tool.id);
  routes.add(tool.route);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${toolRegistry.length} tools: IDs, routes, names, categories and loading layouts.`,
  );
