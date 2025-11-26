
import React, { useState, useRef, useEffect } from 'react';
import { VideoBrief, DualLanguageField } from '../types';
import { RefreshCw, Globe, Image as ImageIcon, Zap } from 'lucide-react';
import { syncTranslation } from '../services/geminiService';
import html2canvas from 'html2canvas';

interface BriefEditorProps {
  initialBrief: VideoBrief;
  detectedLanguage: string;
}

export const BriefEditor: React.FC<BriefEditorProps> = ({ initialBrief, detectedLanguage }) => {
  const [brief, setBrief] = useState<VideoBrief>(initialBrief);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Ref to store debounce timers for auto-sync
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if(initialBrief) setBrief(initialBrief);
  }, [initialBrief]);

  const handleCnChange = (section: keyof VideoBrief, value: string) => {
    if (section === 'targetLanguage') return;
    
    // 1. Update State immediately
    setBrief(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as DualLanguageField),
        cn: value
      }
    }));

    // 2. Clear existing timer for this section
    if (debounceTimers.current[section]) {
      clearTimeout(debounceTimers.current[section]);
    }

    // 3. Set new timer for auto-sync (1.5s debounce)
    debounceTimers.current[section] = setTimeout(() => {
      handleSync(section, value);
    }, 1500);
  };

  const handleTargetChange = (section: keyof VideoBrief, value: string) => {
    if (section === 'targetLanguage') return;
    setBrief(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as DualLanguageField),
        target: value
      }
    }));
  };

  // Modified to accept optional textOverride for the auto-sync feature
  const handleSync = async (section: keyof VideoBrief, textOverride?: string) => {
    if (section === 'targetLanguage') return;
    
    setSyncing(prev => ({ ...prev, [section]: true }));
    try {
      const field = brief[section] as DualLanguageField;
      // Use override if provided (from auto-sync), otherwise current state (from button click)
      const textToTranslate = textOverride !== undefined ? textOverride : field.cn;

      const translated = await syncTranslation(textToTranslate, brief.targetLanguage || detectedLanguage, section);
      
      setBrief(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as DualLanguageField),
          target: translated.trim()
        }
      }));
    } catch (e) {
      console.error("Sync failed", e);
      // Only alert on manual clicks to avoid annoying popups during typing
      if (!textOverride) {
        alert("同步翻译失败，请重试。");
      }
    } finally {
      setSyncing(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
        await new Promise(r => setTimeout(r, 100));
        
        const canvas = await html2canvas(exportRef.current, {
            backgroundColor: '#0f172a',
            scale: 2,
            logging: false,
            useCORS: true 
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `Brief_${brief.targetLanguage}_${new Date().toISOString().slice(0,10)}.png`;
        link.click();
    } catch (e) {
        console.error("Export failed", e);
        alert("图片生成失败。");
    } finally {
        setExporting(false);
    }
  };

  const renderSection = (title: string, sectionKey: keyof Omit<VideoBrief, 'targetLanguage'>) => {
    const field = brief[sectionKey] as DualLanguageField;
    const isSyncing = syncing[sectionKey as string];

    return (
      <div className="group bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all p-4">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{title}</h3>
            <div className="flex items-center gap-2">
                {isSyncing && (
                    <span className="text-xs text-blue-400 animate-pulse flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 自动同步中...
                    </span>
                )}
                <button
                    onClick={() => handleSync(sectionKey)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors disabled:opacity-50"
                    title="强制同步翻译"
                >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? '翻译中...' : '刷新翻译'}
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CN Input */}
            <div>
                <label className="block text-xs text-slate-500 mb-1">中文指令 (修改后自动同步翻译)</label>
                <textarea
                    value={field.cn}
                    onChange={(e) => handleCnChange(sectionKey, e.target.value)}
                    className="w-full h-60 bg-slate-900/50 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-colors leading-relaxed"
                    placeholder="请输入中文描述，建议每条指令换行..."
                />
            </div>
            
            {/* Target Input */}
            <div>
                <label className="block text-xs text-slate-500 mb-1">{brief.targetLanguage} (最终输出)</label>
                <textarea
                    value={field.target}
                    onChange={(e) => handleTargetChange(sectionKey, e.target.value)}
                    className="w-full h-60 bg-slate-900/30 border border-slate-700 border-dashed rounded-md p-3 text-sm text-emerald-100/90 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium leading-relaxed"
                    placeholder={`Translated ${brief.targetLanguage} text...`}
                />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-purple-400" />
             </div>
             <div>
                <h2 className="font-bold text-white">本地化翻拍 Brief</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">目标语言:</span>
                    <select 
                        value={brief.targetLanguage}
                        onChange={(e) => setBrief(prev => ({...prev, targetLanguage: e.target.value}))}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                    >
                        <option value={detectedLanguage}>{detectedLanguage} (Original)</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Russian">Russian</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Indonesian">Indonesian</option>
                        <option value="Thai">Thai</option>
                        <option value="Malay">Malay</option>
                    </select>
                </div>
             </div>
        </div>
        
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
        >
            {exporting ? <RefreshCw className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
            <span>导出 Brief 图片 (外籍使用)</span>
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid gap-6">
        {renderSection("1. 拍摄指导 (Shooting Guide)", "shootingGuide")}
        {renderSection("2. 口播文案参考 (Script Reference)", "scriptReference")}
        {renderSection("3. 产品卖点 (Selling Points)", "sellingPoints")}
      </div>

      {/* Hidden Export View (Target Language Only for Image Generation) */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
          <div ref={exportRef} className="w-[800px] bg-slate-900 text-slate-100 p-12 font-sans border border-slate-700">
             <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Content Replication Brief</h1>
                    <p className="text-slate-400 mt-2 text-lg">Target Language: <span className="text-emerald-400 font-semibold">{brief.targetLanguage}</span></p>
                 </div>
                 <div className="text-right">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                        <span className="text-slate-500 text-sm font-semibold uppercase">Source Ref</span>
                        <div className="text-white font-medium">{detectedLanguage}</div>
                    </div>
                 </div>
             </div>

             <div className="space-y-8">
                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-3">01. Shooting Guide</h2>
                    <p className="text-xl leading-relaxed font-medium text-slate-200 whitespace-pre-wrap">{brief.shootingGuide.target}</p>
                 </div>

                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-3">02. Script Reference</h2>
                    <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">{brief.scriptReference.target}</p>
                 </div>

                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h2 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-3">03. Selling Points / Value Prop</h2>
                    <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">{brief.sellingPoints.target}</p>
                 </div>
             </div>

             <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center text-slate-500 text-sm">
                <span>Generated by Global Video Deconstruct AI</span>
                <span>{new Date().toLocaleDateString()}</span>
             </div>
          </div>
      </div>
    </div>
  );
};
