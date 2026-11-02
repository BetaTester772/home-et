"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { createContext, useContext, type ReactNode } from "react";

export interface AuthState {
  enabled: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  name: string | null;
  image: string | null;
  signIn: () => void;
  signOut: () => void;
}

const disabled: AuthState = {
  enabled: false,
  status: "unauthenticated",
  name: null,
  image: null,
  signIn: () => {},
  signOut: () => {},
};

const AuthContext = createContext<AuthState>(disabled);
export const useAuth = () => useContext(AuthContext);

function Bridge({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const value: AuthState = {
    enabled: true,
    status,
    name: data?.user?.name ?? null,
    image: data?.user?.image ?? null,
    signIn: () => void signIn("google"),
    signOut: () => void signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function Providers({ authEnabled, children }: { authEnabled: boolean; children: ReactNode }) {
  if (!authEnabled) return <AuthContext.Provider value={disabled}>{children}</AuthContext.Provider>;
  return (
    <SessionProvider>
      <Bridge>{children}</Bridge>
    </SessionProvider>
  );
}
