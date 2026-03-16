import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BellOff,
  Check,
  Wrench,
  Pin,
  ChevronRight,
  HelpCircle,
  Bot
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { Modal } from './Modal';

export function Dashboard() {
  const { 
    customers, 
    dismissedReminders, 
    snoozedReminders, 
    pinnedReminders,
    customReminders,
    addCustomReminder,
    dismissReminder, 
    snoozeReminder,
    togglePinReminder
  } = useAppContext();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAllRemindersModalOpen, setIsAllRemindersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'followUp' | 'renewal' | 'tech'>('followUp');
  const [taskType, setTaskType] = useState<'followUp' | 'renewal' | 'tech'>('followUp');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemModalContent, setSystemModalContent] = useState({ title: '', message: '' });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const stats = [
    { 
      label: '总客户数', 
      value: customers.length.toString(), 
      change: '+12%', 
      trend: 'up', 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      label: '本月新增', 
      value: customers.filter(c => c.addDate.startsWith(new Date().toISOString().substring(0, 7))).length.toString(), 
      change: '+5.4%', 
      trend: 'up', 
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    { 
      label: '待跟进', 
      value: customers.filter(c => c.nextFollowUpDate).length.toString(), 
      change: '-2.1%', 
      trend: 'down', 
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100'
    },
    { 
      label: '即将到期', 
      value: customers.filter(c => c.renewalDate).length.toString(), 
      change: '+3', 
      trend: 'up', 
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-100'
    },
  ];

  const chartData = [
    { name: '1月', 新增: 120, 转化: 30 },
    { name: '2月', 新增: 180, 转化: 45 },
    { name: '3月', 新增: 248, 转化: 62 },
    { name: '4月', 新增: 0, 转化: 0 },
  ];

  const allReminders = useMemo(() => {
    const customerReminders = customers
      .filter(c => c.nextFollowUpDate || c.renewalDate)
      .map(c => {
        const isRenewal = !!c.renewalDate;
        return {
          id: `rem-cust-${c.id}`,
          type: isRenewal ? 'renewal' : 'followUp',
          title: c.name,
          description: isRenewal 
            ? `服务即将于 ${c.renewalDate} 到期，建议提前发送续费优惠方案。`
            : `计划于 ${c.nextFollowUpDate} 跟进。AI建议：${c.aiSuggestions?.substring(0, 30) || '无'}...`,
          fullDescription: isRenewal 
            ? `服务即将于 ${c.renewalDate} 到期，建议提前发送续费优惠方案。`
            : `计划于 ${c.nextFollowUpDate} 跟进。AI建议：${c.aiSuggestions || '无'}`,
          icon: isRenewal ? AlertCircle : Clock,
          color: isRenewal ? 'text-rose-500' : 'text-amber-500'
        };
      });

    const systemReminders = [
      {
        id: 'rem-sys-1',
        type: 'system',
        title: '系统分析报告已生成',
        description: '上周共流失 3 名客户，主要原因为"价格敏感"，建议推出轻量版套餐。',
        fullDescription: '上周共流失 3 名客户，主要原因为"价格敏感"，建议推出轻量版套餐。',
        icon: CheckCircle2,
        color: 'text-emerald-500'
      }
    ];

    const techReminders = [
      {
        id: 'rem-tech-1',
        type: 'tech',
        title: 'API 接口限流问题',
        description: '客户反馈在高峰期调用 API 出现 429 错误，技术团队已修复，需跟进客户确认。',
        fullDescription: '客户反馈在高峰期调用 API 出现 429 错误，技术团队已发布优化补丁，建议联系客户确认是否恢复正常。',
        icon: Wrench,
        color: 'text-blue-500'
      },
      {
        id: 'rem-tech-2',
        type: 'tech',
        title: '数据导出格式定制',
        description: '客户提出的自定义 Excel 导出格式需求已开发完成，待验收。',
        fullDescription: '客户提出的自定义 Excel 导出格式需求已开发完成并上线测试环境，请通知客户进行验收。',
        icon: Wrench,
        color: 'text-blue-500'
      }
    ];

    return [...customerReminders, ...systemReminders, ...techReminders, ...customReminders];
  }, [customers, customReminders]);

  const activeReminders = useMemo(() => {
    return allReminders.filter(r => {
      if (dismissedReminders.has(r.id)) return false;
      const snoozeTime = snoozedReminders[r.id];
      if (snoozeTime && Date.now() < snoozeTime) return false;
      return true;
    }).sort((a, b) => {
      const aPinned = pinnedReminders.has(a.id);
      const bPinned = pinnedReminders.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [allReminders, dismissedReminders, snoozedReminders, pinnedReminders]);

  const followUpReminders = activeReminders.filter(r => r.type === 'followUp');
  const renewalReminders = activeReminders.filter(r => r.type === 'renewal');
  const techRemindersList = activeReminders.filter(r => r.type === 'tech');

  const openRemindersModal = (tab: 'followUp' | 'renewal' | 'tech' = 'followUp') => {
    setActiveTab(tab);
    setIsAllRemindersModalOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newReminder = {
      id: `rem-custom-${Date.now()}`,
      type: taskType,
      title: customer.name,
      description: taskNote || `计划于 ${taskDate} 跟进。`,
      fullDescription: taskNote ? `计划于 ${taskDate} 跟进。备注：${taskNote}` : `计划于 ${taskDate} 跟进。`,
      icon: taskType === 'renewal' ? AlertCircle : (taskType === 'tech' ? Wrench : Clock),
      color: taskType === 'renewal' ? 'text-rose-500' : (taskType === 'tech' ? 'text-blue-500' : 'text-amber-500')
    };

    addCustomReminder(newReminder);

    setIsTaskModalOpen(false);
    setSelectedCustomerId('');
    setTaskDate('');
    setTaskNote('');
    setTaskType('followUp');
    setSystemModalContent({ title: '任务已创建', message: '跟进任务已成功创建，并已同步到 AI 智能提醒面板。' });
    setIsSystemModalOpen(true);
  };

  const handleAction = (title: string, message: string) => {
    setSystemModalContent({ title, message });
    setIsSystemModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工作台概览</h1>
          <p className="text-sm text-slate-500 mt-1">欢迎回来，今天有 15 个客户需要重点跟进。</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleAction('导出报表', '报表文件已开始下载，请稍后查看您的下载文件夹。')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            导出报表
          </button>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            新建跟进任务
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Reminders Panel (Full Width) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">AI 智能提醒面板</h3>
            {activeReminders.length > 0 && (
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                {activeReminders.length} 条待处理
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              title="功能用法"
            >
              <HelpCircle className="w-4 h-4" />
              功能用法
            </button>
            <button 
              onClick={() => openRemindersModal('followUp')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              查看全部提醒 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {activeReminders.slice(0, 4).map((reminder) => {
              const isPinned = pinnedReminders.has(reminder.id);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={reminder.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${isPinned ? 'bg-indigo-50/50 border-indigo-200' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => openRemindersModal(reminder.type as any)}
                  >
                    <div className={`p-3 rounded-full ${
                      reminder.type === 'renewal' ? 'bg-rose-100 text-rose-600' : 
                      reminder.type === 'tech' ? 'bg-blue-100 text-blue-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <reminder.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {reminder.title}
                        {isPinned && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-medium">已置顶</span>}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {reminder.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePinReminder(reminder.id); }}
                      className={`p-1.5 rounded-md transition-colors ${isPinned ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                      title={isPinned ? "取消置顶" : "置顶"}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); snoozeReminder(reminder.id); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                      title="24h不提醒"
                    >
                      <BellOff className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dismissReminder(reminder.id); }}
                      className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="已读不再提醒"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {activeReminders.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无待处理的智能提醒
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">客户增长与转化趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="新增" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="转化" fill="#34d399" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Pain Point Insights */}
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 relative z-10">
            <Bot className="w-5 h-5 text-indigo-400" />
            AI 痛点洞察看板
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">高频痛点排行</p>
              <div className="space-y-3">
                {[
                  { label: '出图速度/效率', count: 42, color: 'bg-indigo-500' },
                  { label: '设计人力成本', count: 35, color: 'bg-emerald-500' },
                  { label: '系统稳定性', count: 28, color: 'bg-amber-500' },
                  { label: '价格敏感', count: 15, color: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{item.label}</span>
                      <span className="text-slate-400">{item.count}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.count}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI 转化建议</p>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="text-xs text-indigo-300 leading-relaxed">
                  检测到 68% 的客户对“出图效率”有极高敏感度。建议本周针对该痛点群发“并发引擎升级”的对比视频，预计可提升 15% 的转化率。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="新建跟进任务">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">任务类型 *</label>
            <select 
              required
              value={taskType}
              onChange={e => setTaskType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="followUp">计划跟进</option>
              <option value="renewal">即将过期</option>
              <option value="tech">技术问题反馈</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关联客户 *</label>
            <select 
              required
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="" disabled>选择需要跟进的客户</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.wechatId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">计划跟进日期 *</label>
            <input 
              type="date" 
              required
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">跟进目的/备注</label>
            <textarea 
              rows={3}
              value={taskNote}
              onChange={e => setTaskNote(e.target.value)}
              placeholder="例如：询问试用情况，发送报价单..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              创建任务
            </button>
          </div>
        </form>
      </Modal>

      {/* All Reminders Modal */}
      <Modal isOpen={isAllRemindersModalOpen} onClose={() => setIsAllRemindersModalOpen(false)} title="全部 AI 智能提醒" size="3xl">
        <div className="flex flex-col h-[70vh]">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-4 shrink-0">
            <button
              onClick={() => setActiveTab('followUp')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'followUp' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              智能计划跟进 ({followUpReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('renewal')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'renewal' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              即将过期 ({renewalReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tech' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              技术反馈跟进 ({techRemindersList.length})
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {(() => {
                const currentList = activeTab === 'followUp' ? followUpReminders : 
                                    activeTab === 'renewal' ? renewalReminders : 
                                    techRemindersList;
                
                if (currentList.length === 0) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-slate-400 h-full"
                    >
                      <CheckCircle2 className="w-16 h-16 mb-4 text-slate-200" />
                      <p className="text-base font-medium text-slate-600">该分类下全部处理完毕</p>
                      <p className="text-sm mt-1">目前没有需要处理的提醒事项。</p>
                    </motion.div>
                  );
                }

                return currentList.map((reminder) => {
                  const isPinned = pinnedReminders.has(reminder.id);
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={reminder.id} 
                      className={`p-4 rounded-xl border transition-all flex gap-4 ${isPinned ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="mt-1">
                        <reminder.icon className={`w-6 h-6 ${reminder.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            {reminder.title}
                            {isPinned && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full font-medium">已置顶</span>}
                          </h4>
                          <button 
                            onClick={() => togglePinReminder(reminder.id)}
                            className={`p-1.5 rounded-md transition-colors ${isPinned ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                            title={isPinned ? "取消置顶" : "置顶"}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {reminder.fullDescription}
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <button 
                            onClick={() => dismissReminder(reminder.id)}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            已读不再提醒
                          </button>
                          <button 
                            onClick={() => snoozeReminder(reminder.id)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <BellOff className="w-4 h-4" />
                            24h不提醒
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </AnimatePresence>
          </div>
        </div>
      </Modal>

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

      {/* Help Modal */}
      <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="AI 智能提醒面板 - 功能用法" size="2xl">
        <div className="py-4 space-y-6 text-slate-700">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              智能计划跟进
            </h4>
            <p className="text-sm leading-relaxed">
              <strong>触发逻辑：</strong>系统会自动分析客户的沟通记录和跟进状态。当客户长时间未回复，或者到达预设的跟进节点时，AI 会自动生成跟进提醒。
            </p>
            <p className="text-sm leading-relaxed">
              <strong>智能建议：</strong>AI 会根据客户的历史互动情况，自动生成破冰话术或跟进建议，帮助销售快速切入话题，提高回复率。
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              即将过期提醒
            </h4>
            <p className="text-sm leading-relaxed">
              <strong>触发逻辑：</strong>系统会实时监控客户的套餐或服务到期时间。当距离到期时间不足 30 天时，会自动触发此提醒。
            </p>
            <p className="text-sm leading-relaxed">
              <strong>智能建议：</strong>AI 会结合客户的使用数据，生成续费建议和话术，例如推荐升级套餐或提供续费优惠，帮助销售提高续费率。
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              技术反馈跟进
            </h4>
            <p className="text-sm leading-relaxed">
              <strong>触发逻辑：</strong>当客户提交了技术工单或反馈了问题，且技术团队已解决或更新状态时，系统会自动同步并提醒销售。
            </p>
            <p className="text-sm leading-relaxed">
              <strong>智能建议：</strong>AI 会总结技术问题的解决情况，并生成安抚或回访话术，帮助销售维护客户关系，提升客户满意度。
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
            <h5 className="font-medium text-slate-900 mb-2">💡 实用技巧</h5>
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
              <li>点击 <strong>"已读不再提醒"</strong> 可以将当前提醒归档，不再显示。</li>
              <li>点击 <strong>"24h不提醒"</strong> 可以将提醒暂时隐藏，24小时后会再次出现。</li>
              <li>点击 <strong>"置顶"</strong> 图标可以将重要提醒固定在列表最上方。</li>
              <li>提醒由 AI 自动生成和同步，同时您也可以通过 <strong>"新建跟进任务"</strong> 手动添加提醒，它们都会统一展示在这里。</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
          <button 
            onClick={() => setIsHelpModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            我知道了
          </button>
        </div>
      </Modal>
    </div>
  );
}
