import { Check, X, RotateCcw, Flag } from 'lucide-react';

interface FeedbackButtonsProps {
  onAccept?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
  onSwap?: () => void;
  status?: string;
  loading?: boolean;
}

export function FeedbackButtons({ onAccept, onComplete, onDismiss, onSwap, status, loading }: FeedbackButtonsProps) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
        <Check size={16} /> Concluído
      </span>
    );
  }

  if (status === 'dismissed') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-400">
        <X size={16} /> Ignorado
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'pending' && onAccept && (
        <button
          onClick={onAccept}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check size={14} /> Aceitar
        </button>
      )}
      {status === 'accepted' && onComplete && (
        <button
          onClick={onComplete}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
        >
          <Flag size={14} /> Concluído
        </button>
      )}
      {onSwap && (
        <button
          onClick={onSwap}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-amber-300 hover:text-amber-600 disabled:opacity-50"
        >
          <RotateCcw size={14} /> Trocar
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
        >
          <X size={14} /> Não serve
        </button>
      )}
    </div>
  );
}
