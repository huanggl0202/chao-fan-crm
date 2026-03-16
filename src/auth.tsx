import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'admin' | 'sales';
export type PermissionLevel = '主管理权限' | '子权限';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  permissionLevel: PermissionLevel;
  positions: string[]; // Multiple positions
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string) => boolean;
  logout: () => void;
  updateUser: (id: string, data: Partial<User>) => void;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: User[] = [
  { id: 'admin', username: 'admin', name: '黄耿伦', role: 'admin', permissionLevel: '主管理权限', positions: ['主管', '产品经理'] },
  { id: 'sales1', username: 'sales1', name: '销售一', role: 'sales', permissionLevel: '子权限', positions: ['软件顾问'] },
  { id: 'sales2', username: 'sales2', name: '销售二', role: 'sales', permissionLevel: '子权限', positions: ['售后专员'] },
  { id: 'sales3', username: 'sales3', name: '销售三', role: 'sales', permissionLevel: '子权限', positions: ['软件顾问'] },
  { id: 'sales4', username: 'sales4', name: '销售四', role: 'sales', permissionLevel: '子权限', positions: ['软件顾问'] },
  { id: 'sales5', username: 'sales5', name: '销售五', role: 'sales', permissionLevel: '子权限', positions: ['软件顾问'] },
  { id: 'sales6', username: 'sales6', name: '销售六', role: 'sales', permissionLevel: '子权限', positions: ['软件顾问'] },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    const storedUsers = localStorage.getItem('crm_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    const storedUser = localStorage.getItem('crm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('crm_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
    // If updating current user, update state too
    if (user?.id === id) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('crm_user', JSON.stringify(updatedUser));
    }
  };

  const addUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
  };

  const removeUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, updateUser, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
