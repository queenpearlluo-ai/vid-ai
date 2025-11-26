
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Lightbulb, TrendingUp, Layers, Check, Copy, Timer, Film, MousePointerClick, Activity, Sparkles } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  videoUrl: string | null;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, videoUrl }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'script' | 'optimized'>('analysis');
  const [copied, setCopied] = useState(false);

  const copyScript = () => {
    let content = "";
    if (activeTab === 'optimized') {
        content = `优化后原文 (${result.detectedLanguage}):\n${result.optimizedScript?.original || "N/A"}\n\n优化后中文:\n${result.optimizedScript?.cn || "N/A"}`;
    } else {
        content = `原文 (${result.detectedLanguage}):\n${result.originalScript}\n\n中文翻译:\n${result.chineseScript}`;
    }
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Video & Metrics */}
      <div className="space-y-6">
        {/* Video Player */}
        {videoUrl && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
             <div className="relative aspect-video bg-black">
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-contain" 
                />
             </div>
             <div className="p-3 bg-slate-900/50 flex justify-between items-center border-t border-slate-700">
                <span className="text-xs font-medium text-slate-400">视频源文件预览</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                    {result.detectedLanguage}
                </span>
             </div>
          </div>
        )}

        {/* Structure Analysis - Visualized */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
             <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-slate-200">结构拆解 (Structure)</h3>
            </div>
            <div className="p-6">
                 {/* Visual Flow */}
                 <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-8 left-4 right-4 h-0.5 bg-slate-700 hidden md:block"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Hook */}
                        <div className="relative z-10 flex flex-col group">
                             <div className="w-16 h-8 rounded-full bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-400 mb-4 self-start md:self-center transition-all group-hover:bg-blue-900/50 group-hover:border-blue-400">
                                开头
                             </div>
                             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex-1 hover:border-blue-500/30 transition-colors">
                                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-blue-400"/> 黄金3秒
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{result.structure.hook}</p>
                             </div>
                        </div>

                        {/* Body */}
                        <div className="relative z-10 flex flex-col group">
                             <div className="w-16 h-8 rounded-full bg-slate-800 border-2 border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-400 mb-4 self-start md:self-center transition-all group-hover:bg-purple-900/50 group-hover:border-purple-400">
                                中段
                             </div>
                             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex-1 hover:border-purple-500/30 transition-colors">
                                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <Film className="w-4 h-4 text-purple-400"/> 核心内容
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{result.structure.body}</p>
                             </div>
                        </div>

                        {/* CTA */}
                        <div className="relative z-10 flex flex-col group">
                             <div className="w-16 h-8 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400 mb-4 self-start md:self-center transition-all group-hover:bg-emerald-900/50 group-hover:border-emerald-400">
                                结尾
                             </div>
                             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex-1 hover:border-emerald-500/30 transition-colors">
                                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4 text-emerald-400"/> 引导转化
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{result.structure.cta}</p>
                             </div>
                        </div>
                    </div>
                 </div>

                 {/* Pacing */}
                 <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-700/50 flex gap-4 items-start">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-amber-400 shrink-0" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-200 mb-1">节奏分析 (Pacing)</h4>
                        <p className="text-sm text-slate-400">{result.structure.pacing}</p>
                    </div>
                 </div>
            </div>
        </div>

        {/* 2-Column Grid: Highlights & Optimizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highlights */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-full">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-slate-200">爆款亮点</h3>
                </div>
                <div className="p-4 flex-1">
                    <ul className="space-y-3">
                    {result.highlights.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        {item}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>

            {/* Optimizations */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-full">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-slate-200">优化建议</h3>
                </div>
                <div className="p-4 flex-1">
                    <ul className="space-y-3">
                    {result.optimizationSuggestions.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                        <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {item}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Right Column: Scripts */}
      <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-[800px] lg:h-auto lg:min-h-[calc(100vh-200px)] sticky top-24">
        <div className="flex border-b border-slate-700 bg-slate-900/50 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('analysis')}
             className={`flex-1 py-3 px-4 whitespace-nowrap text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200'}`}
           >
             中英对照
           </button>
           <button 
             onClick={() => setActiveTab('script')}
             className={`flex-1 py-3 px-4 whitespace-nowrap text-sm font-medium transition-colors ${activeTab === 'script' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200'}`}
           >
             完整原文
           </button>
           <button 
             onClick={() => setActiveTab('optimized')}
             className={`flex-1 py-3 px-4 whitespace-nowrap text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'optimized' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-400 hover:text-purple-300'}`}
           >
             <Sparkles className="w-3.5 h-3.5" />
             优化文案
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative bg-slate-800">
           <button 
              onClick={copyScript}
              className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-all z-10 shadow-lg border border-slate-600"
              title="复制当前内容"
           >
              {copied ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
           </button>

           {activeTab === 'analysis' && (
              <div className="grid grid-cols-2 min-h-full divide-x divide-slate-700">
                  <div className="p-4 space-y-4">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">原文 ({result.detectedLanguage})</h4>
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-medium">{result.originalScript}</p>
                  </div>
                  <div className="p-4 space-y-4 bg-slate-900/30">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">中文翻译</h4>
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{result.chineseScript}</p>
                  </div>
              </div>
           )}

           {activeTab === 'script' && (
             <div className="p-6 space-y-8">
                <div>
                    <h4 className="text-sm font-bold text-blue-400 mb-3">原始文案 (Original Script)</h4>
                    <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed bg-slate-900/50 p-5 rounded-lg border border-slate-700">{result.originalScript}</p>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-3">中文翻译 (Chinese Translation)</h4>
                    <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed bg-slate-900/50 p-5 rounded-lg border border-slate-700">{result.chineseScript}</p>
                </div>
             </div>
           )}

           {activeTab === 'optimized' && (
              <div className="grid grid-cols-2 min-h-full divide-x divide-slate-700 bg-purple-500/5">
                  <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400">优化后原文</h4>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed font-medium">{result.optimizedScript?.original || "暂无优化文案"}</p>
                  </div>
                  <div className="p-4 space-y-4 bg-slate-900/30">
                      <div className="flex items-center gap-2 mb-2">
                         <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400">优化后中文</h4>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{result.optimizedScript?.cn || "暂无翻译"}</p>
                  </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
