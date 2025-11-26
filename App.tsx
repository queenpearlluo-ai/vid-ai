import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { BriefEditor } from './components/BriefEditor';
import { AppStep, AnalysisResult } from './types';
import { analyzeVideo } from './services/geminiService';
import { Sparkles, Video, FileText, ChevronRight, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [platform, setPlatform] = useState<string>('TikTok');

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    // Create object URL for preview
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    
    setStep('analyzing');
    setLoadingMsg("正在上传视频到 Gemini...");

    try {
      // Simulate progress stages for better UX
      setTimeout(() => setLoadingMsg("正在转录音频并识别语言..."), 2000);
      setTimeout(() => setLoadingMsg("正在拆解视频结构并提取亮点..."), 5000);
      setTimeout(() => setLoadingMsg("正在生成本地化翻拍脚本..."), 8000);

      const analysisData = await analyzeVideo(selectedFile, platform);
      setResult(analysisData);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("分析失败: " + (error instanceof Error ? error.message : "未知错误"));
      setStep('upload');
      setFile(null);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
    }
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
         <Sparkles className="absolute inset-0 m-auto text-blue-400 w-8 h-8 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
         <h2 className="text-xl font-bold text-white">正在深度拆解视频</h2>
         <p className="text-slate-400 text-sm animate-pulse">{loadingMsg}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Global Deconstruct AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
             <span className={step === 'upload' ? 'text-blue-400' : ''}>上传视频</span>
             <ChevronRight className="w-4 h-4" />
             <span className={step === 'analyzing' ? 'text-blue-400' : ''}>AI 分析</span>
             <ChevronRight className="w-4 h-4" />
             <span className={step === 'result' ? 'text-blue-400' : ''}>拆解结果</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
             <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                   全球爆款视频 · 智能拆解与复刻
                </h1>
                <p className="text-lg text-slate-400">
                   一键分析 TikTok/IG/YouTube 爆款视频，提取脚本、翻译中文、拆解结构，并生成本地化复刻 Brief。
                </p>
             </div>

             <div className="w-full max-w-md bg-slate-800 p-1 rounded-lg flex text-sm font-medium mb-4">
                {['TikTok', 'Instagram', 'YouTube'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex-1 py-2 rounded-md transition-all ${platform === p ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {p}
                  </button>
                ))}
             </div>

             <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {step === 'analyzing' && renderLoading()}

        {step === 'result' && result && (
          <div className="space-y-12 animate-fade-in-up">
            <section>
              <div className="flex items-center gap-2 mb-6">
                 <Layout className="w-6 h-6 text-blue-400" />
                 <h2 className="text-2xl font-bold text-white">视频深度拆解</h2>
              </div>
              <AnalysisView result={result} videoUrl={videoUrl} />
            </section>

            <section className="pb-12 border-t border-slate-800 pt-12">
               <div className="flex items-center gap-2 mb-6">
                 <FileText className="w-6 h-6 text-emerald-400" />
                 <h2 className="text-2xl font-bold text-white">复刻脚本 (Brief)</h2>
              </div>
              <BriefEditor 
                initialBrief={result.initialBrief} 
                detectedLanguage={result.detectedLanguage} 
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;