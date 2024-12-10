import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { refreshToken } from '../api/apiClient';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const success = await refreshToken();
      setIsLoggedIn(success);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
