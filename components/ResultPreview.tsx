import React from 'react';
import { ProcessedPage } from '../types';
import { FileOutput, Loader2 } from 'lucide-react';

interface ResultPreviewProps {
  page: ProcessedPage | null;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ page }) => {
  if (!page) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50 border-dashed">
        <FileOutput className="w-12 h-12 mb-4 opacity-50" />
        <p>No page processed yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Source */}
      <div className="flex flex-col h-full">
        <span className="text-xs text-slate-400 mb-2 font-medium px-2">Original Source (Page {page.pageNumber})</span>
        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative group">
          <img 
            src={page.originalImageUrl} 
            alt="Original" 
            className="w-full h-full object-contain p-4"
          />
        </div>
      </div>

      {/* Target */}
      <div className="flex flex-col h-full">
        <span className="text-xs text-emerald-400 mb-2 font-medium px-2 flex justify-between items-center">
          <span>Translated Output (Markdown Preview)</span>
          {page.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
        </span>
        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative">
          {page.status === 'processing' ? (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                 <span className="text-sm text-blue-400 animate-pulse">Analyzing Layout & Translating...</span>
               </div>
             </div>
          ) : null}
          <div className="h-full overflow-y-auto p-6 custom-scrollbar bg-white text-slate-900 font-serif text-sm leading-relaxed whitespace-pre-wrap">
             {/* Using simple pre-wrap for markdown visualization for safety, in real app use react-markdown */}
             {page.translatedMarkdown}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPreview;
