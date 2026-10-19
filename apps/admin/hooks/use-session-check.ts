import { useEffect } from "react";

import {
  clearToken,
  decodeTokenPayload,
  getToken,
  isTokenExpired,
} from "@/lib/auth/token";
import { type SessionSnapshot, useSessionStore } from "@/stores/session-store";

type AdminTokenClaims = {
  sub?: string | number;
  id?: string | number;
  userId?: string | number;
  user_id?: string | number;
  fullName?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  permissions?: SessionSnapshot["permissions"];
};

export function useSessionCheck() {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const restoreSession = () => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        clearToken();
        setSession(null);
        return;
      }

      // Admin API docs do not define /admin/me, so restore display details from
      // token claims and let protected API requests confirm authorization.
      const claims = decodeTokenPayload(token) as AdminTokenClaims | null;
      if (!claims) {
        clearToken();
        setSession(null);
        return;
      }

      setSession({
        user: {
          id: String(
            claims.userId ?? claims.user_id ?? claims.sub ?? claims.id ?? "",
          ),
          name:
            claims.fullName ??
            claims.full_name ??
            claims.name ??
            claims.email ??
            "",
          email: claims.email ?? "",
          phone: claims.phone ?? "",
        },
        permissions: claims.permissions ?? [],
      });
    };

    restoreSession();
  }, [setSession]);
}
