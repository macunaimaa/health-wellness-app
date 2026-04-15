interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  labels: Record<number, string>;
  color?: string;
}

export function EnergySlider({ value, onChange, labels, color = 'emerald' }: SliderProps) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500 border-emerald-600 text-white',
    amber: 'bg-amber-500 border-amber-600 text-white',
    blue: 'bg-blue-500 border-blue-600 text-white',
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex h-12 flex-1 items-center justify-center rounded-xl border-2 text-lg font-bold transition-all duration-200 ${
              value === level
                ? colorMap[color] || colorMap.emerald
                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-center text-sm font-medium text-slate-600">{labels[value]}</p>
      )}
    </div>
  );
}

export function StressSlider({ value, onChange }: Omit<SliderProps, 'labels'>) {
  const labels: Record<number, string> = {
    1: 'Muito baixo',
    2: 'Baixo',
    3: 'Moderado',
    4: 'Alto',
    5: 'Muito alto',
  };

  return <EnergySlider value={value} onChange={onChange} labels={labels} color="amber" />;
}

export function SleepSlider({ value, onChange }: Omit<SliderProps, 'labels'>) {
  const labels: Record<number, string> = {
    1: 'Muito ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Boa',
    5: 'Muito boa',
  };

  return <EnergySlider value={value} onChange={onChange} labels={labels} color="blue" />;
}
