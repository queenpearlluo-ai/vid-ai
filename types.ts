
export enum SupportedLanguage {
  PT_BR = 'Portuguese (Brazil)',
  EN = 'English',
  ES = 'Spanish',
  RU = 'Russian',
  JA = 'Japanese',
  MS = 'Malay',
  TH = 'Thai',
  ID = 'Indonesian'
}

export interface DualLanguageField {
  cn: string; // Chinese content
  target: string; // Target language content
}

export interface VideoBrief {
  shootingGuide: DualLanguageField; // 拍摄指导
  scriptReference: DualLanguageField; // 口播文案参考
  sellingPoints: DualLanguageField; // 产品卖点
  targetLanguage: string;
}

export interface VideoStructure {
  hook: string;   // 黄金3秒
  body: string;   // 中段内容
  cta: string;    // 结尾引导
  pacing: string; // 节奏分析
}

export interface AnalysisResult {
  detectedLanguage: string;
  originalScript: string;
  chineseScript: string;
  optimizedScript: {
    original: string;
    cn: string;
  };
  structure: VideoStructure;
  highlights: string[]; // List of video highlights
  optimizationSuggestions: string[]; // List of suggestions
  initialBrief: VideoBrief;
}

export type AppStep = 'upload' | 'analyzing' | 'result';
