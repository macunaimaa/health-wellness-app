import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, MapPin, Clock, Dumbbell } from 'lucide-react';
import { EnergySlider, StressSlider, SleepSlider } from '../components/Sliders';
import { EQUIPMENT_OPTIONS, CONTEXT_LABELS } from '../utils/constants';
import { useCreateCheckin } from '../hooks/useCheckin';
import type { DayContext } from '../types';

const STEPS = [
  { id: 1, title: 'Como você está?', subtitle: 'Avalie seu estado agora' },
  { id: 2, title: 'Sua agenda hoje', subtitle: 'Onde e quanto tempo você tem' },
  { id: 3, title: 'Equipamentos', subtitle: 'O que você tem à disposição' },
];

const TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '+1 hora' },
];

export function CheckinPage() {
  const [step, setStep] = useState(1);
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
      return filtered.includes(value) ? filtered.filter((e) => e !== value) : [...filtered, value];
    });
  };

  const canGoNext = () => {
    if (step === 1) return energyLevel > 0 && stressLevel > 0 && sleepQuality > 0;
    if (step === 2) return !!dayContext && !!availableTime;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCheckin.mutateAsync({
        energyLevel,
        stressLevel,
        sleepQuality,
        availableTime: availableTime!,
        dayContext: dayContext as DayContext,
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

  const contextEntries = Object.entries(CONTEXT_LABELS);

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{STEPS[step - 1].title}</h1>
            <p className="text-sm text-slate-500">{STEPS[step - 1].subtitle}</p>
          </div>
          <span className="text-sm font-medium text-slate-400">{step}/3</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s.id <= step ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Well-being */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-slate-800">Nível de energia</p>
                  <p className="text-xs text-slate-400">Como seu corpo está agora</p>
                </div>
              </div>
              <EnergySlider value={energyLevel} onChange={setEnergyLevel} />
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-semibold text-slate-800">Nível de estresse</p>
                  <p className="text-xs text-slate-400">Como sua mente está agora</p>
                </div>
              </div>
              <StressSlider value={stressLevel} onChange={setStressLevel} />
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">🌙</span>
                <div>
                  <p className="font-semibold text-slate-800">Qualidade do sono</p>
                  <p className="text-xs text-slate-400">Como foi a noite passada</p>
                </div>
              </div>
              <SleepSlider value={sleepQuality} onChange={setSleepQuality} />
            </div>
          </div>
        )}

        {/* Step 2: Context */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-800">Onde você está?</p>
                  <p className="text-xs text-slate-400">Isso personaliza suas recomendações</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {contextEntries.map(([value, { label, emoji }]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDayContext(value as DayContext)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 active:scale-95 ${
                      dayContext === value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-800">Tempo disponível</p>
                  <p className="text-xs text-slate-400">Para atividades de saúde hoje</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAvailableTime(opt.value)}
                    className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      availableTime === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Equipment + Notes */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Dumbbell size={20} className="text-purple-600" />
                <div>
                  <p className="font-semibold text-slate-800">Equipamentos disponíveis</p>
                  <p className="text-xs text-slate-400">Opcional — para treinos mais precisos</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleEquipment(opt.value)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                      equipmentAccess.includes(opt.value)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <label className="mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <p className="font-semibold text-slate-800">Observações</p>
                  <p className="text-xs text-slate-400">Algo importante para o agente saber</p>
                </div>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: estou com dor no joelho, viagem longa hoje, reunião importante amanhã..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Resumo do check-in</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  ⚡ Energia {energyLevel}/5
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  🧠 Estresse {stressLevel}/5
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  🌙 Sono {sleepQuality}/5
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  {CONTEXT_LABELS[dayContext]?.emoji} {CONTEXT_LABELS[dayContext]?.label}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  ⏱ {availableTime} min
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-40 active:scale-95"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={createCheckin.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 active:scale-95"
            >
              {createCheckin.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gerando plano...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Gerar meu plano
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
