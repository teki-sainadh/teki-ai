import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  language: string;
  isDarkMode: boolean;
  isStreaming?: boolean;
}

const CodeBlock = ({ children, language, isDarkMode, isStreaming }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(children.replace(/\|$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageInfo = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'java') return { name: 'Java', color: '#f97316' };
    if (l === 'python') return { name: 'Python', color: '#3b82f6' };
    if (l === 'c++' || l === 'cpp') return { name: 'C++', color: '#a855f7' };
    if (l === 'javascript' || l === 'js') return { name: 'JavaScript', color: '#eab308' };
    return { name: lang.charAt(0).toUpperCase() + lang.slice(1), color: '#6b7280' };
  };

  const { name: displayLanguage } = getLanguageInfo(language);

  return (
    <div className="group transition-colors duration-300 w-full overflow-hidden px-0 py-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2 opacity-60">
        <div className="flex items-center gap-1.5">
          <span 
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-main)' }}
          >
            {displayLanguage}
          </span>
        </div>
        <button
          onClick={onCopy}
          className="p-1 px-1.5 flex items-center gap-1.5 transition-colors hover:opacity-100"
          style={{ color: 'var(--text-main)' }}
          title="Copy code"
        >
          {copied ? <Check size={10} className="text-[var(--text-main)]" /> : <Copy size={10} />}
          <span className="text-[10px] uppercase font-bold tracking-tight">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      
      {/* Code Area */}
      <div className="relative overflow-x-auto w-full no-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? oneDark : oneLight}
          customStyle={{
            background: 'transparent',
            padding: '0',
            fontSize: '13px',
            margin: '4px 0',
            borderRadius: 0,
            border: 'none',
          }}
          codeTagProps={{
            style: {
              background: 'transparent',
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
