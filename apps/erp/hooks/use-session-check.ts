import { useEffect } from "react";

import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token";
import { useSessionStore } from "@/stores/session-store";

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

      // No backend profile/session endpoint exists for this app yet.
      // Preserve the token and keep the user signed in instead of forcing logout.
    };

    checkSession();
  }, [setSession]);
}
