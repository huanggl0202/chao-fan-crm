import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Upload, 
  Database, 
  Link as LinkIcon, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Bot,
  Key,
  Users,
  Shield,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Modal } from './Modal';
import { useAuth, User, PermissionLevel } from '../auth';
import { useAppContext } from '../store';
import { cn } from './Layout';
import { motion, AnimatePresence } from 'motion/react';

export function Settings() {
  const { user, users, updateUser, addUser, removeUser } = useAuth();
  const { aiPersonaPrompt, setAiPersonaPrompt } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  // LLM Settings State
  const [llmSettings, setLlmSettings] = useState({
    provider: 'deepseek',
    apiKey: 'sk-************************',
    model: 'deepseek-chat',
    apiEndpoint: 'https://api.deepseek.com/v1'
  });

  // User Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  const handleAction = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const startEditingUser = (u: User) => {
    setEditingUserId(u.id);
    setEditFormData({
      name: u.name,
      permissionLevel: u.permissionLevel,
      positions: [...u.positions]
    });
  };

  const saveUserEdit = (id: string) => {
    updateUser(id, editFormData);
    setEditingUserId(null);
  };

  const handleAddUser = () => {
    const newId = `sales${users.length + 1}`;
    const newUser: User = {
      id: newId,
      username: newId,
      name: `新销售${users.length + 1}`,
      role: 'sales',
      permissionLevel: '子权限',
      positions: ['软件顾问']
    };
    addUser(newUser);
    startEditingUser(newUser);
  };

  const handleRemoveUser = (id: string) => {
    if (id === 'admin') {
      handleAction('操作失败', '无法删除主管理员账号。');
      return;
    }
    removeUser(id);
  };

  const togglePosition = (pos: string) => {
    const currentPositions = editFormData.positions || [];
    if (currentPositions.includes(pos)) {
      setEditFormData({ ...editFormData, positions: currentPositions.filter(p => p !== pos) });
    } else {
      setEditFormData({ ...editFormData, positions: [...currentPositions, pos] });
    }
  };

  const POSITIONS = ['主管', '软件顾问', '产品经理', '售后专员'];

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <Shield className="w-16 h-16 opacity-20" />
        <p className="text-lg font-medium">只有管理员可以访问系统设置</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">系统管理中心</h1>
          <p className="text-sm text-slate-500 mt-1">配置 AI 接口、管理团队成员及权限、优化业务流程。</p>
        </div>
      </div>

      {/* LLM API Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">LLM 大模型 API 配置</h2>
              <p className="text-xs text-slate-500">接入主流大模型，为 CRM 提供深度 AI 洞察能力。</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已连接
          </span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">模型供应商</label>
                <select 
                  value={llmSettings.provider}
                  onChange={e => setLlmSettings({...llmSettings, provider: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="deepseek">DeepSeek (推荐)</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    value={llmSettings.apiKey}
                    onChange={e => setLlmSettings({...llmSettings, apiKey: e.target.value})}
                    placeholder="请输入您的 API Key"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">模型名称</label>
                <input 
                  type="text" 
                  value={llmSettings.model}
                  onChange={e => setLlmSettings({...llmSettings, model: e.target.value})}
                  placeholder="例如: deepseek-chat"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">API 代理地址 (可选)</label>
                <input 
                  type="text" 
                  value={llmSettings.apiEndpoint}
                  onChange={e => setLlmSettings({...llmSettings, apiEndpoint: e.target.value})}
                  placeholder="https://api.deepseek.com/v1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-500" />
              AI 洞察资深分析师人设 (Prompt)
            </label>
            <p className="text-xs text-slate-500 mb-3">自定义 AI 在进行客户深度洞察时扮演的角色和分析逻辑，支持随时修改优化。</p>
            <textarea
              value={aiPersonaPrompt}
              onChange={e => setAiPersonaPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="请输入 AI 分析师的系统提示词..."
            />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4" />
              <span>配置完成后，系统将自动启用 AI 痛点提取、深度洞察及回复建议功能。</span>
            </div>
            <button 
              onClick={() => handleAction('保存配置', 'AI 接口配置已更新，深度洞察功能已就绪。')}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              保存并测试连接
            </button>
          </div>
        </div>
      </div>

      {/* User Management & Permissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">团队成员与权限管理</h2>
              <p className="text-xs text-slate-500">自定义销售子账号的岗位、姓名及权限级别。</p>
            </div>
          </div>
          <button 
            onClick={handleAddUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            添加成员
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">姓名/账号</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">权限级别</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">岗位标签</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {users.map((u) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={u.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === u.id ? (
                      <input 
                        type="text" 
                        value={editFormData.name}
                        onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        className="px-2 py-1 border border-indigo-300 rounded outline-none text-sm"
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">@{u.username}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === u.id ? (
                      <select 
                        value={editFormData.permissionLevel}
                        onChange={e => setEditFormData({...editFormData, permissionLevel: e.target.value as PermissionLevel})}
                        className="px-2 py-1 border border-indigo-300 rounded outline-none text-sm"
                      >
                        <option value="主管理权限">主管理权限</option>
                        <option value="子权限">子权限</option>
                      </select>
                    ) : (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        u.permissionLevel === '主管理权限' 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                          : "bg-indigo-50 text-indigo-600 border-indigo-200"
                      )}>
                        {u.permissionLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingUserId === u.id ? (
                      <div className="flex flex-wrap gap-1.5">
                        {POSITIONS.map(pos => (
                          <button
                            key={pos}
                            onClick={() => togglePosition(pos)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-medium border transition-all",
                              editFormData.positions?.includes(pos)
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                            )}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(u.positions || []).map((pos, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-md shadow-sm">
                            {pos}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {editingUserId === u.id ? (
                        <button 
                          onClick={() => saveUserEdit(u.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEditingUser(u)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== 'admin' && (
                            <button 
                              onClick={() => handleRemoveUser(u.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* WeChat Integration (Existing) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Upload className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">微信客户导入方案</h2>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              关于 3000+ 微信客户的自动化导入
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              由于微信官方限制，直接从个人微信自动同步好友列表存在封号风险。为了安全、高效地将您的 3000 多名客户导入 CRM，我们推荐以下两种合规方案：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1 */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors group relative">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">推荐方案</span>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <Database className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">方案一：企业微信迁移 + API 同步</h4>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                将个人微信客户逐步引导或迁移至企业微信。企业微信提供官方 API，超凡AI CRM 可直接对接企微接口，实现客户信息、标签、聊天记录的实时自动同步。
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% 官方合规，无封号风险
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 支持自动打标签和跟进提醒
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 适合 5 个销售顾问团队管理
                </li>
              </ul>
              <button 
                onClick={() => handleAction('配置企业微信接口', '此功能需要管理员权限，请联系您的系统管理员获取企业微信 API 密钥。')}
                className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
              >
                配置企业微信接口
              </button>
            </div>

            {/* Option 2 */}
            <div className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors group">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-800 transition-colors">
                <Smartphone className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">方案二：RPA 辅助录入 (半自动化)</h4>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                使用合规的 RPA (机器人流程自动化) 工具，在电脑端微信模拟人工操作，批量抓取好友列表并导出为 Excel，然后一键导入本系统。
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 适用于个人微信存量客户
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 解决手动录入 3000 人的痛点
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 text-amber-600">
                  <AlertCircle className="w-4 h-4" /> 需配合第三方 RPA 软件使用
                </li>
              </ul>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction('下载 Excel 模板', '模板文件已开始下载，请按照模板格式整理您的客户数据。')}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  下载 Excel 模板
                </button>
                <button 
                  onClick={() => handleAction('上传数据文件', '请选择您整理好的 Excel 文件进行上传。系统将自动解析并导入客户数据。')}
                  className="flex-1 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors"
                >
                  上传数据文件
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <div className="py-4">
          <p className="text-slate-700">{modalContent}</p>
        </div>
        <div className="flex justify-end pt-4">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            确定
          </button>
        </div>
      </Modal>
    </div>
  );
}
