import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useCreateProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { ProgressBar } from '../components/ProgressBar';
import {
  PRIMARY_GOALS,
  DIETARY_RESTRICTIONS,
  PHYSICAL_LIMITATIONS,
  FITNESS_LEVELS,
  TRAVEL_FREQUENCIES,
  WORKOUT_TYPES,
  MEAL_STYLES,
} from '../utils/constants';
import type {
  PrimaryGoal,
  DietaryRestriction,
  PhysicalLimitation,
  FitnessLevel,
  TravelFrequency,
  WorkoutType,
  MealStyle,
  CreateProfileRequest,
} from '../types';

const TOTAL_STEPS = 5;

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | ''>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [physicalLimitations, setPhysicalLimitations] = useState<PhysicalLimitation[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('');
  const [travelFrequency, setTravelFrequency] = useState<TravelFrequency | ''>('');
  const [preferredWorkoutTypes, setPreferredWorkoutTypes] = useState<WorkoutType[]>([]);
  const [mealStyle, setMealStyle] = useState<MealStyle | ''>('');
  const [error, setError] = useState('');
  const createProfile = useCreateProfile();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const toggleArrayItem = <T,>(arr: T[], item: T, setArr: (v: T[]) => void) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!primaryGoal;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return !!fitnessLevel && !!travelFrequency;
      case 5:
        return preferredWorkoutTypes.length > 0 && !!mealStyle;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    const data: CreateProfileRequest = {
      primaryGoal: primaryGoal as PrimaryGoal,
      dietaryRestrictions,
      physicalLimitations,
      fitnessLevel: fitnessLevel as FitnessLevel,
      travelFrequency: travelFrequency as TravelFrequency,
      preferredWorkoutTypes,
      mealStyle: mealStyle as MealStyle,
    };

    try {
      await createProfile.mutateAsync(data);
      updateUser({ ...data, profileComplete: true } as any);
      navigate('/plan');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao salvar perfil. Tente novamente.';
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              Passo {step} de {TOTAL_STEPS}
            </span>
            <span>Perfil</span>
          </div>
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-lg">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-1 text-xl font-bold text-slate-800">Qual é o seu principal objetivo?</h2>
              <p className="mb-4 text-sm text-slate-500">
                Isso nos ajuda a personalizar suas recomendações
              </p>
              <div className="space-y-2">
                {PRIMARY_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setPrimaryGoal(goal.value as PrimaryGoal)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      primaryGoal === goal.value
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-800">{goal.label}</div>
                    <div className="text-sm text-slate-500">{goal.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 text-xl font-bold text-slate-800">Restrições alimentares</h2>
              <p className="mb-4 text-sm text-slate-500">
                Selecione todas que se aplicam. Pode deixar vazio se não houver.
              </p>
              <div className="space-y-2">
                {DIETARY_RESTRICTIONS.map((item) => (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all duration-200 ${
                      dietaryRestrictions.includes(item.value as DietaryRestriction)
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                        dietaryRestrictions.includes(item.value as DietaryRestriction)
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {dietaryRestrictions.includes(item.value as DietaryRestriction) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 text-xl font-bold text-slate-800">Limitações físicas</h2>
              <p className="mb-4 text-sm text-slate-500">
                Nos ajude a adaptar os exercícios para você
              </p>
              <div className="space-y-2">
                {PHYSICAL_LIMITATIONS.map((item) => (
                  <label
                    key={item.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all duration-200 ${
                      physicalLimitations.includes(item.value as PhysicalLimitation)
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                        physicalLimitations.includes(item.value as PhysicalLimitation)
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {physicalLimitations.includes(item.value as PhysicalLimitation) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-800">Nível de condicionamento e rotina</h2>

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Nível de condicionamento</h3>
                <div className="space-y-2">
                  {FITNESS_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFitnessLevel(level.value as FitnessLevel)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        fitnessLevel === level.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{level.label}</div>
                      <div className="text-sm text-slate-500">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Frequência de viagens</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TRAVEL_FREQUENCIES.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setTravelFrequency(freq.value as TravelFrequency)}
                      className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all duration-200 ${
                        travelFrequency === freq.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-800">Preferências de treino e alimentação</h2>

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Tipos de exercício preferidos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_TYPES.map((w) => (
                    <label
                      key={w.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200 ${
                        preferredWorkoutTypes.includes(w.value as WorkoutType)
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                          preferredWorkoutTypes.includes(w.value as WorkoutType)
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {preferredWorkoutTypes.includes(w.value as WorkoutType) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Estilo de refeição</h3>
                <div className="space-y-2">
                  {MEAL_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setMealStyle(style.value as MealStyle)}
                      className={`w-full rounded-xl border-2 p-3 text-left text-sm font-medium transition-all duration-200 ${
                        mealStyle === style.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || createProfile.isPending}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
            >
              {createProfile.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check size={16} />
                  Finalizar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
