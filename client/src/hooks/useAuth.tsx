import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ['/api/user/profile'],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
  
  useEffect(() => {
    setIsAuthenticated(!!user && !isError);
  }, [user, isError]);
  
  const logout = () => {
    setIsAuthenticated(false);
    queryClient.setQueryData(['/api/user/profile'], null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user: user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
