import { createContext, useContext, useState, useCallback } from "react";
import {
  login as loginRequest,
  register as registerRequest,
  saveSession,
  getSession,
  logout as clearSession,
  isAuthenticated,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSession());
  const [authed, setAuthed] = useState(isAuthenticated());

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);
    saveSession(response);
    setUser(getSession());
    setAuthed(true);
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerRequest(payload);
    saveSession(response);
    setUser(getSession());
    setAuthed(true);
    return response;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authed, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
