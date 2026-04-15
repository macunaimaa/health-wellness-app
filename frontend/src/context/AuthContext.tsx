import { createContext, useCallback, useState, type ReactNode } from 'react';
import type { User } from '../types';

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

const demoUser: User = {
  id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  email: 'carlos@democorp.com',
  name: 'Carlos Silva',
  role: 'user',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(demoUser);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    setUser(demoUser);
  }, []);

  const register = useCallback(async (_name: string, _email: string, _password: string, _tenantId: string) => {
    setUser(demoUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: 'demo-token',
        isAuthenticated: true,
        isLoading: false,
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
