import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: [
      {
        find: "react/jsx-dev-runtime",
        replacement: fileURLToPath(
          new URL(
            "./apps/erp/node_modules/react/jsx-dev-runtime.js",
            import.meta.url,
          ),
        ),
      },
      {
        find: "react/jsx-runtime",
        replacement: fileURLToPath(
          new URL(
            "./apps/erp/node_modules/react/jsx-runtime.js",
            import.meta.url,
          ),
        ),
      },
      {
        find: "react-dom/server",
        replacement: fileURLToPath(
          new URL(
            "./apps/erp/node_modules/react-dom/server.js",
            import.meta.url,
          ),
        ),
      },
      {
        find: "react",
        replacement: fileURLToPath(
          new URL("./apps/erp/node_modules/react", import.meta.url),
        ),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
  },
});
