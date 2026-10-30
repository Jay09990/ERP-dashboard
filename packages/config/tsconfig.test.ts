import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

describe("shared TypeScript configuration", () => {
  it("keeps shared compiler checks strict and app configs extending the base", async () => {
    const baseConfig = await readJson(
      resolve(process.cwd(), "tsconfig.base.json"),
    );
    const compilerOptions = baseConfig.compilerOptions as Record<
      string,
      unknown
    >;
    expect(compilerOptions.strict).toBe(true);

    const erpConfig = await readJson(
      resolve(process.cwd(), "../../apps/erp/tsconfig.json"),
    );
    const adminConfig = await readJson(
      resolve(process.cwd(), "../../apps/admin/tsconfig.json"),
    );
    expect(erpConfig.extends).toBe("../../packages/config/tsconfig.base.json");
    expect(adminConfig.extends).toBe(
      "../../packages/config/tsconfig.base.json",
    );
  });
});
