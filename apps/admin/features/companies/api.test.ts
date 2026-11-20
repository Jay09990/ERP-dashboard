import { endpoints } from "@/lib/api/endpoints";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCompanies } from "./api";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock },
}));

describe("company API normalization", () => {
  afterEach(() => getMock.mockReset());

  it("normalizes nested company lists and strips database credentials", async () => {
    getMock.mockResolvedValue({
      data: {
        companies: [
          {
            company_id: 4,
            company_name: "Acme",
            db_username: "tenant-user",
            db_password: "tenant-secret",
          },
        ],
      },
    });

    const companies = await fetchCompanies({ status: "active" });

    expect(companies).toEqual([{ company_id: 4, company_name: "Acme" }]);
    expect(getMock).toHaveBeenCalledWith(endpoints.companies, {
      status: "active",
    });
    expect(companies[0]).not.toHaveProperty("db_password");
  });

  it("rejects malformed company list responses", async () => {
    getMock.mockResolvedValue({ message: "no list" });
    await expect(fetchCompanies()).rejects.toThrow(
      "The companies response did not contain a company list.",
    );
  });
});
