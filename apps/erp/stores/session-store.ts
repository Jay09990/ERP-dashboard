import { create } from "zustand";

export type SessionSnapshot = {
  user: { id: string; name: string; email?: string; phone?: string };
  permissions: string[];
  /** True when the logged-in user is the company super-admin (roleId === 1).
   *  When set, all permission checks are bypassed. */
  isSuperAdmin?: boolean;
  company?: {
    id: string;
    name: string;
    gstNo?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
};

type SessionState = {
  session: SessionSnapshot | null;
  setSession: (session: SessionSnapshot | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
