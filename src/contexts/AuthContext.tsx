import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage.service';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = storageService.getAccessToken();
    const profile = storageService.getUserProfile();
    
    if (token && profile) {
      setUserProfile(profile);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setIsAuthenticated(true);
      storageService.setUserProfile(userProfile);
    } else {
      setIsAuthenticated(false);
    }
  }, [userProfile]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};