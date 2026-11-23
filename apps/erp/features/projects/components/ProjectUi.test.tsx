import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntityFormDialog } from "./ProjectUi";

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  variant?: string;
};

vi.mock("@altrex/ui", async () => {
  const React = await import("react");
  return {
    Button: ({
      children,
      variant: _variant,
      ...props
    }: MockButtonProps) => React.createElement("button", props, children),
  };
});

afterEach(cleanup);

function submitForm() {
  const form = screen.getByRole("button", { name: "Save" }).closest("form");
  if (!form) throw new Error("Project form was not rendered.");
  fireEvent.submit(form);
}

describe("project form validation", () => {
  it("does not submit when a required field is empty", () => {
    const onSubmit = vi.fn();
    render(
      <EntityFormDialog
        title="Create project"
        fields={[
          { name: "project_name", label: "Project name", required: true },
        ]}
        isPending={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    submitForm();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "Project name is required.",
    );
  });

  it("rejects numeric values below their configured minimum", () => {
    const onSubmit = vi.fn();
    render(
      <EntityFormDialog
        title="Add BOQ item"
        fields={[
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            min: 0.0001,
            required: true,
          },
        ]}
        isPending={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Quantity/), {
      target: { value: "0" },
    });
    submitForm();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain(
      "Quantity must be at least 0.0001.",
    );
  });

  it("renders lookup options and submits numeric select IDs", () => {
    const onSubmit = vi.fn();
    render(
      <EntityFormDialog
        title="Add Daily progress"
        fields={[
          {
            name: "site_id",
            label: "Project site",
            type: "select",
            valueType: "number",
            placeholder: "Select project site",
          },
        ]}
        fieldOptions={{
          site_id: [{ value: "12", label: "Factory site (#12)" }],
        }}
        isPending={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    const siteSelect = screen.getByLabelText("Project site");
    expect(siteSelect.querySelector('option[value="12"]')?.textContent).toBe(
      "Factory site (#12)",
    );
    fireEvent.change(siteSelect, { target: { value: "12" } });
    submitForm();

    expect(onSubmit).toHaveBeenCalledWith({ site_id: 12 });
  });
});
