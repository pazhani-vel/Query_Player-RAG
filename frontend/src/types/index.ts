export interface Document {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  file?: File;
  error?: string;
}

export interface Source {
  document: string;
  page: number;
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface UploadResponse {
  status: 'success' | 'error';
  documents: string[];
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
}
