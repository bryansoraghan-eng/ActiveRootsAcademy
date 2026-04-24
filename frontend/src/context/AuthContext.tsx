import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { resolvePermissions, DEFAULT_PERMISSIONS } from '../lib/permissions';
import type { Permissions } from '../lib/permissions';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  school?: { id: string; name: string } | null;
  permissions?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userType: 'admin' | 'teacher' | null;
  permissions: Permissions;
  viewingAs: string | null;
  setViewingAs: (role: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildPermissions(user: User | null, viewingAs: string | null): Permissions {
  if (!user) return DEFAULT_PERMISSIONS['teacher'];
  const effectiveRole = viewingAs ?? user.role;
  return resolvePermissions(effectiveRole, user.permissions ?? {});
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'admin' | 'teacher' | null>(null);
  const [viewingAs, setViewingAsState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ara_token');
    const savedUser = localStorage.getItem('ara_user');
    const savedType = localStorage.getItem('ara_userType') as 'admin' | 'teacher' | null;
    const savedViewAs = localStorage.getItem('ara_viewingAs');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setUserType(savedType);
      if (savedViewAs) setViewingAsState(savedViewAs);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    setUserType(data.userType);
    setViewingAsState(null);
    localStorage.setItem('ara_token', data.token);
    localStorage.setItem('ara_user', JSON.stringify(data.user));
    localStorage.setItem('ara_userType', data.userType);
    localStorage.removeItem('ara_viewingAs');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserType(null);
    setViewingAsState(null);
    localStorage.removeItem('ara_token');
    localStorage.removeItem('ara_user');
    localStorage.removeItem('ara_userType');
    localStorage.removeItem('ara_viewingAs');
  };

  const setViewingAs = (role: string | null) => {
    setViewingAsState(role);
    if (role) {
      localStorage.setItem('ara_viewingAs', role);
    } else {
      localStorage.removeItem('ara_viewingAs');
    }
  };

  const permissions = buildPermissions(user, viewingAs);

  return (
    <AuthContext.Provider value={{ user, token, userType, permissions, viewingAs, setViewingAs, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
