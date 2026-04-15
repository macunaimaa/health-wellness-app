import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { EnergySlider } from '../components/Sliders';
import { StressSlider } from '../components/Sliders';
import { SleepSlider } from '../components/Sliders';
import { ContextSelector } from '../components/ContextSelector';
import { TimeSelector } from '../components/TimeSelector';
import { ENERGY_LABELS, STRESS_LABELS, SLEEP_LABELS, EQUIPMENT_OPTIONS } from '../utils/constants';
import { useCreateCheckin } from '../hooks/useCheckin';
import type { DayContext } from '../types';

export function CheckinPage() {
  const [energyLevel, setEnergyLevel] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [availableTime, setAvailableTime] = useState<number | null>(null);
  const [dayContext, setDayContext] = useState<DayContext | ''>('');
  const [equipmentAccess, setEquipmentAccess] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const createCheckin = useCreateCheckin();
  const navigate = useNavigate();

  const toggleEquipment = (value: string) => {
    if (value === 'nenhum') {
      setEquipmentAccess(equipmentAccess.includes('nenhum') ? [] : ['nenhum']);
      return;
    }
    setEquipmentAccess((prev) => {
      const filtered = prev.filter((e) => e !== 'nenhum');
      if (filtered.includes(value)) {
        return filtered.filter((e) => e !== value);
      }
      return [...filtered, value];
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!energyLevel || !stressLevel || !sleepQuality || !availableTime || !dayContext) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createCheckin.mutateAsync({
        energyLevel,
        stressLevel,
        sleepQuality,
        availableTime,
        dayContext,
        equipmentAccess,
        notes: notes || undefined,
      });
      navigate('/plan');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao enviar check-in. Tente novamente.';
      setError(message);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Check-in do dia</h1>
        <p className="mt-1 text-sm text-slate-500">
          Como você está se sentindo hoje? Responda rápido.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nível de energia
          </label>
          <EnergySlider value={energyLevel} onChange={setEnergyLevel} labels={ENERGY_LABELS} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nível de estresse
          </label>
          <StressSlider value={stressLevel} onChange={setStressLevel} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Qualidade do sono
          </label>
          <SleepSlider value={sleepQuality} onChange={setSleepQuality} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tempo disponível
          </label>
          <TimeSelector value={availableTime} onChange={setAvailableTime} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Onde você está?
          </label>
          <ContextSelector value={dayContext} onChange={(v) => setDayContext(v)} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Equipamentos disponíveis
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleEquipment(opt.value)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  equipmentAccess.includes(opt.value)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Observações{' '}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma coisa importante para mencionar..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={createCheckin.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
        >
          {createCheckin.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Sparkles size={20} />
              Gerar meu plano
            </>
          )}
        </button>
      </form>
    </div>
  );
}
