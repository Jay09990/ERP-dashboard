import type { Company } from "@/features/companies/types";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdministratorList } from "./AdministratorList";

const { useCompaniesMock } = vi.hoisted(() => ({
  useCompaniesMock: vi.fn(),
}));

vi.mock("@/features/companies/api", () => ({
  useCompanies: useCompaniesMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const companies: Company[] = [
  {
    company_id: 8,
    company_name: "Acme Group",
    company_code: "ACME",
    company_email: "office@acme.test",
    gst_no: "",
    phone: "9876543210",
    address: "",
    subscription_plan_id: 1,
    db_name: "acme_db",
    status: "active",
    superAdminFirstName: "Ada",
    superAdminLastName: "Lovelace",
    superAdminEmail: "ada@acme.test",
  },
  {
    company_id: 9,
    company_name: "No Admin Inc",
    company_code: "NOADMIN",
    company_email: "office@noadmin.test",
    gst_no: "",
    phone: "9876543211",
    address: "",
    subscription_plan_id: 1,
    db_name: "no_admin_db",
    status: "inactive",
  },
];

describe("administrator directory", () => {
  afterEach(() => {
    cleanup();
    useCompaniesMock.mockReset();
  });

  it("lists only tenant contacts with administrator details", () => {
    useCompaniesMock.mockReturnValue({ data: companies, isLoading: false });
    render(<AdministratorList />);

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("Acme Group")).toBeTruthy();
    expect(screen.queryByText("No Admin Inc")).toBeNull();
  });

  it("filters by company and shows empty search results", () => {
    useCompaniesMock.mockReturnValue({ data: companies, isLoading: false });
    render(<AdministratorList />);
    fireEvent.change(screen.getByLabelText("Search administrators"), {
      target: { value: "missing" },
    });

    expect(
      screen.getByText("No administrators match this search."),
    ).toBeTruthy();
  });
});
