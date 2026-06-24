import React, { useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { SkeletonLoader, TypingLoader } from './LoadingSpinner';
import { Sparkles, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const {
    documents,
    chatHistory,
    isQuerying,
    askQuestion,
    error,
    setError,
  } = useWorkspace();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const hasDocuments = documents.some((d) => d.status === 'success');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isQuerying]);

  const handleSend = (text: string) => {
    askQuestion(text);
  };

  // Quick suggestions for the user
  const suggestions = [
    'Provide a brief summary of all uploaded documents.',
    'What are the key findings or core points?',
    'What methodologies or concepts are introduced?',
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-150 dark:border-zinc-900/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Query_Player Workspace Chat
          </h2>
        </div>
        {hasDocuments && (
          <span className="text-[10.5px] font-semibold text-zinc-450 dark:text-zinc-500">
            Connected: {documents.filter(d => d.status === 'success').length} PDF(s)
          </span>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center justify-between px-5 py-2.5 bg-red-50 dark:bg-red-955/15 border-b border-red-100 dark:border-red-900/35 text-red-800 dark:text-red-300 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <ShieldAlert className="w-4 h-4 text-red-550 shrink-0" />
            <span className="text-[11px] font-semibold truncate leading-none">
              {error}
            </span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 dark:hover:text-red-200 transition-colors uppercase ml-2 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {!hasDocuments ? (
          /* Empty state - No documents uploaded */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto p-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm mb-4">
              <BookOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-550" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Welcome to Query_Player AI
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1 leading-relaxed">
              Upload your reference PDFs in the left sidebar to initialize the Retrieval-Augmented Generation (RAG) workspace.
            </p>
          </div>
        ) : chatHistory.length === 0 ? (
          /* Workspace loaded but no chats started */
          <div className="flex flex-col items-center justify-center min-h-full max-w-lg mx-auto p-6 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm mb-1">
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Workspace is ready!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                Your sources are uploaded and indexed. Ask complex questions to retrieve contextual answers backed by citation page sources.
              </p>
            </div>

            {/* suggestion prompts */}
            <div className="w-full space-y-2">
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider pl-1">
                Suggested Prompts
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="flex items-center justify-between w-full p-3 text-left text-xs text-zinc-700 hover:text-zinc-950 dark:text-zinc-350 dark:hover:text-white bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60 border border-zinc-150 hover:border-zinc-250 dark:border-zinc-800/80 dark:hover:border-zinc-700 rounded-xl transition-all cursor-pointer group"
                  >
                    <span className="truncate pr-4 font-medium">{suggestion}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-650 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Actual chats */
          <div className="space-y-1">
            {chatHistory.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* AI querying indicator */}
            {isQuerying && (
              <div className="flex w-full space-x-3 md:space-x-4 py-4 px-2">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 shadow-sm animate-pulse">
                  <Sparkles className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <div className="flex flex-col w-[85%] md:w-[75%] space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">
                      Query_Player AI
                    </span>
                    <TypingLoader />
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl rounded-tl-none border border-zinc-150 dark:border-zinc-850/80 shadow-sm w-full">
                    <SkeletonLoader />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input panel */}
      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-900/60 shrink-0">
        <MessageInput onSend={handleSend} disabled={!hasDocuments || isQuerying} />
      </div>
    </div>
  );
};
export default ChatContainer;
