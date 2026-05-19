import React, { memo } from 'react';
import { motion } from "motion/react";
import { Copy, Edit2, Check, RotateCcw, Square } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import LoadingAnimation from './LoadingAnimation';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  index: number;
  messagesCount: number;
  editingMessageId: string | null;
  editInput: string;
  setEditInput: (val: string) => void;
  setEditingMessageId: (id: string | null) => void;
  submitEdit: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
  handleEditMessage: (id: string, text: string) => void;
  isDarkMode: boolean;
  activeMode: 'normal' | 'love' | 'roast' | 'study' | null;
  onImageClick: (url: string) => void;
  onRetry: () => void;
  isMobile?: boolean;
  speed?: 'fast' | 'normal' | 'slow';
}

const MessageItem = memo(({ 
  message, 
  editingMessageId, 
  editInput, 
  setEditInput, 
  setEditingMessageId, 
  submitEdit, 
  copyToClipboard, 
  copiedId, 
  handleEditMessage,
  isDarkMode,
  activeMode,
  onImageClick,
  onRetry,
  isMobile = false,
  speed = 'normal'
}: MessageItemProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 w-full group message-final ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{ animationDelay: `${editingMessageId ? 0 : 0.1}s` }}
    >
      {/* Content Area */}
      <div className={`flex flex-col min-w-0 ${isUser ? 'max-w-[70%] items-end' : 'max-w-[90%] md:max-w-full items-start flex-1'}`}>

        {editingMessageId === message.id ? (
          <div className="w-full space-y-3 bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
            <textarea
              value={editInput}
              onChange={(e) => {
                setEditInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full bg-transparent text-[14px] font-light outline-none resize-none leading-relaxed"
              style={{ color: 'var(--text-main)' }}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setEditingMessageId(null)}
                className="px-3 py-1.5 text-[11px] font-medium text-[var(--text-main)] hover:underline transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-3 py-1.5 text-[11px] font-medium bg-[var(--text-main)] text-[var(--bg-main)] rounded hover:opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className={`w-full min-w-0 ${isUser ? 'text-right' : ''}`}>
            {/* Image display */}
            {message.imageUrls && message.imageUrls.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {message.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Uploaded"
                    className="max-w-[240px] max-h-[240px] rounded-lg border border-[var(--border-color)] cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick(url)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
            
            <div 
              className={`text-[16px] leading-[1.5] font-medium tracking-wide transition-colors duration-300 ${
                isUser 
                  ? 'bg-[var(--bg-message-user)] border border-[var(--border-color)] rounded-[20px] p-[6px_12px] inline-block w-fit shadow-sm' 
                  : 'pt-1'
              }`}
              style={{ color: isUser ? 'var(--text-user-bubble)' : 'var(--text-ai)' }}
            >
              {message.role === 'bot' ? (
                <div 
                  className={`max-w-none min-w-0 break-words prose prose-base ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}
                  style={{ color: 'var(--text-ai)' }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mt-0 mb-1 last:mb-0 leading-[1.5] font-medium" style={{ color: 'inherit' }} {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc mt-0 mb-1 ml-4 space-y-0.5" style={{ color: 'inherit' }} {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal mt-0 mb-1 ml-4 space-y-0.5" style={{ color: 'inherit' }} {...props} />,
                      li: ({node, ...props}) => <li className="pl-1 font-medium" style={{ color: 'inherit' }} {...props} />,
                      h1: ({node, ...props}) => <h1 className="font-semibold text-[20px] mt-3 mb-1" style={{ color: 'inherit' }} {...props} />,
                      h2: ({node, ...props}) => <h2 className="font-semibold text-[18px] mt-2 mb-1" style={{ color: 'inherit' }} {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-semibold text-[16px] mt-1 mb-1" style={{ color: 'inherit' }} {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" style={{ color: 'inherit' }} {...props} />,
                      em: ({node, ...props}) => <em className="italic" style={{ color: 'inherit' }} {...props} />,
                      code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const codeString = String(children).replace(/\n$/, '');
                        
                        return !inline && match ? (
                          <div className="my-2 overflow-hidden">
                            <CodeBlock language={match[1]} isDarkMode={isDarkMode} isStreaming={false}>{codeString}</CodeBlock>
                          </div>
                        ) : (
                          <code {...props} className="px-1.5 py-0.5 rounded bg-[var(--bg-sidebar)] border border-[var(--border-color)] text-[12px] font-mono" style={{ color: 'inherit' }}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                  <div className="flex justify-start items-center mt-1 mb-2">
                    {activeMode === 'love' && <span className="text-[10px]" style={{ color: isDarkMode ? '#ff69b4' : '#d02090' }}>♥</span>}
                    {activeMode === 'roast' && <span className="text-[10px]">🔥</span>}
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap font-medium" style={{ color: 'inherit' }}>{message.text}</p>
              )}
            </div>

            {/* Action Bar */}
            <div className={`mt-1 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {isUser ? (
                  <button onClick={() => handleEditMessage(message.id, message.text)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors" title="Edit">
                    <Edit2 size={13} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => copyToClipboard(message.text, message.id)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors" title="Copy">
                      {copiedId === message.id ? <Check size={13} className="text-[var(--text-main)]" /> : <Copy size={13} />}
                    </button>
                    <button onClick={onRetry} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors" title="Regenerate">
                      <RotateCcw size={13} />
                    </button>
                  </>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;
