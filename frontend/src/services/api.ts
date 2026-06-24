import axios from 'axios';
import type { UploadResponse, QueryResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFiles = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export const queryRAG = async (question: string): Promise<QueryResponse> => {
  const response = await apiClient.post<QueryResponse>('/query', {
    question,
  });
  return response.data;
};
export default {
  uploadFiles,
  queryRAG,
};



// ─────────────────────────────────────────────────────────────────────────────
// DELETE /documents/:filename
// Removes one PDF from the server disk AND its chunks from ChromaDB.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteDocument = async (
  filename: string
): Promise<{ status: string; message: string }> => {
  const response = await apiClient.delete(
    `/documents/${encodeURIComponent(filename)}`
  );
  return response.data;
};
 
// ─────────────────────────────────────────────────────────────────────────────
// POST /daily-reset
// Call this on every page load/refresh.
// Wipes ALL PDFs from the upload folder and clears the ChromaDB collection
// so the next session starts completely fresh.
// ─────────────────────────────────────────────────────────────────────────────
export const dailyReset = async (): Promise<{
  status: string;
  message: string;
  deleted_files: string[];
}> => {
  const response = await apiClient.post("/daily-reset");
  return response.data;
};