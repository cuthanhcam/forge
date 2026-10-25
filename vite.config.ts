import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  // These imports are intentionally lazy in product code. Prebundle their
  // dependencies up front so parallel dev/browser sessions keep stable URLs.
  optimizeDeps: {
    include: [
      "mermaid",
      "parse5",
      "prettier/standalone",
      "prettier/plugins/html",
      "@radix-ui/react-context-menu",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
