import { useState, useCallback } from "react";
import { useGetMe, setAuthTokenGetter, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export const TOKEN_KEY = "algorace_token";

setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

export function useAuth() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

  const { data: user, isLoading, error, refetch } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    refetch();
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setLocation("/login");
  }, [setLocation]);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };
}
