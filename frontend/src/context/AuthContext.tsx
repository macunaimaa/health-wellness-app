import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import * as authApi from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // DEMO MODE: Usuário mockado para demonstração
  const demoUser: User = {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'carlos@democorp.com',
    name: 'Carlos Silva',
    role: 'user',
  };
  const [user, setUser] = useState<User | null>(demoUser);
  const [token, setToken] = useState<string | null>('demo-token');
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  useEffect(() => {
    if (token) {
      authApi
        .getMe()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('token', response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, tenantId: string) => {
      const response = await authApi.register({ name, email, password, tenantId });
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
