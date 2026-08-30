import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, setAuthToken, removeAuthToken } from '@/lib/queryClient';

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string | null;
  address?: string | null;
  role: 'super_admin' | 'admin' | 'user' | string;
  permissions?: string[] | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export class AuthApiError extends Error {
  notRegistered?: boolean;
  email?: string;
  constructor(message: string, notRegistered?: boolean, email?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.notRegistered = notRegistered;
    this.email = email;
  }
}

const useAuth = () => {

  // Get current authenticated user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers
      });
      
      if (res.status === 401) {
        return null; // Return null for unauthenticated instead of throwing
      }
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      return res.json();
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new AuthApiError(error.message || 'Login failed', error.notRegistered, error.email);
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Store JWT token
      if (data.token) {
        setAuthToken(data.token);
      }
      // Set the user data immediately
      queryClient.setQueryData(['/api/auth/me'], data.user);
      // Force immediate refetch to ensure auth state is synced
      await queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Store JWT token on registration
      if (data.token) {
        setAuthToken(data.token);
      }
      // Set the user data immediately
      if (data.user) {
        queryClient.setQueryData(['/api/auth/me'], data.user);
      }
      // Force immediate refetch to ensure auth state is synced
      await queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Remove JWT token
      removeAuthToken();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Calculate authentication state directly from user data
  const isAuthenticated = !!user && !error && !isLoading;
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const permissions: string[] = isSuperAdmin ? ['*'] : (user?.permissions || []);

  const hasPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (user.role !== 'admin') return false;

    const userPerms = user.permissions || [];
    if (userPerms.includes('*')) return true;
    if (userPerms.includes(permissionKey)) return true;

    // Check section wildcard
    const section = permissionKey.split('.')[0];
    if (userPerms.includes(`${section}.*`)) return true;

    return false;
  };

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user: user as User | undefined,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    permissions,
    hasPermission,
    isLoading,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isPendingLogin: loginMutation.isPending,
    isPendingRegister: registerMutation.isPending,
    isPendingLogout: logoutMutation.isPending
  };
};

export default useAuth;