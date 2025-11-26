
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, VideoBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert blob to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url part if present (e.g. "data:video/mp4;base64,...")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeVideo = async (file: File, platformContext: string): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);
  const mimeType = file.type;

  const prompt = `
    你是一位资深的短视频内容分析专家，服务于专业的中国出海内容团队。
    请分析这个视频，该视频计划发布在 ${platformContext} 平台上。
    
    请执行以下任务：
    1. **识别语言**: 识别视频中的主要口语语言 (必须是以下之一: Portuguese, English, Spanish, Russian, Japanese, Malay, Thai, Indonesian)。
    2. **原文听写**: 逐字听写视频中的原始语音内容 (Original Script)。
    3. **中文翻译**: 将听写的原始内容完整、准确地翻译成简体中文 (Chinese Script)。
    4. **结构分析**: 请分别分析视频的: 
       - 黄金3秒开头(Hook): 开篇是如何吸引注意力的？
       - 中段内容(Body): 核心叙事逻辑是什么？
       - 结尾引导(CTA): 如何引导用户互动或转化？
       - 视频节奏(Pacing): 整体剪辑和叙事节奏如何？
       请用**中文**简练概括。
    5. **爆款亮点**: 识别视频中容易引发传播的关键亮点、槽点或爽点。请用**中文**列出。
    6. **优化建议**: 针对 ${platformContext} 平台的算法机制和用户偏好，提出具体的优化建议，帮助视频获得更好的播放数据。请用**中文**列出。
    7. **优化文案 (Optimized Script)**: 
       基于上述优化建议，请对原始口播文案进行“改写升级”。
       - 强化黄金3秒开头 (Hook)。
       - 精简冗余信息，提升信息密度。
       - 增强情绪感染力或互动引导。
       请提供:
       - original: 优化后的原文 (必须保持与原视频的口语语言严格一致！例如：原视频是葡萄牙语，这里必须输出优化后的葡萄牙语；是英语则输出英语)。
       - cn: 优化后文案的中文翻译
    8. **翻拍脚本 Brief**: 创建一个 JSON 格式的“翻拍脚本”。这个脚本将用于指导不懂中文的外籍创作者复刻该视频。
       Brief 必须包含以下3个核心部分，每个字段都需要包含 'cn' (中文指导，给运营看) 和 'target' (目标语言文案，给老外看) 两个部分。
       **特别注意：为了最终导出的图片排版美观，所有内容请务必分行显示，不要堆积成一大段。**
       
       - shootingGuide (拍摄指导): 
         cn: 详细描述分镜画面、运镜方式、场景布置、演员动作与表情。**请务必分条陈述，每一条指令结束后必须换行。可以使用列表符号(如 • 或 -)，重点是版面清晰，便于阅读。**
         target: Detailed instructions for camera angles, scene setup, and actor performance/actions. **Please format with clear line breaks between instructions (bullet points or paragraphs) for easy reading.**
       
       - scriptReference (口播文案参考): 
         cn: 视频中核心台词、旁白或字幕的**中文翻译**。**请严格按句分行，每一行对应一句台词，与外语原文一一对应。**
         target: The actual spoken script or text overlays in the target language (Original language of the video). **Format line-by-line to match the flow of the video.**
       
       - sellingPoints (产品卖点/核心价值): 
         cn: 视频需要重点展示的产品功能点、痛点解决方案或情绪价值。**请分行展示，每行一个卖点。**
         target: Key selling points or value propositions to emphasize in the video. **Format as a bulleted list, one point per line.**

       - targetLanguage: 自动识别出的目标语言名称（英文）。
       
    请仅返回符合指定 Schema 的 JSON 数据。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLanguage: { type: Type.STRING },
          originalScript: { type: Type.STRING },
          chineseScript: { type: Type.STRING },
          optimizedScript: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING, description: "Rewritten script in the SAME language as the original video source." },
              cn: { type: Type.STRING, description: "Chinese translation of the optimized script" }
            }
          },
          structure: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING, description: "Analysis of the first 3 seconds/hook in Chinese" },
              body: { type: Type.STRING, description: "Analysis of the main content body in Chinese" },
              cta: { type: Type.STRING, description: "Analysis of the CTA/ending in Chinese" },
              pacing: { type: Type.STRING, description: "Analysis of the video pacing in Chinese" }
            }
          },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          initialBrief: {
            type: Type.OBJECT,
            properties: {
              targetLanguage: { type: Type.STRING },
              shootingGuide: {
                type: Type.OBJECT,
                properties: { 
                    cn: { type: Type.STRING, description: "Chinese shooting instructions, with clear line breaks" }, 
                    target: { type: Type.STRING } 
                }
              },
              scriptReference: {
                type: Type.OBJECT,
                properties: { 
                    cn: { type: Type.STRING, description: "Chinese translation of the script lines, line-by-line" }, 
                    target: { type: Type.STRING } 
                }
              },
              sellingPoints: {
                type: Type.OBJECT,
                properties: { 
                    cn: { type: Type.STRING, description: "Chinese selling points, one per line" }, 
                    target: { type: Type.STRING } 
                }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Gemini API 未返回数据");
  }

  return JSON.parse(response.text) as AnalysisResult;
};

export const syncTranslation = async (
  chineseText: string,
  targetLang: string,
  context: string
): Promise<string> => {
  const prompt = `
    你是一位专业的视频本地化专家。
    请将以下视频 Brief 中的中文指令/文案翻译成地道、自然的 ${targetLang}。
    
    当前上下文: ${context} (shootingGuide=拍摄指导, scriptReference=口播文案, sellingPoints=产品卖点)
    
    中文原文: "${chineseText}"
    
    翻译要求：
    1. 保持与原文一致的结构格式（如果是列表，请保持列表）。
    2. **确保每一条指令或句子都换行显示，不要合并成一段。**
    3. 仅返回翻译后的文本字符串，不要包含任何解释。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "";
};
