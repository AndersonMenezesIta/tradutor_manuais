import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

interface LogConsoleProps {
  logs: LogEntry[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
      default: return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-300';
      case 'warning': return 'text-amber-300';
      case 'error': return 'text-red-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-mono text-sm">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <Terminal className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Log</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1.5"
      >
        {logs.length === 0 && <span className="text-slate-600 italic">Waiting for process...</span>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start animate-fade-in">
            <span className="text-slate-600 text-xs shrink-0 pt-0.5">{log.timestamp}</span>
            <div className={`flex gap-2 items-center ${getColor(log.type)}`}>
              {getIcon(log.type)}
              <span>{log.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogConsole;
