import { Clock, ArrowRight, X, CheckCircle, RotateCcw } from 'lucide-react';
import { RECOMMENDATION_COLORS, RECOMMENDATION_ICONS, RECOMMENDATION_TITLES } from '../utils/constants';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSwap?: (id: string) => void;
}

export function RecommendationCard({
  recommendation,
  onAccept,
  onComplete,
  onDismiss,
  onSwap,
}: RecommendationCardProps) {
  const { id, type, title, summary, rationale, intensity, status } = recommendation;
  const colorClass = RECOMMENDATION_COLORS[type] || 'border-l-slate-400';
  const icon = RECOMMENDATION_ICONS[type] || '📋';
  const sectionTitle = RECOMMENDATION_TITLES[type] || 'Recomendação';

  const isCompleted = status === 'completed';
  const isDismissed = status === 'dismissed';

  if (isDismissed) return null;

  return (
    <div
      className={`rounded-xl border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'opacity-60' : ''
      } ${colorClass}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {sectionTitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {intensity && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                intensity === 'leve'
                  ? 'bg-green-100 text-green-700'
                  : intensity === 'moderado'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {intensity}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            <time dateTime={recommendation.createdAt}>
              {new Date(recommendation.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </span>
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{summary}</p>
      <p className="mt-1 text-xs italic text-slate-400">{rationale}</p>

      {isCompleted ? (
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600">
          <CheckCircle size={16} />
          Concluído
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'pending' && onAccept && (
            <button
              onClick={() => onAccept(id)}
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-emerald-700"
            >
              <ArrowRight size={14} />
              Aceitar
            </button>
          )}
          {status === 'accepted' && onComplete && (
            <button
              onClick={() => onComplete(id)}
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-emerald-700"
            >
              <CheckCircle size={14} />
              Concluído
            </button>
          )}
          {onSwap && (
            <button
              onClick={() => onSwap(id)}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-amber-300 hover:text-amber-600"
            >
              <RotateCcw size={14} />
              Trocar
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(id)}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-red-300 hover:text-red-600"
            >
              <X size={14} />
              Não serve
            </button>
          )}
        </div>
      )}
    </div>
  );
}
