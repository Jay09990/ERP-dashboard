import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores(["**/.next/**", "**/node_modules/**", "**/next-env.d.ts"]),
]);

export default eslintConfig;
