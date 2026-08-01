import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-bright/20 text-bright disabled:opacity-30 hover:bg-bright/10 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm text-xgray px-3 font-bold">
        Page {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-bright/20 text-bright disabled:opacity-30 hover:bg-bright/10 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
