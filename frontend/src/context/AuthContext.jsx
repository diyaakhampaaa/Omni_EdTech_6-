import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On first load, if a token was saved from a previous session, validate it
  // against the backend and restore the logged-in user.
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .fetchMe()
      .then(setUser)
      .catch(() => api.setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (payload) => {
    setError(null);
    try {
      const { token, user: newUser } = await api.signup(payload);
      api.setToken(token);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to create account.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (payload) => {
    setError(null);
    try {
      const { token, user: loggedInUser } = await api.login(payload);
      api.setToken(token);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to log in.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}