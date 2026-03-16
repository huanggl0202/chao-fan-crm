import React, { useState } from 'react';
import { 
  Bot, 
  Lightbulb, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle,
  FileText,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Modal } from './Modal';

export function AIInsights() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setModalTitle('分析完成');
      setModalContent('AI 已基于最新的客户数据重新生成了洞察报告。');
      setIsModalOpen(true);
    }, 1500);
  };

  const handleExport = () => {
    setModalTitle('导出成功');
    setModalContent('产品功能反馈汇总已成功导出，并发送至产品部邮箱。');
    setIsModalOpen(true);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCustomScenario = () => {
    setModalTitle('自定义场景生成话术');
    setModalContent('此功能即将上线，敬请期待！您可以前往"话术库"使用 AI 助手生成。');
    setIsModalOpen(true);
  };

  const insights = [
    {
      title: '客户痛点分析',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
      content: '近期 30% 的流失客户提到了"出图速度慢"的问题。建议在下个版本的更新日志中重点强调并发处理能力的提升，并针对这批流失客户进行定向召回。'
    },
    {
      title: '高意向客户特征',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
      content: '分析显示，来自"独立站"且品类为"服装/T恤"的客户转化率最高（达 45%）。建议加大对该类客户的获取力度，并准备专门的行业解决方案演示。'
    },
    {
      title: '话术优化建议',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      content: '当客户询问价格时，直接报价的流失率较高。AI建议先发送"ROI计算器"或"同行成功案例"，引导客户关注价值而非单纯的软件成本。'
    }
  ];

  const generatedScripts = [
    {
      scenario: '客户试用期结束未购买',
      script: '王总您好，看到您这几天的试用已经结束了。不知道在体验过程中，超凡AI的批量排版功能有没有帮您提升效率？如果您觉得目前版本还有哪些不满足需求的地方，随时跟我沟通，我们技术团队可以评估定制。另外本周刚好有个针对新用户的"首月半价"活动，您看需要帮您申请一个名额吗？'
    },
    {
      scenario: '客户觉得价格贵',
      script: '李老板，完全理解您的顾虑。其实很多刚起步的卖家一开始也觉得有成本压力。但您可以算一笔账，目前您每天花在修图上的时间大概是3小时，如果用超凡AI，这3小时可以用来选品和优化Listing，多出几单利润就完全覆盖软件费了。要不我先给您开个基础版体验一周？'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 洞察与跟进</h1>
          <p className="text-sm text-slate-500 mt-1">基于您的客户数据，AI 自动生成的业务分析与跟进建议。</p>
        </div>
        <button 
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '分析中...' : '重新生成分析'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <Bot className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">全局数据洞察</h2>
            </div>
            <div className="p-6 space-y-6">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-full ${insight.bg} flex items-center justify-center`}>
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-slate-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {insight.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">产品功能反馈汇总</h2>
              </div>
              <button 
                onClick={handleExport}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                导出给产品部
              </button>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">1</span>
                  <div>
                    <span className="font-medium text-slate-900">批量导出高清图功能缺失</span>
                    <p className="text-slate-500 mt-1">提及频次：12次（高优先级）</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">2</span>
                  <div>
                    <span className="font-medium text-slate-900">AI生成图案边缘不够锐利</span>
                    <p className="text-slate-500 mt-1">提及频次：8次（中优先级）</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">3</span>
                  <div>
                    <span className="font-medium text-slate-900">希望增加Etsy平台一键刊登</span>
                    <p className="text-slate-500 mt-1">提及频次：5次（建议评估）</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Scripts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">AI 推荐话术</h2>
            </div>
            <div className="p-6 space-y-6">
              {generatedScripts.map((script, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    场景：{script.scenario}
                  </h3>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 relative group">
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      {script.script}
                    </p>
                    <button 
                      onClick={() => handleCopy(script.script, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-white border border-indigo-200 text-indigo-600 text-xs rounded shadow-sm font-medium flex items-center gap-1"
                    >
                      {copiedIndex === i ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">已复制</span>
                        </>
                      ) : (
                        '复制'
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleCustomScenario}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                + 自定义场景生成话术
              </button>
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
