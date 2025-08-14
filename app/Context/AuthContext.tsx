"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  adminToken: string | null;
  clientToken: string | null;
  isAdmin: boolean;
  isClient: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const checkAuth = () => {
    const adminTokenCookie = getCookie("AdminTokenAuth");
    const clientTokenCookie = getCookie("ClientTokenAuth");

    if (adminTokenCookie) {
      try {
        const decodedAdmin = jwtDecode(adminTokenCookie.toString());
        if (decodedAdmin) {
          setAdminToken(adminTokenCookie.toString());
          setIsAdmin(true);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }

    if (clientTokenCookie) {
      try {
        const decodedClient = jwtDecode(clientTokenCookie.toString());
        if (decodedClient) {
          setClientToken(clientTokenCookie.toString());
          setIsClient(true);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  };

  const logout = () => {
    deleteCookie("AdminTokenAuth");
    deleteCookie("ClientTokenAuth");
    setAdminToken(null);
    setClientToken(null);
    setIsAdmin(false);
    setIsClient(false);
    window.location.href = "/";
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        adminToken,
        clientToken,
        isAdmin,
        isClient,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
