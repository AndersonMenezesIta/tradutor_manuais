export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ProcessedPage {
  pageNumber: number;
  originalImageUrl: string;
  translatedMarkdown: string; // Gemini returns markdown to preserve structure
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface TranslationConfig {
  sourceLanguage: string;
  targetLanguage: string;
  domain: string; // e.g., 'Mechanical', 'Electrical', 'General'
}

export interface FileData {
  file: File;
  name: string;
  totalPages: number;
}
