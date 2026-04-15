import { CONTEXT_LABELS } from '../utils/constants';
import type { DayContext } from '../types';

interface ContextSelectorProps {
  value: DayContext | '';
  onChange: (value: DayContext) => void;
}

export function ContextSelector({ value, onChange }: ContextSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.entries(CONTEXT_LABELS) as [DayContext, typeof CONTEXT_LABELS[DayContext]][]).map(
        ([key, { label, emoji }]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all duration-200 ${
              value === key
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        )
      )}
    </div>
  );
}
