import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "customer_satisfaction_user";

export function AuthProvider({ children }) {
  // Load user from localStorage on mount
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Error loading user from localStorage:", err);
      return null;
    }
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (err) {
        console.error("Error saving user to localStorage:", err);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Simple helpers:
  const login = (userObj) => {
    setUser(userObj);
    // localStorage is updated via useEffect above
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

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
