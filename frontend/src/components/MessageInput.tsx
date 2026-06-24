import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled,
  placeholder = 'Ask a question about your documents...',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow height of textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-100 rounded-2xl p-1.5 pr-2 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent py-2 pl-3.5 pr-12 text-sm text-zinc-900 dark:text-zinc-150 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none max-h-[180px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '36px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={`absolute right-3 bottom-2.5 p-2 rounded-xl text-white transition-all cursor-pointer ${
            input.trim() && !disabled
              ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-350 dark:text-zinc-650 cursor-not-allowed'
          }`}
        >
          <ArrowUp className="w-4.5 h-4.5" />
        </button>
      </div>
      <div className="flex justify-between items-center px-3.5 mt-1.5">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-550">
          Press <kbd className="font-sans px-1 py-0.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 rounded">Enter</kbd> to send, <kbd className="font-sans px-1 py-0.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 rounded">Shift+Enter</kbd> for line break
        </span>
      </div>
    </form>
  );
};
export default MessageInput;
