export type IntentLevel = '高' | '中' | '低';
export type ConversionStatus = '未转化' | '测试中' | '已成交' | '已流失';
export type FollowUpStatus = '新添加' | '已沟通' | '需求确认' | '报价协商' | '已成单' | '暂无意向';

export interface FollowUpRecord {
  id: string;
  date: string;
  content: string;
  nextFollowUpDate?: string;
  screenshot?: string; // Base64 string for chat screenshot
}

export interface PainPointAnalysis {
  corePainPoints: string[];
  potentialNeeds: string[];
  recommendedStrategy: string;
  objectionHandling: { objection: string; response: string }[];
  replySuggestions?: string; // New: AI suggestions for improving replies
}

export interface Customer {
  id: string;
  wechatId: string;
  wechatStatus: 'online' | 'offline' | 'unbound';
  wechatLastActive?: string;
  wechatSource?: string;
  addDate: string;
  name: string;
  hasReplied: boolean;
  platform: string;
  category: string;
  painPoints: string;
  painPointAnalysis?: PainPointAnalysis;
  demoProducts: string;
  conversionStatus: ConversionStatus;
  followUpStatus: FollowUpStatus;
  intentLevel: IntentLevel;
  lostReason?: string;
  nextFollowUpDate?: string;
  renewalDate?: string;
  featureRequests?: string;
  notes?: string;
  aiSuggestions?: string;
  followUpRecords?: FollowUpRecord[];
  salesRep: string;
}

export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    wechatId: 'wxid_abc123',
    wechatStatus: 'online',
    wechatLastActive: '2026-03-06 14:30',
    wechatSource: '官网扫码',
    addDate: '2026-03-01',
    name: '张总 (深圳大卖)',
    hasReplied: true,
    platform: 'Amazon',
    category: '服装/T恤',
    painPoints: '目前使用的系统出图太慢，且经常卡顿，导致旺季订单处理不过来。',
    painPointAnalysis: {
      corePainPoints: ['出图速度慢', '系统稳定性差', '旺季吞吐量不足'],
      potentialNeeds: ['自动化批量处理', '云端渲染加速', '多账号协作'],
      recommendedStrategy: '重点演示我们的分布式渲染引擎和批量导出功能，强调在双11等大促期间的稳定性表现。',
      objectionHandling: [
        { objection: '担心迁移成本高', response: '我们提供一键导入现有模板的功能，并有专人负责对接，24小时内即可完成迁移。' }
      ]
    },
    demoProducts: '超凡AI-专业版',
    conversionStatus: '测试中',
    followUpStatus: '需求确认',
    intentLevel: '高',
    nextFollowUpDate: '2026-03-07',
    featureRequests: '希望增加批量导出高清图的功能。',
    notes: '客户对出图速度非常看重，建议下次演示重点展示我们的并发处理能力。',
    aiSuggestions: '建议跟进话术："张总您好，上次您提到的出图速度问题，我们这周刚上线了新的并发引擎，速度提升了3倍，您这边方便安排个时间我给您演示一下吗？"',
    salesRep: 'sales1',
    followUpRecords: [
      {
        id: 'REC-001',
        date: '2026-03-05',
        content: '与客户进行了初步沟通，客户表示目前使用的系统出图太慢，经常卡顿。我向他介绍了我们的专业版，并安排了下周的演示。',
        nextFollowUpDate: '2026-03-07'
      },
      {
        id: 'REC-002',
        date: '2026-03-02',
        content: '客户通过官网添加微信，发送了产品介绍资料，客户已读。'
      }
    ]
  },
  {
    id: 'CUST-002',
    wechatId: 'wxid_def456',
    wechatStatus: 'offline',
    wechatLastActive: '2026-03-01 09:15',
    wechatSource: '搜索添加',
    addDate: '2026-02-28',
    name: '李老板',
    hasReplied: false,
    platform: 'Shopify',
    category: '马克杯/定制礼品',
    painPoints: '未知',
    painPointAnalysis: {
      corePainPoints: ['缺乏自动化排版工具', '人工设计效率低'],
      potentialNeeds: ['智能排版', '一键生成效果图'],
      recommendedStrategy: '先发送一些针对定制礼品的成功案例视频，引起客户兴趣后再进行深度沟通。',
      objectionHandling: []
    },
    demoProducts: '暂无',
    conversionStatus: '未转化',
    followUpStatus: '新添加',
    intentLevel: '低',
    nextFollowUpDate: '2026-03-08',
    aiSuggestions: '客户添加后未回复，建议发送一条破冰消息："李总您好，我是超凡AI的顾问。看到您在做Shopify定制礼品，我们最近刚好有个针对马克杯排版的自动化方案，能帮您每天节省2小时人工，有兴趣了解下吗？"',
    salesRep: 'sales2'
  },
  {
    id: 'CUST-003',
    wechatId: 'wxid_ghi789',
    wechatStatus: 'online',
    wechatLastActive: '2026-03-07 10:00',
    wechatSource: '行业群邀请',
    addDate: '2026-01-15',
    name: '王女士 (独立站)',
    hasReplied: true,
    platform: '独立站',
    category: '帆布袋/周边',
    painPoints: '设计团队成本高，希望用AI替代部分基础设计工作。',
    painPointAnalysis: {
      corePainPoints: ['设计人力成本高', '基础设计重复性大'],
      potentialNeeds: ['AI辅助设计', '风格迁移', '自动抠图'],
      recommendedStrategy: '客户已成交，重点关注其对AI生成质量的反馈，并引导其尝试新上线的高级功能。',
      objectionHandling: []
    },
    demoProducts: '超凡AI-企业版',
    conversionStatus: '已成交',
    followUpStatus: '已成单',
    intentLevel: '高',
    renewalDate: '2027-01-15',
    featureRequests: 'AI生成的图案有时候边缘不够锐利。',
    aiSuggestions: '客户已成交，目前处于维护期。建议定期同步产品更新，特别是AI图像生成质量的提升。',
    salesRep: 'sales1'
  },
  {
    id: 'CUST-004',
    wechatId: 'wxid_jkl012',
    wechatStatus: 'unbound',
    wechatSource: '线下展会',
    addDate: '2026-02-10',
    name: '赵哥 (义乌工厂)',
    hasReplied: true,
    platform: 'Etsy',
    category: '木制品雕刻',
    painPoints: '觉得价格太贵，目前单量不大，不想投入太多软件成本。',
    painPointAnalysis: {
      corePainPoints: ['价格敏感', '单量不稳定'],
      potentialNeeds: ['按量付费模式', '低成本入门方案'],
      recommendedStrategy: '暂时保持低频触达，等待我们推出更具性价比的轻量版后再进行重点跟进。',
      objectionHandling: [
        { objection: '目前单量少，不划算', response: '我们即将推出按次付费的模式，非常适合您这种单量不稳定的情况。' }
      ]
    },
    demoProducts: '超凡AI-基础版',
    conversionStatus: '已流失',
    followUpStatus: '暂无意向',
    intentLevel: '低',
    lostReason: '价格敏感，单量不足以支撑软件费用',
    aiSuggestions: '客户因价格流失。建议在有促销活动或推出更低门槛的"入门版"时再次触达。',
    salesRep: 'sales3'
  }
];
