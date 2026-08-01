import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxHeight = '88vh',
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(4,10,22,.88)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] animate-slide-up overflow-y-auto"
        style={{
          background: 'linear-gradient(170deg, #0e2040, #08121f)',
          border: '1px solid rgba(58,127,255,.28)',
          borderRadius: '24px 24px 0 0',
          padding: '26px 18px 44px',
          maxHeight,
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 42, height: 4,
            background: 'rgba(255,255,255,.18)',
            borderRadius: 2, margin: '0 auto 20px',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="teko text-2xl font-bold tracking-widest text-white flex items-center gap-2.5">
            {icon && <span>{icon}</span>}
            {title}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.18)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,40,40,.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
