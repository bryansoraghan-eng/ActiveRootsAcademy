import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { resolvePermissions, DEFAULT_PERMISSIONS } from '../lib/permissions';
import type { Permissions } from '../lib/permissions';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  school?: { id: string; name: string } | null;
  permissions?: Record<string, Record<string, boolean>>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userType: 'admin' | 'teacher' | 'online_coach' | 'client' | null;
  permissions: Permissions;
  viewingAs: string | null;
  setViewingAs: (role: string | null) => void;
  impersonateName: string | null;
  startImpersonation: (name: string, role: string) => void;
  stopImpersonation: () => void;
  isPreviewMode: boolean;
  previewClientId: string | null;
  previewUserType: (type: 'online_coach' | 'client', clientId?: string) => void;
  exitPreview: () => void;
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

function loadFromStorage(): {
  token: string | null;
  user: User | null;
  userType: 'admin' | 'teacher' | 'online_coach' | 'client' | null;
  viewingAs: string | null;
  impersonateName: string | null;
  originalUserType: 'admin' | 'teacher' | 'online_coach' | 'client' | null;
  previewClientId: string | null;
} {
  const savedToken = localStorage.getItem('ara_token');
  const savedUser = localStorage.getItem('ara_user');
  if (savedToken && savedUser) {
    return {
      token: savedToken,
      user: JSON.parse(savedUser) as User,
      userType: localStorage.getItem('ara_userType') as 'admin' | 'teacher' | 'online_coach' | 'client' | null,
      viewingAs: localStorage.getItem('ara_viewingAs'),
      impersonateName: localStorage.getItem('ara_impersonateName'),
      originalUserType: localStorage.getItem('ara_originalUserType') as 'admin' | 'teacher' | 'online_coach' | 'client' | null,
      previewClientId: localStorage.getItem('ara_previewClientId'),
    };
  }
  return { token: null, user: null, userType: null, viewingAs: null, impersonateName: null, originalUserType: null, previewClientId: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [userType, setUserType] = useState<'admin' | 'teacher' | 'online_coach' | 'client' | null>(stored.userType);
  const [viewingAs, setViewingAsState] = useState<string | null>(stored.viewingAs);
  const [impersonateName, setImpersonateNameState] = useState<string | null>(stored.impersonateName);
  const [originalUserType, setOriginalUserType] = useState<'admin' | 'teacher' | 'online_coach' | 'client' | null>(stored.originalUserType);
  const [previewClientId, setPreviewClientId] = useState<string | null>(stored.previewClientId);
  const isLoading = false;

  const login = async (email: string, password: string) => {
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
    const res = await fetch(`${base}/auth/login`, {
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
    setImpersonateNameState(null);
    localStorage.removeItem('ara_token');
    localStorage.removeItem('ara_user');
    localStorage.removeItem('ara_userType');
    localStorage.removeItem('ara_viewingAs');
    localStorage.removeItem('ara_impersonateName');
  };

  const setViewingAs = (role: string | null) => {
    setViewingAsState(role);
    if (role) {
      localStorage.setItem('ara_viewingAs', role);
    } else {
      localStorage.removeItem('ara_viewingAs');
    }
  };

  const startImpersonation = (name: string, role: string) => {
    setImpersonateNameState(name);
    setViewingAsState(role);
    localStorage.setItem('ara_impersonateName', name);
    localStorage.setItem('ara_viewingAs', role);
  };

  const stopImpersonation = () => {
    setImpersonateNameState(null);
    setViewingAsState(null);
    localStorage.removeItem('ara_impersonateName');
    localStorage.removeItem('ara_viewingAs');
  };

  const previewUserType = (type: 'online_coach' | 'client', clientId?: string) => {
    setOriginalUserType(userType);
    localStorage.setItem('ara_originalUserType', userType ?? 'admin');
    setUserType(type);
    localStorage.setItem('ara_userType', type);
    if (clientId) {
      setPreviewClientId(clientId);
      localStorage.setItem('ara_previewClientId', clientId);
    }
  };

  const exitPreview = () => {
    const orig = originalUserType ?? 'admin';
    setOriginalUserType(null);
    setPreviewClientId(null);
    setUserType(orig as 'admin' | 'teacher' | 'online_coach' | 'client');
    localStorage.setItem('ara_userType', orig);
    localStorage.removeItem('ara_originalUserType');
    localStorage.removeItem('ara_previewClientId');
  };

  const isPreviewMode = originalUserType !== null;

  const permissions = buildPermissions(user, viewingAs);

  return (
    <AuthContext.Provider value={{ user, token, userType, permissions, viewingAs, setViewingAs, impersonateName, startImpersonation, stopImpersonation, isPreviewMode, previewClientId, previewUserType, exitPreview, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
