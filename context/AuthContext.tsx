import React, { createContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  loggedIn: boolean;
  user: {
    id: number;
    role: string;
    email: string;
    firstname: string;
    lastname: string;
  } | null;
  login: (user: {
    id: number;
    role: string;
    email: string;
    firstname: string;
    lastname: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: number;
    role: string;
    email: string;
    firstname: string;
    lastname: string;
  } | null>(null);

  // 🔁 Check token on load
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setLoggedIn(true);
          setUser({
            id: data.userId,
            role: data.role,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem("token");
      }
    };

    checkToken();
  }, []);

  const login = (user: {
    id: number;
    role: string;
    email: string;
    firstname: string;
    lastname: string;
  }) => {
    setLoggedIn(true);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
