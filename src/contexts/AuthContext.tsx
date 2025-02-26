import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const token = localStorage.getItem('access_token');
    const profile = localStorage.getItem('user_profile');
    
    if (token && profile) {
      try {
        setUserProfile(JSON.parse(profile));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_profile');
      }
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setIsAuthenticated(true);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('user_profile');
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