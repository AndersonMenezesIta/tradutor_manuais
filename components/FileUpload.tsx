import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        disabled 
          ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed' 
          : 'border-blue-500/50 bg-slate-800 hover:bg-slate-800/80 hover:border-blue-400 cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
        id="pdf-upload"
        disabled={disabled}
      />
      <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
        <div className="bg-blue-500/10 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Drop Technical PDF here
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
          Supports native text, scanned pages, and mixed formats.
          Optimized for industrial manuals.
        </p>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Max 50MB</span>
          <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> PDF Only</span>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
