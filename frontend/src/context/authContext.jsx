import React, { createContext, useState, useContext } from "react";

// Create the AuthContext
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the AuthProvider to wrap around the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user details (or null if not logged in)

  const login = (userData) => {
    setUser(userData); // Set user data when logged in
    localStorage.setItem("user", JSON.stringify(userData)); // Optionally store in localStorage
  };

  const logout = () => {
    setUser(null); // Reset user data
    localStorage.removeItem("user"); // Remove from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
