import { useEffect } from "react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useSessionStore } from "@/stores/session-store";

export function useSessionCheck() {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiClient.get(endpoints.admin.me);
        if (response.data) {
          setSession({
            user: {
              id: response.data.userId?.toString() || "",
              name: response.data.fullName || response.data.email || "",
            },
            permissions: response.data.permissions || [],
            company: response.data.companyId
              ? {
                  id: response.data.companyId.toString(),
                  name: response.data.companyName || "",
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
