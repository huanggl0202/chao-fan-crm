import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeCustomerWithAI(
  personaPrompt: string,
  customerData: any,
  screenshotBase64?: string
) {
  // In a real app, you'd use the user's configured API key from settings.
  // For this demo, we'll use the platform's injected key if available, or mock it if not.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("No Gemini API key found. Using mock data.");
    return getMockAnalysis();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      ${personaPrompt}
      
      请分析以下客户信息：
      客户名称: ${customerData.name}
      客户来源: ${customerData.wechatSource}
      所属平台: ${customerData.platform || '未知'}
      主营类目: ${customerData.category || '未知'}
      意向程度: ${customerData.intentLevel}
      当前状态: ${customerData.conversionStatus}
      
      历史跟进记录:
      ${customerData.followUpHistory?.map((h: any) => `- [${h.date}] ${h.content}`).join('\n') || '暂无'}
      
      ${screenshotBase64 ? '请结合附带的聊天截图进行深度分析。' : ''}
    `;

    const parts: any[] = [{ text: prompt }];
    
    if (screenshotBase64) {
      // Remove data:image/...;base64, prefix if present
      const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming jpeg/png, Gemini handles standard formats
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            corePainPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "客户的核心痛点列表，简短精炼，不超过3个"
            },
            potentialNeeds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "客户的潜在需求列表，简短精炼，不超过3个"
            },
            recommendedStrategy: {
              type: Type.STRING,
              description: "推荐的转化策略，一段话说明"
            },
            objectionHandling: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objection: { type: Type.STRING, description: "可能的异议" },
                  response: { type: Type.STRING, description: "应对该异议的话术" }
                }
              },
              description: "异议处理话术，提供1-2个常见的异议及回复"
            },
            replySuggestions: {
              type: Type.STRING,
              description: "基于当前情况或聊天截图的回复建议"
            }
          },
          required: ["corePainPoints", "potentialNeeds", "recommendedStrategy", "objectionHandling", "replySuggestions"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return getMockAnalysis();
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return getMockAnalysis();
  }
}

function getMockAnalysis() {
  return {
    corePainPoints: ['决策链条长', '对价格极度敏感', '现有流程僵化'],
    potentialNeeds: ['降本增效方案', '分期付款支持', '定制化私有部署'],
    recommendedStrategy: '建议跳过基础功能演示，直接展示针对其义乌工厂模式的"按需付费"模型，并提供一份详细的 ROI 对比报告。',
    objectionHandling: [
      { objection: '目前单量少，不划算', response: '我们的新版按量付费模式，单次成本仅为人工的 1/10，且无需固定月费。' },
      { objection: '担心数据安全', response: '我们支持本地化部署，所有核心设计资产均加密存储在您的私有服务器。' }
    ],
    replySuggestions: '在最近的聊天中，您在回复"价格"问题时过于直接。建议先强调价值产出（如：每天节省3小时），再引入阶梯价格体系，避免陷入价格战。'
  };
}
