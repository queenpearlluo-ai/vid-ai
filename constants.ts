
import { SupportedLanguage } from './types';

export const LANGUAGES = Object.values(SupportedLanguage);

export const PLACEHOLDER_BRIEF = {
  shootingGuide: { cn: '加载中...', target: 'Loading...' },
  scriptReference: { cn: '加载中...', target: 'Loading...' },
  sellingPoints: { cn: '加载中...', target: 'Loading...' },
  targetLanguage: 'English'
};

export const MAX_VIDEO_SIZE_MB = 20; // Limit for client-side processing to avoid crashes
