import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": appRoot,
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "app/api/**/*.test.ts",
      "features/**/*.test.ts",
      "features/**/*.test.tsx",
    ],
  },
});
