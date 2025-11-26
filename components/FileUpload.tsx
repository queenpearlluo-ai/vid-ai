import React, { useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { MAX_VIDEO_SIZE_MB } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndPass = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("请上传有效的视频文件。");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(`文件大小超过 ${MAX_VIDEO_SIZE_MB}MB 限制。`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer
          ${dragActive 
            ? "border-blue-500 bg-blue-500/10" 
            : "border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-800"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="video/*"
        />
        
        <div className="flex flex-col items-center text-center p-6 space-y-4">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
            <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium text-slate-200">
              拖拽视频到这里 或 <span className="text-blue-400 hover:text-blue-300">点击上传</span>
            </p>
            <p className="text-sm text-slate-500">
              支持 MP4, MOV, WebM 等 (最大 {MAX_VIDEO_SIZE_MB}MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};