import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeadWorkspace } from "./LeadWorkspace";

const { getMock, createLeadMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  createLeadMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock },
}));

vi.mock("@/features/crm/api", () => ({
  crmApi: {
    useLeads: () => ({ data: [], error: null }),
    useLeadSources: () => ({
      data: { LeadSources: [{ lead_source_id: 3, source_name: "Website" }] },
      error: null,
    }),
    useIndustries: () => ({
      data: { Industries: [{ industry_id: 7, industry_name: "Manufacturing" }] },
      error: null,
    }),
    useFollowUps: () => ({ data: [], error: null }),
    useActivities: () => ({ data: [], error: null }),
    useCreateLead: () => ({
      mutate: createLeadMock,
      error: null,
      isPending: false,
    }),
    useUpdateLead: () => ({ mutate: vi.fn(), error: null, isPending: false }),
    useDeleteLead: () => ({ mutate: vi.fn(), error: null }),
    useChangeLeadStatus: () => ({ mutate: vi.fn(), error: null }),
    useConvertLead: () => ({ mutate: vi.fn(), error: null }),
    useCreateActivity: () => ({
      mutate: vi.fn(),
      error: null,
      isPending: false,
    }),
    useCreateLeadSource: () => ({
      mutate: vi.fn(),
      error: null,
      isPending: false,
    }),
    useCreateIndustry: () => ({
      mutate: vi.fn(),
      error: null,
      isPending: false,
    }),
  },
}));

vi.mock("@/stores/session-store", () => ({
  useSessionStore: (selector: (state: { session: null }) => unknown) =>
    selector({ session: null }),
}));

vi.mock("@/lib/auth/permissions", () => ({
  sessionHasPermission: () => true,
}));

vi.mock("@altrex/ui", async () => {
  const React = await import("react");
  return {
    Button: ({
      children,
      variant: _variant,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      children?: ReactNode;
    }) => React.createElement("button", props, children),
  };
});

afterEach(() => {
  cleanup();
  getMock.mockReset();
  createLeadMock.mockReset();
});

function renderWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LeadWorkspace />
    </QueryClientProvider>,
  );
}

describe("lead form selections", () => {
  it("uses lookup options and submits selected reference IDs as numbers", async () => {
    getMock.mockImplementation(async (endpoint: string) => {
      if (endpoint === endpoints.auth.users) {
        return {
          Users: [{ user_id: 9, firstName: "Alex", lastName: "User" }],
        };
      }
      if (endpoint === endpoints.masters.city) {
        return { City: [{ city_id: 1, city_name: "Vadodara" }] };
      }
      if (endpoint === endpoints.masters.state) {
        return { State: [{ state_id: 2, state_name: "Gujarat" }] };
      }
      if (endpoint === endpoints.masters.country) {
        return { Country: [{ country_id: 4, country_name: "India" }] };
      }
      return [];
    });

    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Add lead" }));

    await screen.findByRole("option", { name: "Manufacturing" });
    await screen.findByRole("option", { name: "Alex User" });
    expect(screen.getByRole("option", { name: "Cold" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Company name/), {
      target: { value: "Acme Ltd" },
    });
    fireEvent.change(screen.getByLabelText(/Contact person/), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Industry"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("Lead source"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("State"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText("Assigned user"), {
      target: { value: "9" },
    });
    fireEvent.change(screen.getByLabelText("Lead rating"), {
      target: { value: "hot" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(createLeadMock).toHaveBeenCalledOnce());
    expect(createLeadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        company_name: "Acme Ltd",
        contact_name: "Ada",
        industry_id: 7,
        lead_source_id: 3,
        city_id: 1,
        state_id: 2,
        country_id: 4,
        assigned_to: 9,
        rating: "hot",
        status: "new",
      }),
      expect.any(Object),
    );
  });
});
