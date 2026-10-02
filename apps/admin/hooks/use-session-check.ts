import { useEffect } from "react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token";
import { useSessionStore } from "@/stores/session-store";

type MeResponse = {
  userId?: number | string;
  fullName?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  permissions?: Array<{
    permission_name: string;
    module_name: string;
    is_allowed: boolean;
  }>;
  companyId?: number;
  companyName?: string;
  gstNo?: string;
  companyPhone?: string;
  companyEmail?: string;
  address?: string;
};

type SessionPermissions = Array<{
  permission_name: string;
  module_name: string;
  is_allowed: boolean;
}>;

export function useSessionCheck() {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const checkSession = async () => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        clearToken();
        setSession(null);
        return;
      }
      try {
        const response = await apiClient.get<MeResponse>(endpoints.admin.me);
        if (response) {
          setSession({
            user: {
              id: String(response.userId ?? ""),
              name:
                response.fullName || response.full_name || response.email || "",
              email: response.email || "",
              phone: response.phone || "",
            },
            permissions: (response.permissions || []) as SessionPermissions,
            company: response.companyId
              ? {
                  id: String(response.companyId),
                  name: response.companyName || "",
                  gstNo: response.gstNo || "",
                  phone: response.companyPhone || "",
                  email: response.companyEmail || "",
                  address: response.address || "",
                }
              : undefined,
          });
        }
      } catch {
        clearToken();
        setSession(null);
      }
    };

    checkSession();
  }, [setSession]);
}
