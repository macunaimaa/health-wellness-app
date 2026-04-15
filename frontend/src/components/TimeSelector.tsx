import { TIME_OPTIONS } from '../utils/constants';

interface TimeSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function TimeSelector({ value, onChange }: TimeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_OPTIONS.map((time) => (
        <button
          key={time}
          type="button"
          onClick={() => onChange(time)}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${
            value === time
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          {time}min
        </button>
      ))}
    </div>
  );
}
