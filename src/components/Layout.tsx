import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquareText, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Bot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

import { Modal } from './Modal';
import { useAuth } from '../auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemModalContent, setSystemModalContent] = useState({ title: '', message: '' });
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'customers', label: '客户管理', icon: Users },
    { id: 'ai-insights', label: 'AI 洞察与跟进', icon: Bot },
    { id: 'messages', label: '话术库', icon: MessageSquareText },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  const handleAction = (title: string, message: string) => {
    setSystemModalContent({ title, message });
    setIsSystemModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Bot className="w-6 h-6" />
            <span>超凡AI CRM</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 shrink-0">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border",
                  user?.permissionLevel === '主管理权限' 
                    ? "bg-indigo-600 text-white border-indigo-600" 
                    : "bg-indigo-50 text-indigo-600 border-indigo-200"
                )}>
                  {user?.permissionLevel === '主管理权限' ? '主' : '子'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(user?.positions || []).map((pos, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-white text-[8px] font-bold rounded shadow-sm">
                    {pos}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
              title="退出登录"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white" 
              onClick={e => e.stopPropagation()}
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                  <Bot className="w-6 h-6" />
                  <span>超凡AI CRM</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navItems.map((item) => (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索客户微信、名称..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('消息通知', '暂无新消息。')}
              className="relative p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* System Message Modal */}
      <Modal isOpen={isSystemModalOpen} onClose={() => setIsSystemModalOpen(false)} title={systemModalContent.title}>
        <div className="py-4">
          <p className="text-slate-700">{systemModalContent.message}</p>
        </div>
        <div className="flex justify-end pt-4">
          <button 
            onClick={() => setIsSystemModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            确定
          </button>
        </div>
      </Modal>
    </div>
  );
}
