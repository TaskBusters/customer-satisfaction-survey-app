import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Here, manage auth state as needed. Example:
  const [user, setUser] = useState(null);

  // Simple helpers:
  const login = (userObj) => setUser(userObj);
  const logout = () => setUser(null);

  const isGuest = !user; // true if no logged in user

  return (
    <AuthContext.Provider value={{ user, isGuest, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
