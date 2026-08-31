import { useEffect } from "react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useSessionStore } from "@/stores/session-store";

export function useSessionCheck() {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiClient.get<any>(endpoints.admin.me);
        if (response.data) {
          setSession({
            user: {
              id: response.data.userId?.toString() || "",
              name: response.data.fullName || response.data.email || "",
              email: response.data.email || "",
              phone: response.data.phone || "",
            },
            permissions: response.data.permissions || [],
            company: response.data.companyId
              ? {
                  id: response.data.companyId.toString(),
                  name: response.data.companyName || "",
                  gstNo: response.data.gstNo || "",
                  phone: response.data.companyPhone || "",
                  email: response.data.companyEmail || "",
                  address: response.data.address || "",
                }
              : undefined,
          });
        }
      } catch (error) {
        // Session not valid or expired
        setSession(null);
      }
    };

    checkSession();
  }, [setSession]);
}
