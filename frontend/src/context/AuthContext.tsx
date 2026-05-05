import React, { createContext, useState, useEffect, ReactNode } from "react";
import { refreshToken } from "../api/apiClient";
import loadingGif from "../assets/loading.gif";
import { Box } from "@mui/material";
import api from "../api/apiClient";

interface UserInfo {
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userInfo: null,
  setUserInfo: () => {},
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/users/me');
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const success = await refreshToken();
      setIsLoggedIn(success);
      
      if (success) {
        await fetchUserInfo();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <img src={loadingGif} alt="loading" />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      userInfo, 
      setUserInfo, 
      isAdmin: userInfo?.role === 'Admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};