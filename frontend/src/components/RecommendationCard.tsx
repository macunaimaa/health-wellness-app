import { useState } from 'react';
import { CheckCircle, RotateCcw, X, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSwap?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { gradient: string; lightBg: string; iconBg: string; badge: string; label: string; icon: string }> = {
  meal: {
    gradient: 'from-green-500 to-emerald-600',
    lightBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Alimentação',
    icon: '🍽️',
  },
  workout: {
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Treino',
    icon: '💪',
  },
  recovery: {
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    label: 'Recuperação',
    icon: '🧘',
  },
  hydration: {
    gradient: 'from-cyan-500 to-blue-500',
    lightBg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    badge: 'bg-cyan-100 text-cyan-700',
    label: 'Hidratação',
    icon: '💧',
  },
};

const INTENSITY_CONFIG: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  leve: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  moderado: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
  intenso: 'bg-red-100 text-red-700',
};

const INTENSITY_LABEL: Record<string, string> = {
  low: 'Leve', leve: 'Leve',
  moderate: 'Moderado', moderado: 'Moderado',
  high: 'Intenso', intenso: 'Intenso',
};

export function RecommendationCard({
  recommendation,
  onAccept,
  onComplete,
  onDismiss,
  onSwap,
}: RecommendationCardProps) {
  const [showRationale, setShowRationale] = useState(false);
  const { id, type, title, summary, rationale, intensity, status } = recommendation;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.meal;
  const isCompleted = status === 'completed';

  if (status === 'dismissed') return null;

  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 ${isCompleted ? 'opacity-70' : 'hover:shadow-md'}`}>
      {/* Colored header strip */}
      <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {intensity && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                {INTENSITY_LABEL[intensity] || intensity}
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                <CheckCircle size={10} />
                Feito
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-slate-800 leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{summary}</p>

        {/* Expandable rationale */}
        {rationale && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowRationale(!showRationale)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showRationale ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showRationale ? 'Menos detalhes' : 'Por que essa recomendação?'}
            </button>
            {showRationale && (
              <div className={`mt-2 rounded-xl ${config.lightBg} p-3`}>
                <p className="text-xs leading-relaxed text-slate-600 italic">{rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isCompleted && (
          <div className="mt-4 flex flex-wrap gap-2">
            {status === 'pending' && onAccept && (
              <button
                onClick={() => onAccept(id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95`}
              >
                <ArrowRight size={14} />
                Aceitar
              </button>
            )}
            {status === 'accepted' && onComplete && (
              <button
                onClick={() => onComplete(id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-95"
              >
                <CheckCircle size={14} />
                Concluí!
              </button>
            )}
            <button
              onClick={() => onSwap?.(id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition-all duration-200 hover:border-amber-300 hover:text-amber-600 active:scale-95"
            >
              <RotateCcw size={13} />
              Trocar
            </button>
            <button
              onClick={() => onDismiss?.(id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition-all duration-200 hover:border-red-300 hover:text-red-500 active:scale-95"
            >
              <X size={13} />
              Ignorar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
