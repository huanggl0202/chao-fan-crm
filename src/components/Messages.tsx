import React, { useState } from 'react';
import { MessageSquareText, Search, Plus, Copy, Edit2, Trash2, CheckCircle2, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './Modal';

export function Messages() {
  const categories = ['全部', '破冰问候', '产品介绍', '价格谈判', '催单/逼单', '售后维护'];
  
  const [scripts, setScripts] = useState([
    {
      id: 1,
      category: '破冰问候',
      title: '针对Shopify卖家的首次触达',
      content: '您好，我是超凡AI的顾问。看到您在做Shopify定制礼品，我们最近刚好有个针对马克杯排版的自动化方案，能帮您每天节省2小时人工，有兴趣了解下吗？',
      usageCount: 156
    },
    {
      id: 2,
      category: '价格谈判',
      title: '客户觉得价格贵时的价值引导',
      content: '完全理解您的顾虑。其实很多刚起步的卖家一开始也觉得有成本压力。但您可以算一笔账，目前您每天花在修图上的时间大概是3小时，如果用超凡AI，这3小时可以用来选品和优化Listing，多出几单利润就完全覆盖软件费了。要不我先给您开个基础版体验一周？',
      usageCount: 89
    },
    {
      id: 3,
      category: '催单/逼单',
      title: '试用期结束前的转化',
      content: '王总您好，看到您这几天的试用已经结束了。不知道在体验过程中，超凡AI的批量排版功能有没有帮您提升效率？如果您觉得目前版本还有哪些不满足需求的地方，随时跟我沟通，我们技术团队可以评估定制。另外本周刚好有个针对新用户的"首月半价"活动，您看需要帮您申请一个名额吗？',
      usageCount: 234
    }
  ]);

  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // New Script Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('破冰问候');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // AI Chat State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredScripts = scripts.filter(script => {
    const matchesCategory = activeCategory === '全部' || script.category === activeCategory;
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          script.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    
    if (editingId) {
      setScripts(scripts.map(s => s.id === editingId ? { ...s, title: newTitle, category: newCategory, content: newContent } : s));
    } else {
      const newScript = {
        id: Date.now(),
        category: newCategory,
        title: newTitle,
        content: newContent,
        usageCount: 0
      };
      setScripts([newScript, ...scripts]);
    }
    
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setEditingId(null);
  };

  const handleEditScript = (script: any) => {
    setEditingId(script.id);
    setNewTitle(script.title);
    setNewCategory(script.category);
    setNewContent(script.content);
    setIsNewModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewCategory('破冰问候');
    setNewContent('');
    setIsNewModalOpen(true);
  };

  const generateAiScript = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setAiResponse(`您好！了解到您目前在处理【${aiPrompt}】时遇到了一些挑战。超凡AI的自动化排版功能正是为了解决这类问题而设计的，它可以帮您大幅提升效率。我们目前提供免费试用，您有兴趣体验一下吗？`);
      setIsGenerating(false);
    }, 1500);
  };

  const saveAiScript = () => {
    if (!aiResponse) return;
    setNewTitle(`AI生成: ${aiPrompt.substring(0, 10)}...`);
    setNewContent(aiResponse);
    setIsAiModalOpen(false);
    setIsNewModalOpen(true);
    setAiPrompt('');
    setAiResponse('');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 话术库</h1>
          <p className="text-sm text-slate-500 mt-1">沉淀优秀销售经验，AI 辅助生成高转化话术。</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openNewModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建话术
        </motion.button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索话术..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
          <AnimatePresence mode="popLayout">
            {filteredScripts.map((script) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={script.id} 
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                    {script.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditScript(script)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setScripts(scripts.filter(s => s.id !== script.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{script.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1 whitespace-pre-wrap">
                  {script.content}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">已使用 {script.usageCount} 次</span>
                  <button 
                    onClick={() => handleCopy(script.id, script.content)}
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                      copiedId === script.id 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-indigo-600 hover:text-indigo-700 bg-indigo-50'
                    }`}
                  >
                    {copiedId === script.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === script.id ? '已复制' : '复制'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAiModalOpen(true)}
            className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-5 flex flex-col items-center justify-center text-indigo-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer min-h-[200px]"
          >
            <Bot className="w-10 h-10 mb-3" />
            <span className="text-sm font-semibold">让 AI 帮我写新话术</span>
            <span className="text-xs text-indigo-400 mt-1">输入场景，一键生成</span>
          </motion.div>
        </div>
      </div>

      {/* New Script Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title={editingId ? "编辑话术" : "新建话术"}>
        <form onSubmit={handleCreateScript} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">话术标题</label>
            <input 
              type="text" 
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="例如：针对Shopify卖家的首次触达"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
            <select 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              {categories.filter(c => c !== '全部').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">话术内容</label>
            <textarea 
              required
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={5}
              placeholder="输入话术内容..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
            />
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
              保存话术
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Generate Modal */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="AI 智能生成话术" size="lg">
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3 border border-indigo-100">
            <Bot className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-900 leading-relaxed">
              告诉我您想针对什么场景、什么类型的客户生成话术？例如：“帮我写一段针对亚马逊卖家，强调出图速度快的逼单话术。”
            </p>
          </div>
          
          <div className="relative">
            <textarea 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={3}
              placeholder="输入您的需求..."
              className="w-full pl-3 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none shadow-sm"
            />
            <button 
              onClick={generateAiScript}
              disabled={!aiPrompt || isGenerating}
              className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-sm text-slate-500">AI 正在思考中...</span>
            </div>
          )}

          {aiResponse && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-3"
            >
              <h4 className="text-sm font-medium text-slate-900">生成结果：</h4>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setAiResponse('')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  重新生成
                </button>
                <button 
                  onClick={saveAiScript}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  采纳并保存
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>
    </div>
  );
}

