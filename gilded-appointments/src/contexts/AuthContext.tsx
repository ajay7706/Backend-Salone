import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { request } from "@/lib/api";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (identifier: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// authentication details persisted in localStorage
// (token is stored separately) 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ emailORphone: identifier, password }),
    });
    // response expected { token, user }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const data = await request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const resetPassword = useCallback(async (identifier: string, newPassword: string) => {
    // endpoint not yet implemented on backend; stub for future
    await request("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ identifier, newPassword }),
      token: localStorage.getItem("token") || undefined,
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
      token: localStorage.getItem("token") || undefined,
    });
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await request("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      token: localStorage.getItem("token") || undefined,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    // if token exists but user state is empty, optionally validate or fetch user
    const token = localStorage.getItem("token");
    if (token && !user) {
      // we could decode JWT or call a validation endpoint here
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, resetPassword, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
