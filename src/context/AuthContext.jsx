
import React, { createContext, useState } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") === "true");

  const login = () => {
    localStorage.setItem("isAuth", "true");
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.setItem("isAuth", "false");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
