interface EmojiLevelProps {
  value: number;
  onChange: (value: number) => void;
  config: { emoji: string; label: string; color: string }[];
}

function EmojiLevel({ value, onChange, config }: EmojiLevelProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {config.map((item, i) => {
          const level = i + 1;
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-3 transition-all duration-200 active:scale-95 ${
                isSelected
                  ? `${item.color} shadow-md scale-105`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-2xl transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
                {item.emoji}
              </span>
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <p className="text-center text-sm font-semibold text-slate-600 transition-all duration-200">
          {config[value - 1].label}
        </p>
      )}
    </div>
  );
}

const ENERGY_CONFIG = [
  { emoji: '😴', label: 'Sem energia', color: 'border-slate-400 bg-slate-50 text-slate-600' },
  { emoji: '😕', label: 'Energia baixa', color: 'border-orange-400 bg-orange-50 text-orange-600' },
  { emoji: '😐', label: 'Energia ok', color: 'border-amber-400 bg-amber-50 text-amber-600' },
  { emoji: '😊', label: 'Bem disposto', color: 'border-emerald-400 bg-emerald-50 text-emerald-600' },
  { emoji: '⚡', label: 'Cheio de energia!', color: 'border-emerald-600 bg-emerald-100 text-emerald-700' },
];

const STRESS_CONFIG = [
  { emoji: '😌', label: 'Muito tranquilo', color: 'border-emerald-400 bg-emerald-50 text-emerald-600' },
  { emoji: '🙂', label: 'Tranquilo', color: 'border-blue-400 bg-blue-50 text-blue-600' },
  { emoji: '😐', label: 'Estresse moderado', color: 'border-amber-400 bg-amber-50 text-amber-600' },
  { emoji: '😰', label: 'Bem estressado', color: 'border-orange-400 bg-orange-50 text-orange-600' },
  { emoji: '🤯', label: 'Muito estressado', color: 'border-red-500 bg-red-50 text-red-600' },
];

const SLEEP_CONFIG = [
  { emoji: '😫', label: 'Noite péssima', color: 'border-red-400 bg-red-50 text-red-600' },
  { emoji: '😕', label: 'Dormi mal', color: 'border-orange-400 bg-orange-50 text-orange-600' },
  { emoji: '😐', label: 'Sono regular', color: 'border-amber-400 bg-amber-50 text-amber-600' },
  { emoji: '😌', label: 'Dormi bem', color: 'border-blue-400 bg-blue-50 text-blue-600' },
  { emoji: '✨', label: 'Sono excelente!', color: 'border-purple-400 bg-purple-50 text-purple-600' },
];

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  labels?: Record<number, string>;
  color?: string;
}

export function EnergySlider({ value, onChange }: SliderProps) {
  return <EmojiLevel value={value} onChange={onChange} config={ENERGY_CONFIG} />;
}

export function StressSlider({ value, onChange }: Omit<SliderProps, 'labels'>) {
  return <EmojiLevel value={value} onChange={onChange} config={STRESS_CONFIG} />;
}

export function SleepSlider({ value, onChange }: Omit<SliderProps, 'labels'>) {
  return <EmojiLevel value={value} onChange={onChange} config={SLEEP_CONFIG} />;
}
