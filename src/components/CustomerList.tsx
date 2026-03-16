import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MessageCircle,
  Calendar,
  AlertTriangle,
  XCircle,
  Bot,
  Tag,
  CheckSquare,
  History,
  Send,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Customer, FollowUpRecord } from '../data';
import { cn } from './Layout';
import { useAppContext } from '../store';
import { Modal } from './Modal';
import { useAuth } from '../auth';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCustomerWithAI } from '../lib/gemini';

export function CustomerList() {
  const { customers, addCustomer, updateCustomer, aiPersonaPrompt } = useAppContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemModalContent, setSystemModalContent] = useState({ title: '', message: '' });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Bulk Selection State
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());

  // Follow-up Record State
  const [newFollowUp, setNewFollowUp] = useState({
    content: '',
    nextDate: '',
    screenshot: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInsightGuidelinesOpen, setIsInsightGuidelinesOpen] = useState(false);
  const [insightScreenshot, setInsightScreenshot] = useState<string | null>(null);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFollowUp({ ...newFollowUp, screenshot: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeepInsight = async () => {
    if (!selectedCustomer) return;
    setIsAnalyzing(true);
    
    try {
      const deepAnalysis = await analyzeCustomerWithAI(
        aiPersonaPrompt,
        selectedCustomer,
        insightScreenshot || undefined
      );

      const updatedCustomer = {
        ...selectedCustomer,
        painPointAnalysis: deepAnalysis
      };

      updateCustomer(selectedCustomer.id, updatedCustomer);
      setSelectedCustomer(updatedCustomer);
      handleAction('深度洞察完成', 'AI 已完成对该客户的深度画像分析，并生成了针对性的转化策略与回复建议。');
    } catch (error) {
      console.error("AI Analysis failed:", error);
      handleAction('分析失败', 'AI 洞察过程中出现错误，请稍后重试或检查您的网络连接。');
    } finally {
      setIsAnalyzing(false);
      setInsightScreenshot(null); // Clear screenshot after analysis
    }
  };

  const handleInsightScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInsightScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    wechatId: '',
    wechatSource: '手动添加',
    platform: '',
    category: '',
    intentLevel: '中',
    conversionStatus: '未转化',
    followUpStatus: '新添加',
    painPoints: '',
  });

  const filteredCustomers = useMemo(() => {
    let result = customers;
    
    // Admin Sales Rep Filter
    if (user?.role === 'admin' && salesRepFilter !== 'all') {
      result = result.filter(c => c.salesRep === salesRepFilter);
    }

    return result.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.wechatId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm, salesRepFilter, user]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCustomerIds(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedCustomerIds(new Set());
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedCustomerIds);
    if (e.target.checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCustomerIds(newSelected);
  };

  const getIntentColor = (level: string) => {
    switch (level) {
      case '高': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '中': return 'text-amber-700 bg-amber-50 border-amber-200';
      case '低': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getIntentDotColor = (level: string) => {
    switch (level) {
      case '高': return 'bg-emerald-500';
      case '中': return 'bg-amber-500';
      case '低': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已成交': return 'text-emerald-600 bg-emerald-50';
      case '测试中': return 'text-blue-600 bg-blue-50';
      case '未转化': return 'text-slate-600 bg-slate-50';
      case '已流失': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getWechatStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'offline': return 'bg-slate-300';
      case 'unbound': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  const getWechatStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'unbound': return '未绑定';
      default: return '未知';
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.wechatId) return;

    if (isEditingCustomer && selectedCustomer) {
      // Update existing customer
      const updatedCustomer = {
        ...selectedCustomer,
        ...newCustomer
      } as Customer;
      
      // Update in global state
      updateCustomer(selectedCustomer.id, updatedCustomer);
      setSelectedCustomer(updatedCustomer);
      handleAction('更新成功', '客户信息已成功更新。');
    } else {
      // Create new customer
      const customer: Customer = {
        id: `CUST-${Date.now()}`,
        addDate: new Date().toISOString().split('T')[0],
        hasReplied: false,
        wechatStatus: 'offline',
        demoProducts: '暂无',
        salesRep: user?.username || 'admin',
        ...newCustomer,
        painPointAnalysis: newCustomer.painPoints ? {
          corePainPoints: [newCustomer.painPoints.substring(0, 10), '效率提升', '成本控制'],
          potentialNeeds: ['自动化流程', '团队协作', '数据分析'],
          recommendedStrategy: `针对客户提到的"${newCustomer.painPoints}"，建议重点展示我们的自动化解决方案。`,
          objectionHandling: [
            { objection: '担心操作复杂', response: '我们提供保姆级上手教程，5分钟即可完成首个任务。' }
          ]
        } : undefined
      } as Customer;

      addCustomer(customer);
    }

    setIsNewModalOpen(false);
    setIsEditingCustomer(false);
    setNewCustomer({
      name: '',
      wechatId: '',
      platform: '',
      category: '',
      intentLevel: '中',
      conversionStatus: '未转化',
      followUpStatus: '新添加',
      painPoints: '',
      demoProducts: '',
    });
  };

  const openNewCustomerModal = () => {
    setIsEditingCustomer(false);
    setNewCustomer({
      name: '',
      wechatId: '',
      platform: '',
      category: '',
      intentLevel: '中',
      conversionStatus: '未转化',
      followUpStatus: '新添加',
      painPoints: '',
    });
    setIsNewModalOpen(true);
  };

  const openEditCustomerModal = () => {
    if (selectedCustomer) {
      setIsEditingCustomer(true);
      setNewCustomer({
        name: selectedCustomer.name,
        wechatId: selectedCustomer.wechatId,
        platform: selectedCustomer.platform || '',
        category: selectedCustomer.category || '',
        intentLevel: selectedCustomer.intentLevel,
        conversionStatus: selectedCustomer.conversionStatus,
        followUpStatus: selectedCustomer.followUpStatus,
        painPoints: selectedCustomer.painPoints || '',
        demoProducts: selectedCustomer.demoProducts || '',
      });
      setIsNewModalOpen(true);
    }
  };

  const handleAction = (title: string, message: string) => {
    setSystemModalContent({ title, message });
    setIsSystemModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    const headers = ['客户名称', '微信号', '平台', '品类', '意向程度(高/中/低)', '测试产品', '痛点需求'];
    const data = [
      ['示例客户', 'wxid_example', 'Amazon', '服装', '高', '超凡AI-专业版', '需要提升出图效率']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "微信客户导入模板");
    
    XLSX.writeFile(wb, "微信客户导入模板.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Skip header row
        const rows = data.slice(1).filter(row => row.length > 0 && row[0]);
        
        const importedCustomers: Customer[] = rows.map((row, index) => {
          return {
            id: `CUST-${Date.now()}-${index}`,
            name: row[0] || `导入客户${index + 1}`,
            wechatId: row[1] || `wxid_import_${Date.now()}_${index}`,
            platform: row[2] || '未知',
            category: row[3] || '未知',
            intentLevel: (row[4] as any) || '中',
            demoProducts: row[5] || '',
            painPoints: row[6] || '',
            wechatStatus: 'online',
            addDate: new Date().toISOString().split('T')[0],
            hasReplied: false,
            conversionStatus: '未转化',
            followUpStatus: '新添加',
            salesRep: user?.username || 'admin',
          } as Customer;
        });

        importedCustomers.forEach(c => addCustomer(c));
        
        setIsUploading(false);
        setIsImportModalOpen(false);
        handleAction('导入成功', `成功导入 ${importedCustomers.length} 条客户数据。`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setIsUploading(false);
        handleAction('导入失败', '解析 Excel 文件失败，请确保文件格式正确。');
      } finally {
        // Reset file input
        e.target.value = '';
      }
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      handleAction('导入失败', '读取文件失败。');
      e.target.value = '';
    };
    
    reader.readAsBinaryString(file);
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newFollowUp.content) return;

    const record: FollowUpRecord = {
      id: `REC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      content: newFollowUp.content,
      nextFollowUpDate: newFollowUp.nextDate || undefined,
      screenshot: newFollowUp.screenshot || undefined
    };

    const updatedRecords = [record, ...(selectedCustomer.followUpRecords || [])];
    
    const updatedCustomer = {
      ...selectedCustomer,
      followUpRecords: updatedRecords,
      nextFollowUpDate: newFollowUp.nextDate || selectedCustomer.nextFollowUpDate
    };

    updateCustomer(selectedCustomer.id, updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    
    setNewFollowUp({ content: '', nextDate: '', screenshot: '' });
    handleAction('添加成功', '跟进记录已成功添加。');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">客户管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理您的微信客户，AI 辅助跟进与转化。</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导入微信客户
          </button>
          <button 
            onClick={openNewCustomerModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建客户
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索客户名称、微信号..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            {user?.role === 'admin' && (
              <select 
                value={salesRepFilter}
                onChange={(e) => setSalesRepFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none shadow-sm"
              >
                <option value="all">所有销售</option>
                <option value="sales1">销售一</option>
                <option value="sales2">销售二</option>
                <option value="sales3">销售三</option>
                <option value="sales4">销售四</option>
                <option value="sales5">销售五</option>
                <option value="sales6">销售六</option>
              </select>
            )}
            
            {/* Bulk Actions */}
            {selectedCustomerIds.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
                <span className="text-sm text-indigo-600 font-medium px-2">
                  已选 {selectedCustomerIds.size} 项
                </span>
                <button 
                  onClick={() => handleAction('批量打标签', `将为选中的 ${selectedCustomerIds.size} 个客户打标签。`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Tag className="w-3.5 h-3.5" />
                  打标签
                </button>
                <button 
                  onClick={() => handleAction('批量设置状态', `将修改选中的 ${selectedCustomerIds.size} 个客户的跟进状态。`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  设置状态
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleAction('筛选客户', '高级筛选功能即将上线，敬请期待。')}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <span className="text-sm text-slate-500">共 {filteredCustomers.length} 人</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 w-12 border-b border-slate-200">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filteredCustomers.length > 0 && selectedCustomerIds.size === filteredCustomers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">客户信息</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">意向/状态</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">平台/品类</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">跟进进度</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className={cn("hover:bg-slate-50 transition-colors cursor-pointer", selectedCustomerIds.has(customer.id) && "bg-indigo-50/30")}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedCustomerIds.has(customer.id)}
                      onChange={(e) => handleSelectOne(e, customer.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                          {customer.name}
                          <div className="flex items-center gap-1">
                            <span className={cn("w-2 h-2 rounded-full", getWechatStatusColor(customer.wechatStatus))}></span>
                            <span className="text-[10px] text-slate-400 font-normal">{getWechatStatusText(customer.wechatStatus)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MessageCircle className="w-3 h-3" />
                          {customer.wechatId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={cn("px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full border", getIntentColor(customer.intentLevel))}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", getIntentDotColor(customer.intentLevel))}></span>
                        {customer.intentLevel}意向
                      </span>
                      <span className={cn("px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-md", getStatusColor(customer.conversionStatus))}>
                        {customer.conversionStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{customer.platform || '-'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{customer.category || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{customer.followUpStatus}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {customer.nextFollowUpDate ? `下次: ${customer.nextFollowUpDate}` : '无计划'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                      }}
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50" 
              onClick={() => setSelectedCustomer(null)} 
            />
            <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="w-full h-full bg-white shadow-2xl flex flex-col"
              >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">客户详情</h2>
                  <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-500 transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold text-slate-900 truncate">{selectedCustomer.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 shrink-0">
                          <MessageCircle className="w-4 h-4" /> 
                          <span className="truncate max-w-[120px] sm:max-w-[200px]">{selectedCustomer.wechatId}</span>
                        </p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200 shrink-0">
                          <span className={cn("w-1.5 h-1.5 rounded-full", getWechatStatusColor(selectedCustomer.wechatStatus))}></span>
                          <span className="text-[10px] font-medium text-slate-600 uppercase">{getWechatStatusText(selectedCustomer.wechatStatus)}</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          添加于 {selectedCustomer.addDate}
                        </p>
                      </div>
                      {selectedCustomer.wechatLastActive && (
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          最近活跃: {selectedCustomer.wechatLastActive}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleInsightScreenshotUpload}
                        className="hidden" 
                        id="insight-screenshot-upload"
                      />
                      <label 
                        htmlFor="insight-screenshot-upload"
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border cursor-pointer",
                          insightScreenshot 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                        title="上传聊天截图以获取更精准的回复建议"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {insightScreenshot ? '已上传截图' : '上传截图'}
                      </label>
                      {insightScreenshot && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setInsightScreenshot(null);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-200"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleDeepInsight}
                      disabled={isAnalyzing}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap",
                        isAnalyzing 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-200"
                      )}
                    >
                      {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin shrink-0"></div>
                      ) : (
                        <Sparkles className="w-4 h-4 shrink-0" />
                      )}
                      {isAnalyzing ? '分析中...' : '深度洞察'}
                    </button>
                    <button 
                      onClick={openEditCustomerModal}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                    >
                      编辑
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">意向与状态</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full border", getIntentColor(selectedCustomer.intentLevel))}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", getIntentDotColor(selectedCustomer.intentLevel))}></span>
                        {selectedCustomer.intentLevel}意向
                      </span>
                      <span className={cn("px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-md", getStatusColor(selectedCustomer.conversionStatus))}>
                        {selectedCustomer.conversionStatus}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">业务信息</p>
                    <p className="text-sm text-slate-900 mt-2 font-medium">
                      {selectedCustomer.platform || '未知'} · {selectedCustomer.category || '未知'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Deep Pain Point Analysis */}
                  {selectedCustomer.painPointAnalysis && (
                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot className="w-24 h-24" />
                      </div>
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          AI 深度痛点洞察
                        </h4>
                        <button 
                          onClick={() => setIsInsightGuidelinesOpen(true)}
                          className="text-xs text-indigo-300 hover:text-indigo-100 flex items-center gap-1 transition-colors"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          洞察须知
                        </button>
                      </div>
                      
                      <div className="space-y-5 relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">核心痛点</p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedCustomer.painPointAnalysis.corePainPoints || []).map((point, i) => (
                              <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs border border-white/10">{point}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">潜在需求</p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedCustomer.painPointAnalysis.potentialNeeds || []).map((need, i) => (
                              <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">{need}</span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">推荐转化策略</p>
                          <p className="text-sm leading-relaxed">{selectedCustomer.painPointAnalysis.recommendedStrategy}</p>
                        </div>

                        {selectedCustomer.painPointAnalysis.objectionHandling.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-rose-400 uppercase mb-2">异议处理话术</p>
                            <div className="space-y-3">
                              {(selectedCustomer.painPointAnalysis.objectionHandling || []).map((item, i) => (
                                <div key={i} className="text-xs">
                                  <p className="text-slate-400 mb-1">问: {item.objection}</p>
                                  <p className="text-emerald-400">答: {item.response}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedCustomer.painPointAnalysis.replySuggestions && (
                          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                            <p className="text-[10px] font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5">
                              <Zap className="w-3 h-3" />
                              回复话术建议 (基于聊天记录分析)
                            </p>
                            <p className="text-sm leading-relaxed text-amber-100">{selectedCustomer.painPointAnalysis.replySuggestions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      原始需求记录
                    </h4>
                    <div className="bg-amber-50 text-amber-900 p-4 rounded-lg text-sm border border-amber-100">
                      {selectedCustomer.painPoints || '暂无记录'}
                    </div>
                  </div>

                  {selectedCustomer.aiSuggestions && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-indigo-500" />
                        AI 跟进建议
                      </h4>
                      <div className="bg-indigo-50 text-indigo-900 p-4 rounded-lg text-sm border border-indigo-100 leading-relaxed">
                        {selectedCustomer.aiSuggestions}
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={() => handleAction('采纳建议并生成话术', '正在根据 AI 建议生成专属跟进话术...')}
                            className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors font-medium"
                          >
                            采纳建议并生成话术
                          </button>
                          <button 
                            onClick={() => handleAction('重新生成', '正在重新分析客户数据并生成新的跟进建议...')}
                            className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors"
                          >
                            重新生成
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">测试/演示产品</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {selectedCustomer.demoProducts || '暂无'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">下次跟进时间</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {selectedCustomer.nextFollowUpDate || '未设置'}
                      </p>
                    </div>
                  </div>

                  {selectedCustomer.featureRequests && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">功能反馈/建议</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {selectedCustomer.featureRequests}
                      </p>
                    </div>
                  )}

                  {selectedCustomer.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">备注</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {selectedCustomer.notes}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Records Section */}
                  <div className="pt-6 border-t border-slate-200 mt-8">
                    <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-indigo-500" />
                      跟进记录
                    </h4>
                    
                    {/* Add new record form */}
                    <form onSubmit={handleAddFollowUp} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                      <textarea 
                        rows={2}
                        placeholder="记录本次沟通内容..."
                        value={newFollowUp.content}
                        onChange={e => setNewFollowUp({...newFollowUp, content: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none mb-3"
                      />
                      
                      {newFollowUp.screenshot && (
                        <div className="mb-3 relative inline-block">
                          <img src={newFollowUp.screenshot} alt="Screenshot preview" className="h-20 w-auto rounded border border-slate-200" />
                          <button 
                            type="button"
                            onClick={() => setNewFollowUp({...newFollowUp, screenshot: ''})}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 font-medium">下次跟进:</label>
                            <input 
                              type="date" 
                              value={newFollowUp.nextDate}
                              onChange={e => setNewFollowUp({...newFollowUp, nextDate: e.target.value})}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">
                            <ImageIcon className="w-4 h-4" />
                            上传聊天截图
                            <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
                          </label>
                        </div>
                        <button 
                          type="submit"
                          disabled={!newFollowUp.content}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          添加记录
                        </button>
                      </div>
                    </form>

                    {/* Records List */}
                    <div className="space-y-4">
                      {selectedCustomer.followUpRecords && selectedCustomer.followUpRecords.length > 0 ? (
                        (selectedCustomer.followUpRecords || []).map(record => (
                          <div key={record.id} className="relative pl-4 border-l-2 border-slate-200 pb-4 last:pb-0">
                            <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full -left-[5.5px] top-1.5 ring-4 ring-white"></div>
                            <div className="text-xs text-slate-500 mb-1 font-medium">{record.date}</div>
                            <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {record.content}
                              {record.screenshot && (
                                <div className="mt-3">
                                  <img 
                                    src={record.screenshot} 
                                    alt="Chat screenshot" 
                                    className="max-w-xs rounded-lg border border-slate-200 cursor-zoom-in hover:opacity-90 transition-opacity" 
                                    onClick={() => handleAction('查看截图', '截图查看功能即将上线，目前仅支持缩略图展示。')}
                                  />
                                </div>
                              )}
                            </div>
                            {record.nextFollowUpDate && (
                              <div className="text-xs text-indigo-600 mt-2 flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3" />
                                计划下次跟进: {record.nextFollowUpDate}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          暂无跟进记录
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => handleAction('发送微信消息', '正在唤起微信客户端...')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  发送微信消息
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>

      {/* New Customer Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title={isEditingCustomer ? "编辑客户" : "新建客户"} size="lg">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 *</label>
              <input 
                type="text" 
                required
                value={newCustomer.name}
                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">微信号 *</label>
              <input 
                type="text" 
                required
                value={newCustomer.wechatId}
                onChange={e => setNewCustomer({...newCustomer, wechatId: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">平台</label>
              <input 
                type="text" 
                placeholder="如：Amazon, Shopify"
                value={newCustomer.platform}
                onChange={e => setNewCustomer({...newCustomer, platform: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">品类</label>
              <input 
                type="text" 
                placeholder="如：服装/T恤"
                value={newCustomer.category}
                onChange={e => setNewCustomer({...newCustomer, category: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">意向程度</label>
              <select 
                value={newCustomer.intentLevel}
                onChange={e => setNewCustomer({...newCustomer, intentLevel: e.target.value as any})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">转化状态</label>
              <select 
                value={newCustomer.conversionStatus}
                onChange={e => setNewCustomer({...newCustomer, conversionStatus: e.target.value as any})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="未转化">未转化</option>
                <option value="测试中">测试中</option>
                <option value="已成交">已成交</option>
                <option value="已流失">已流失</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">微信来源</label>
              <select 
                value={newCustomer.wechatSource}
                onChange={e => setNewCustomer({...newCustomer, wechatSource: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="手动添加">手动添加</option>
                <option value="官网扫码">官网扫码</option>
                <option value="搜索添加">搜索添加</option>
                <option value="行业群邀请">行业群邀请</option>
                <option value="线下展会">线下展会</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">测试产品</label>
              <input 
                type="text" 
                placeholder="如：超凡AI-专业版"
                value={newCustomer.demoProducts}
                onChange={e => setNewCustomer({...newCustomer, demoProducts: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">痛点需求</label>
              <textarea 
                rows={3}
                value={newCustomer.painPoints}
                onChange={e => setNewCustomer({...newCustomer, painPoints: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              保存客户
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => !isUploading && setIsImportModalOpen(false)} title="导入微信客户" size="lg">
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">方案一：企业微信自动同步 (推荐)</h3>
                <p className="text-sm text-slate-500 mt-1 mb-3">
                  授权绑定企业微信，自动同步客户列表、标签及沟通记录，实现无缝对接。
                </p>
                <button 
                  onClick={() => {
                    setIsImportModalOpen(false);
                    handleAction('企业微信授权', '正在跳转至企业微信授权页面...');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  去授权绑定
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <Download className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900">方案二：RPA 辅助录入 (半自动化)</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  使用合规的 RPA (机器人流程自动化) 工具，在电脑端微信模拟人工操作，批量抓取好友列表并导出为 Excel，然后一键导入本系统。
                </p>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckSquare className="w-4 h-4" />
                    <span>适用于个人微信存量客户</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckSquare className="w-4 h-4" />
                    <span>解决手动录入 3000 人的痛点</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>需配合第三方 RPA 软件使用</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleDownloadTemplate}
                    disabled={isUploading}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    下载 Excel 模板
                  </button>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button 
                      disabled={isUploading}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          正在导入...
                        </>
                      ) : (
                        '上传数据文件'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Insight Guidelines Modal */}
      <Modal isOpen={isInsightGuidelinesOpen} onClose={() => setIsInsightGuidelinesOpen(false)} title="AI 深度洞察须知" size="md">
        <div className="space-y-4 py-2">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              工作原理
            </h4>
            <p className="text-sm text-indigo-800 leading-relaxed">
              AI 深度洞察功能基于大语言模型（如 Gemini），结合您在“系统设置”中配置的“资深分析师人设”提示词，对当前客户的业务信息、意向状态、历史跟进记录进行综合分析。
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">如何获得更精准的洞察？</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span><strong>完善客户信息：</strong> 确保客户的平台、类目、意向级别等基础信息填写完整。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span><strong>记录跟进历史：</strong> 详细的跟进记录能帮助 AI 更好地理解客户的决策过程和顾虑。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span><strong>上传聊天截图：</strong> 在点击“深度洞察”前，您可以先上传与客户的最新聊天截图，AI 将针对截图内容提供具体的回复建议和话术指导。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <span><strong>优化分析师人设：</strong> 您可以随时前往“系统设置”修改 AI 的系统提示词，让其更符合您的业务场景和话术风格。</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
          <button 
            onClick={() => setIsInsightGuidelinesOpen(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            我已了解
          </button>
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
    </div>
  );
}

