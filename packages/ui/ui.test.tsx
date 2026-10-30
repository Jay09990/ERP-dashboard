import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, cn } from "./src";
import { blue, semanticColors } from "./tokens";

describe("shared UI package", () => {
  it("merges conflicting Tailwind utilities and preserves conditional classes", () => {
    expect(cn("p-2", "px-4", false && "hidden", "text-sm")).toBe(
      "p-2 px-4 text-sm",
    );
  });

  it("renders button variants and exports consistent semantic tokens", () => {
    const markup = renderToStaticMarkup(
      <Button type="button" variant="outline" size="sm">
        Edit
      </Button>,
    );
    expect(markup).toContain('type="button"');
    expect(markup).toContain("border");
    expect(markup).toContain("h-9");
    expect(semanticColors.actionPrimary).toBe(blue[600]);
  });
});
