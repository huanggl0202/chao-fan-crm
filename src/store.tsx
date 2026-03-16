import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
// 【改变1】不再引入假数据 initialCustomers，只保留 Customer 类型
import { Customer } from './data'; 
import { useAuth } from './auth';
// 【改变2】把我们刚才写好的用来连接 Supabase 的“工具”拿过来
import { supabase } from './lib/supabase'; 

interface AppContextType {
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  dismissedReminders: Set<string>;
  snoozedReminders: Record<string, number>;
  pinnedReminders: Set<string>;
  customReminders: any[];
  addCustomReminder: (reminder: any) => void;
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string) => void;
  togglePinReminder: (id: string) => void;
  aiPersonaPrompt: string;
  setAiPersonaPrompt: (prompt: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // 【改变3】一开始手里没数据，所以是一个空数组 []
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); 
  
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const [snoozedReminders, setSnoozedReminders] = useState<Record<string, number>>({});
  const [pinnedReminders, setPinnedReminders] = useState<Set<string>>(new Set());
  const [customReminders, setCustomReminders] = useState<any[]>([]);
  const [aiPersonaPrompt, setAiPersonaPrompt] = useState<string>(
    "你是一位拥有10年经验的资深B2B销售分析师。请根据提供的客户信息和聊天记录，深度分析客户的核心痛点、潜在需求，并给出推荐的转化策略、异议处理话术以及回复建议。请以专业的、结构化的方式输出，直接给出分析结果，不要有任何废话。"
  );

  // 【改变4】新增：网页刚打开时，自动去 Supabase 云端拉取客户数据
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // 拿着钥匙去查 customers 表里的所有数据
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      console.error('获取客户列表失败:', error);
    } else if (data) {
      setAllCustomers(data as Customer[]); // 把云端拿到的数据存进系统
    }
  };

  const customers = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return allCustomers;
    return allCustomers.filter(c => c.salesRep === user.username);
  }, [allCustomers, user]);

  // 【改变5】改造新增客户功能：先存云端，再更新本地
  const addCustomer = async (c: Customer) => {
    const { data, error } = await supabase.from('customers').insert([c]).select();
    if (error) {
      console.error('添加客户失败:', error);
      alert('添加失败，请检查数据库设置！');
    } else if (data) {
      // 云端保存成功后，把新客户加到页面的列表里
      setAllCustomers([data[0] as Customer, ...allCustomers]);
    }
  };

  // 【改变6】改造修改客户功能：先改云端，再改本地
  const updateCustomer = async (id: string, updateData: Partial<Customer>) => {
    const { error } = await supabase.from('customers').update(updateData).eq('id', id);
    if (error) {
      console.error('更新客户失败:', error);
    } else {
      // 云端修改成功后，更新页面的显示
      setAllCustomers(allCustomers.map(c => c.id === id ? { ...c, ...updateData } : c));
    }
  };

  // 下面这些备忘录的功能目前还是保存在本地，以后如果有需要也可以存进数据库
  const dismissReminder = (id: string) => {
    setDismissedReminders(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const snoozeReminder = (id: string) => {
    setSnoozedReminders(prev => ({
      ...prev,
      [id]: Date.now() + 24 * 60 * 60 * 1000 
    }));
  };

  const togglePinReminder = (id: string) => {
    setPinnedReminders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addCustomReminder = (reminder: any) => {
    setCustomReminders(prev => [reminder, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      customers, 
      addCustomer, 
      updateCustomer,
      dismissedReminders,
      snoozedReminders,
      pinnedReminders,
      customReminders,
      addCustomReminder,
      dismissReminder,
      snoozeReminder,
      togglePinReminder,
      aiPersonaPrompt,
      setAiPersonaPrompt
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}