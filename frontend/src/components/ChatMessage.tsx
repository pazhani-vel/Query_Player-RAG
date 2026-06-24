import React from 'react';
import type { Message } from '../types';
import { User, BookOpen } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Custom parser to format bold (**bold**) and bullet lists (- item)
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let currentText = line;
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      
      if (isBullet) {
        // Strip bullet token
        currentText = line.trim().substring(2);
      }

      // Parse bold text
      const elements: React.ReactNode[] = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIdx = 0;
      let keyCounter = 0;

      while ((match = boldRegex.exec(currentText)) !== null) {
        const preText = currentText.substring(lastIdx, match.index);
        const boldText = match[1];

        if (preText) {
          elements.push(<span key={keyCounter++}>{preText}</span>);
        }
        elements.push(
          <strong key={keyCounter++} className="font-bold text-zinc-900 dark:text-zinc-100">
            {boldText}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }

      if (lastIdx < currentText.length) {
        elements.push(<span key={keyCounter++}>{currentText.substring(lastIdx)}</span>);
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-zinc-700 dark:text-zinc-300 mt-1 mb-1 leading-relaxed">
            {elements}
          </li>
        );
      }

      // Render empty line as a spacing block
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-2 last:mb-0">
          {elements}
        </p>
      );
    });
  };

  return (
    <div className={`flex w-full space-x-3 md:space-x-4 py-4 px-2 first:pt-2 border-b border-zinc-100 dark:border-zinc-900/50 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Icon */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-250 shadow-sm">
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-550">
            {isUser ? 'You' : 'Query_Player AI'}
          </span>
          <span className="text-[9px] text-zinc-400 dark:text-zinc-550">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className={`p-3 md:p-3.5 rounded-2xl ${
          isUser
            ? 'bg-zinc-900 dark:bg-zinc-800 text-zinc-100 dark:text-zinc-100 rounded-tr-none'
            : 'bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-800/80 shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{message.content}</p>
          ) : (
            <div className="space-y-1">{renderContent(message.content)}</div>
          )}
        </div>

        {/* Display Sources below Bot Message */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 w-full space-y-1.5">
            <div className="flex items-center space-x-1.5 text-zinc-450 dark:text-zinc-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10.5px] font-semibold uppercase tracking-wider">
                Sources ({message.sources.length})
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {message.sources.map((source, sIdx) => (
                <div
                  key={sIdx}
                  className="flex flex-col text-left p-2 bg-white hover:bg-zinc-50 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/50 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl transition-all cursor-pointer group/card"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-zinc-750 dark:text-zinc-250 truncate max-w-[70%] group-hover/card:text-zinc-900 dark:group-hover/card:text-white">
                      {source.document}
                    </span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">
                      Page {source.page}
                    </span>
                  </div>
                  {source.text && (
                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-450 mt-1 line-clamp-2 leading-snug">
                      "{source.text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Icon */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-zinc-900 dark:border-zinc-800 bg-zinc-950 text-white shadow-sm">
          <User className="h-4.5 w-4.5" />
        </div>
      )}
    </div>
  );
};
export default ChatMessage;
