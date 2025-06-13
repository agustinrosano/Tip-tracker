// src/Context/AuthProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { value } = await Preferences.get({ key: "user" });
      if (value) setUser(JSON.parse(value));
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await Preferences.set({ key: "user", value: JSON.stringify(userData) });
  };

  const logout = async () => {
    setUser(null);
    await Preferences.remove({ key: "user" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
