import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  value: string;
  label?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

export default function CopyButton({ value, label = 'Copy', className = '', variant = 'button' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={`p-1.5 rounded-lg transition-colors ${
          copied
            ? 'bg-green-500/20 text-xgreen border border-xgreen/30'
            : 'bg-bright/10 text-bright border border-bright/25 hover:bg-bright/20'
        } ${className}`}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`transition-all text-xs font-bold tracking-wide px-3 py-1.5 rounded-full border whitespace-nowrap ${
        copied
          ? 'bg-xgreen/18 border-xgreen/30 text-xgreen'
          : 'bg-bright/16 border-bright/35 text-bright hover:bg-bright/32'
      } ${className}`}
    >
      {copied ? '✓ Done!' : `📋 ${label}`}
    </button>
  );
}
