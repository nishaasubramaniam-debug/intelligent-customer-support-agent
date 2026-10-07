"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";
const AuthContext = createContext(null);

const sanitizeUserData = (userData) => {
  if (!userData) return null;
  const cleanedName = userData.name
    ? userData.name.replace(/\bdemo\b/gi, "System").trim()
    : "System Admin";
  return {
    ...userData,
    name: cleanedName || "System Admin",
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("nexus_auth_token");
    const storedUser = localStorage.getItem("nexus_auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        const sanitized = sanitizeUserData(parsed);
        setUser(sanitized);
        localStorage.setItem("nexus_auth_user", JSON.stringify(sanitized));

        // Verify with backend
        verifyToken(storedToken);
      } catch (err) {
        console.error("Error parsing stored user:", err);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const sanitized = sanitizeUserData(response.data);
      setUser(sanitized);
      localStorage.setItem("nexus_auth_user", JSON.stringify(sanitized));
    } catch (err) {
      console.warn("Token verification failed, logging out:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    const { access_token, user: userData } = response.data;
    const sanitized = sanitizeUserData(userData);

    setToken(access_token);
    setUser(sanitized);

    localStorage.setItem("nexus_auth_token", access_token);
    localStorage.setItem("nexus_auth_user", JSON.stringify(sanitized));

    return sanitized;
  };

  const register = async (name, email, password, role = "user") => {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name,
      email,
      password,
      role,
    });

    const { access_token, user: userData } = response.data;
    const sanitized = sanitizeUserData(userData);

    setToken(access_token);
    setUser(sanitized);

    localStorage.setItem("nexus_auth_token", access_token);
    localStorage.setItem("nexus_auth_user", JSON.stringify(sanitized));

    return sanitized;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("nexus_auth_token");
    localStorage.removeItem("nexus_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
