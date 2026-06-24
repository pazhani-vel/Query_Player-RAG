import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFiles, queryRAG } from '../services/api';
import type { Document, Message } from '../types';

interface WorkspaceContextType {
  documents: Document[];
  chatHistory: Message[];
  isQuerying: boolean;
  activeDocument: Document | null;
  activePage: number;
  isViewerOpen: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  uploadDocuments: (files: File[]) => Promise<void>;
  removeDocument: (id: string) => void;
  clearWorkspace: () => void;
  askQuestion: (question: string) => Promise<void>;
  openPDFViewer: (docName: string, page?: number) => void;
  closePDFViewer: () => void;
  setActivePage: (page: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear active document if it gets removed
  useEffect(() => {
    if (activeDocument && !documents.some((doc) => doc.id === activeDocument.id)) {
      setActiveDocument(null);
      setIsViewerOpen(false);
    }
  }, [documents, activeDocument]);

  // React Query Mutation for Uploading Files
  const uploadMutation = useMutation({
    mutationFn: async ({ files, ids }: { files: File[]; ids: string[] }) => {
      return uploadFiles(files, (progress) => {
        setDocuments((prev) =>
          prev.map((doc) =>
            ids.includes(doc.id) ? { ...doc, progress } : doc
          )
        );
      });
    },
    onSuccess: (_, variables) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          variables.ids.includes(doc.id)
            ? { ...doc, status: 'success', progress: 100 }
            : doc
        )
      );
    },
    onError: (err: any, variables) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          variables.ids.includes(doc.id)
            ? { ...doc, status: 'error', progress: 0, error: err.message || 'Upload failed' }
            : doc
        )
      );
      setError(err.message || 'Failed to upload files. Please make sure backend is running.');
    },
  });

  // React Query Mutation for RAG Queries
  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      return queryRAG(question);
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    },
    onError: (err: any) => {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message || 'I failed to retrieve an answer. Please check your backend connection.'}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      setError(err.message || 'Query execution failed.');
    },
  });

  const uploadDocuments = async (files: File[]) => {
    setError(null);
    const validFiles = files.filter((file) => file.type === 'application/pdf');

    if (validFiles.length === 0) {
      setError('Only PDF documents are accepted.');
      return;
    }

    if (documents.length + validFiles.length > 10) {
      setError('Workspace limit exceeded. You can upload up to 10 PDFs.');
      return;
    }

    const newDocs: Document[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      file,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    const ids = newDocs.map((d) => d.id);
    uploadMutation.mutate({ files: validFiles, ids });
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const clearWorkspace = () => {
    setDocuments([]);
    setChatHistory([]);
    setActiveDocument(null);
    setIsViewerOpen(false);
    setError(null);
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    queryMutation.mutate(question);
  };

  const openPDFViewer = (docName: string, page: number = 1) => {
    const doc = documents.find(
      (d) => d.name.toLowerCase() === docName.toLowerCase() && d.status === 'success'
    );
    if (doc) {
      setActiveDocument(doc);
      setActivePage(page);
      setIsViewerOpen(true);
    } else {
      setError(`Document "${docName}" is not available for preview. Make sure it is fully uploaded.`);
    }
  };

  const closePDFViewer = () => {
    setIsViewerOpen(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        documents,
        chatHistory,
        isQuerying: queryMutation.isPending,
        activeDocument,
        activePage,
        isViewerOpen,
        error,
        setError,
        uploadDocuments,
        removeDocument,
        clearWorkspace,
        askQuestion,
        openPDFViewer,
        closePDFViewer,
        setActivePage,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
