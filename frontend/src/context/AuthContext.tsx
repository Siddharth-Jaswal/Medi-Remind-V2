"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  telegram_chat_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("mediremind_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (t: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Invalid token
        localStorage.removeItem("mediremind_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("mediremind_token", newToken);
    setToken(newToken);
    setUser(newUser);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("mediremind_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
