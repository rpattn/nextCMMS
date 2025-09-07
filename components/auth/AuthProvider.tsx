"use client";

import { createContext, PropsWithChildren, useContext } from 'react';

export type AuthUser = {
  id: number;
  email: string;
  name?: string;
  role?: { code?: string };
  // optional fields from backend for profile image & account switching
  avatar_url?: string;
  avatar?: string;
  profileImageUrl?: string;
  picture?: string;
  image?: { url?: string; path?: string; publicUrl?: string } | null;
  parentSuperAccount?: { superUserId: number } | null;
} | null;

const AuthContext = createContext<AuthUser>(null);

export function AuthProvider({ user, children }: PropsWithChildren<{ user: AuthUser }>) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
