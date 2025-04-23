import React, { createContext, useState, useEffect, ReactNode } from "react";

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

  // tarkistetaan sessio, kun komponentti latautuu
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/session`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.loggedIn) {
          setLoggedIn(true);
          setUser({
            id: data.userId,
            role: data.role,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
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

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
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
