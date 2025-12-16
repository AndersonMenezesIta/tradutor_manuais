import React, { useState, useCallback, useEffect } from 'react';
import { BookOpen, Settings, Play, Download, StopCircle, Check } from 'lucide-react';
import { AppStatus, FileData, LogEntry, ProcessedPage, TranslationConfig } from './types';
import { SUPPORTED_LANGUAGES, TECHNICAL_DOMAINS, MOCK_LOGS_INIT } from './constants';
import { loadPDF, renderPageToImage, generateId } from './utils/pdfHelpers';
import { translateTechnicalPage } from './services/geminiService';
import FileUpload from './components/FileUpload';
import LogConsole from './components/LogConsole';
import ResultPreview from './components/ResultPreview';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0); // Index for display
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS_INIT);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  
  // Config State
  const [config, setConfig] = useState<TranslationConfig>({
    sourceLanguage: 'Auto-detect',
    targetLanguage: 'pt-BR',
    domain: 'General Technical'
  });

  // Logging Helper
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: generateId(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

  // File Selection Handler
  const handleFileSelect = async (file: File) => {
    try {
      setStatus(AppStatus.ANALYZING);
      addLog(`Loading file: ${file.name}...`, 'info');
      
      const doc = await loadPDF(file);
      
      setPdfDoc(doc);
      setFileData({
        file,
        name: file.name,
        totalPages: doc.numPages
      });
      
      addLog(`File loaded successfully. Total pages: ${doc.numPages}`, 'success');
      setStatus(AppStatus.IDLE); // Ready to start
    } catch (error) {
      addLog(`Error loading PDF: ${(error as Error).message}`, 'error');
      setStatus(AppStatus.ERROR);
    }
  };

  // Processing Loop
  const startTranslation = async () => {
    if (!pdfDoc || !fileData) return;
    
    setStatus(AppStatus.PROCESSING);
    addLog(`Starting batch translation for ${fileData.name}`, 'info');
    addLog(`Domain: ${config.domain} | Target: ${config.targetLanguage}`, 'info');

    // Initialize pages array with placeholders
    const initialPages: ProcessedPage[] = [];
    setProcessedPages([]);

    // We process page by page sequentially to not hit API limits instantly and show progress
    for (let i = 1; i <= fileData.totalPages; i++) {
      setCurrentPageIndex(i - 1); // View the current page being processed
      addLog(`Processing Page ${i}/${fileData.totalPages}...`, 'info');
      
      try {
        // 1. Render Page to Image (Simulating scanning/OCR input)
        addLog(`Page ${i}: Rasterizing for OCR...`, 'info');
        const imageUrl = await renderPageToImage(pdfDoc, i);
        
        // Update state to show image while waiting for translation
        const newPage: ProcessedPage = {
          pageNumber: i,
          originalImageUrl: imageUrl,
          translatedMarkdown: '',
          status: 'processing'
        };
        
        setProcessedPages(prev => {
          const updated = [...prev];
          updated[i - 1] = newPage;
          return updated;
        });

        // 2. Call Gemini for Translation
        addLog(`Page ${i}: AI Analyzing layout & Translating...`, 'info');
        const translatedText = await translateTechnicalPage(imageUrl, config);
        
        // 3. Update with result
        setProcessedPages(prev => {
          const updated = [...prev];
          updated[i - 1] = {
            ...updated[i - 1],
            translatedMarkdown: translatedText,
            status: 'completed'
          };
          return updated;
        });
        
        addLog(`Page ${i}: Completed.`, 'success');

        // Rate limiting delay to be kind to the API (2 seconds between pages)
        if (i < fileData.totalPages) {
           await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        addLog(`Error on Page ${i}: ${(error as Error).message}`, 'error');
         setProcessedPages(prev => {
          const updated = [...prev];
          if (updated[i-1]) updated[i-1].status = 'error';
          return updated;
        });
      }
    }

    setStatus(AppStatus.COMPLETED);
    addLog(`Translation job completed successfully.`, 'success');
  };

  // Mock Download
  const handleDownload = () => {
    // In a real app, this would use jsPDF to generate a PDF from the markdown/text
    const blob = new Blob(
      [processedPages.map(p => `# Page ${p.pageNumber}\n\n${p.translatedMarkdown}`).join('\n\n---\n\n')],
      { type: 'text/markdown' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRANSLATED_${fileData?.name.replace('.pdf', '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog('Downloaded translated content as Markdown.', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">TechTrans <span className="text-blue-500">Pro</span></h1>
          <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">v2.5.0</span>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-4">
           {status === AppStatus.PROCESSING && (
             <div className="flex items-center gap-2 text-sm text-blue-400 animate-pulse">
               <div className="w-2 h-2 rounded-full bg-blue-400"></div>
               Processing {fileData?.name}
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* 1. Upload Section */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Input Source</h2>
              <FileUpload 
                onFileSelect={handleFileSelect} 
                disabled={status === AppStatus.PROCESSING} 
              />
              {fileData && (
                 <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                   <Check className="w-4 h-4" />
                   {fileData.name} ({fileData.totalPages} pgs)
                 </div>
              )}
            </div>

            {/* 2. Configuration */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings className="w-3 h-3" /> Configuration
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Language</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={config.targetLanguage}
                    onChange={(e) => setConfig({...config, targetLanguage: e.target.value})}
                    disabled={status === AppStatus.PROCESSING}
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Technical Domain</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={config.domain}
                    onChange={(e) => setConfig({...config, domain: e.target.value})}
                    disabled={status === AppStatus.PROCESSING}
                  >
                    {TECHNICAL_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Actions */}
            <div className="pt-4 border-t border-slate-800">
               {status === AppStatus.IDLE || status === AppStatus.COMPLETED ? (
                 <button
                   onClick={startTranslation}
                   disabled={!fileData}
                   className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                 >
                   <Play className="w-4 h-4 fill-current" />
                   Start Translation
                 </button>
               ) : (
                 <button
                   disabled
                   className="w-full bg-slate-700 text-slate-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2 cursor-wait"
                 >
                   <LoaderSpin />
                   Processing...
                 </button>
               )}
            </div>
            
            {status === AppStatus.COMPLETED && (
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Result
              </button>
            )}

          </div>
        </aside>

        {/* Center Stage: Preview & Logs */}
        <main className="flex-1 flex flex-col bg-slate-950 min-w-0">
          
          {/* Top: Progress Bar */}
          {status !== AppStatus.IDLE && fileData && (
             <div className="h-1 bg-slate-800 w-full">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${((currentPageIndex + (processedPages[currentPageIndex]?.status === 'completed' ? 1 : 0)) / fileData.totalPages) * 100}%` }}
                />
             </div>
          )}

          {/* Visualization Area */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
            
            {/* Split View */}
            <div className="flex-1 min-h-0 bg-slate-900/30 rounded-xl border border-slate-800 p-2">
               <ResultPreview page={processedPages[currentPageIndex] || null} />
            </div>

            {/* Pagination Controls (if processed) */}
            {processedPages.length > 0 && (
              <div className="flex justify-center items-center gap-4 py-2">
                <button 
                  onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                  disabled={currentPageIndex === 0}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 text-xs"
                >
                  Previous Page
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  Page {currentPageIndex + 1} of {fileData?.totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPageIndex(p => Math.min((fileData?.totalPages || 1) - 1, p + 1))}
                  disabled={currentPageIndex === (fileData?.totalPages || 1) - 1}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 text-xs"
                >
                  Next Page
                </button>
              </div>
            )}

            {/* Bottom: Console */}
            <div className="h-48 shrink-0">
               <LogConsole logs={logs} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Mini Spinner Component
const LoaderSpin = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default App;