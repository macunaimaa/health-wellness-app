import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, User, Bell, Heart, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useReminders, useUpdateReminders } from '../hooks/useReminders';
import { LoadingState, ErrorMessage } from '../components/LoadingState';
import {
  DIETARY_RESTRICTIONS,
  WORKOUT_TYPES,
  MEAL_STYLES,
  FITNESS_LEVELS,
} from '../utils/constants';
import type { DietaryRestriction, WorkoutType, MealStyle, FitnessLevel, ReminderType } from '../types';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const updateReminders = useUpdateReminders();

  const [editingDiet, setEditingDiet] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState<DietaryRestriction[]>(
    profile?.dietaryRestrictions || []
  );
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutType[]>(
    profile?.preferredWorkoutTypes || []
  );
  const [editingMealStyle, setEditingMealStyle] = useState(false);
  const [selectedMealStyle, setSelectedMealStyle] = useState<MealStyle | ''>(
    profile?.mealStyle || ''
  );
  const [successMsg, setSuccessMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const queryClient = useQueryClient();

  const resetData = useMutation({
    mutationFn: () => client.delete('/reset'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
      queryClient.invalidateQueries({ queryKey: ['checkinHistory'] });
      setShowResetConfirm(false);
      showSuccess('Dados resetados! Faça um novo check-in.');
      navigate('/checkin');
    },
  });

  if (profileLoading || remindersLoading) return <LoadingState message="Carregando..." />;
  if (profileError) return <ErrorMessage message="Erro ao carregar perfil." />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveDiets = async () => {
    await updateProfile.mutateAsync({ dietaryRestrictions: selectedDiets });
    setEditingDiet(false);
    showSuccess('Restrições atualizadas');
  };

  const handleSaveWorkouts = async () => {
    await updateProfile.mutateAsync({ preferredWorkoutTypes: selectedWorkouts });
    setEditingWorkout(false);
    showSuccess('Preferências de treino atualizadas');
  };

  const handleSaveMealStyle = async () => {
    await updateProfile.mutateAsync({ mealStyle: selectedMealStyle as MealStyle });
    setEditingMealStyle(false);
    showSuccess('Estilo de refeição atualizado');
  };

  const handleToggleReminder = async (type: ReminderType) => {
    if (!reminders) return;
    const updated = { ...reminders, [type]: !reminders[type] };
    await updateReminders.mutateAsync(updated);
  };

  const reminderLabels: Record<ReminderType, { label: string; icon: string }> = {
    hydration: { label: 'Hidratação', icon: '💧' },
    movement: { label: 'Movimento', icon: '🏃' },
    meal: { label: 'Refeição', icon: '🍽️' },
    recovery: { label: 'Recuperação', icon: '🧘' },
    workout: { label: 'Treino', icon: '💪' },
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie seu perfil e preferências</p>
      </div>

      {successMsg && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <User size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Heart size={16} className="text-red-500" />
            Perfil de saúde
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium">Objetivo:</span>{' '}
              {profile?.primaryGoal === 'energia' && 'Energia'}
              {profile?.primaryGoal === 'perda_de_peso' && 'Perda de peso'}
              {profile?.primaryGoal === 'manutencao' && 'Manutenção'}
              {profile?.primaryGoal === 'sono' && 'Sono'}
              {profile?.primaryGoal === 'consistencia' && 'Consistência'}
              {profile?.primaryGoal === 'reducao_estresse' && 'Redução de estresse'}
            </p>
            <p>
              <span className="font-medium">Nível:</span>{' '}
              {profile?.fitnessLevel === 'iniciante' && 'Iniciante'}
              {profile?.fitnessLevel === 'intermediario' && 'Intermediário'}
              {profile?.fitnessLevel === 'avancado' && 'Avançado'}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Restrições alimentares</h3>
            <button
              onClick={() => setEditingDiet(!editingDiet)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {editingDiet ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {editingDiet ? (
            <div className="space-y-2">
              {DIETARY_RESTRICTIONS.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedDiets.includes(item.value as DietaryRestriction)}
                    onChange={() => {
                      if (selectedDiets.includes(item.value as DietaryRestriction)) {
                        setSelectedDiets(selectedDiets.filter((d) => d !== item.value));
                      } else {
                        setSelectedDiets([...selectedDiets, item.value as DietaryRestriction]);
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </label>
              ))}
              <button
                onClick={handleSaveDiets}
                disabled={updateProfile.isPending}
                className="mt-2 flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={14} /> Salvar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {profile?.dietaryRestrictions.length ? (
                profile.dietaryRestrictions.map((d) => {
                  const label = DIETARY_RESTRICTIONS.find((r) => r.value === d)?.label || d;
                  return (
                    <span
                      key={d}
                      className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                    >
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-slate-400">Nenhuma restrição</span>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Tipos de treino preferidos</h3>
            <button
              onClick={() => setEditingWorkout(!editingWorkout)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {editingWorkout ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {editingWorkout ? (
            <div className="space-y-2">
              {WORKOUT_TYPES.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkouts.includes(item.value as WorkoutType)}
                    onChange={() => {
                      if (selectedWorkouts.includes(item.value as WorkoutType)) {
                        setSelectedWorkouts(selectedWorkouts.filter((w) => w !== item.value));
                      } else {
                        setSelectedWorkouts([...selectedWorkouts, item.value as WorkoutType]);
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </label>
              ))}
              <button
                onClick={handleSaveWorkouts}
                disabled={updateProfile.isPending}
                className="mt-2 flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={14} /> Salvar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {profile?.preferredWorkoutTypes.map((w) => {
                const label = WORKOUT_TYPES.find((t) => t.value === w)?.label || w;
                return (
                  <span
                    key={w}
                    className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Estilo de refeição</h3>
            <button
              onClick={() => {
                setEditingMealStyle(!editingMealStyle);
                setSelectedMealStyle(profile?.mealStyle || '');
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {editingMealStyle ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          {editingMealStyle ? (
            <div className="space-y-2">
              {MEAL_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setSelectedMealStyle(style.value as MealStyle)}
                  className={`w-full rounded-xl border-2 p-3 text-left text-sm font-medium transition-all duration-200 ${
                    selectedMealStyle === style.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {style.label}
                </button>
              ))}
              <button
                onClick={handleSaveMealStyle}
                disabled={updateProfile.isPending}
                className="mt-2 flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save size={14} /> Salvar
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {MEAL_STYLES.find((s) => s.value === profile?.mealStyle)?.label || '-'}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Bell size={16} className="text-amber-500" />
            Lembretes
          </h3>
          <div className="space-y-3">
            {(Object.entries(reminderLabels) as [ReminderType, typeof reminderLabels[ReminderType]][]).map(
              ([type, { label, icon }]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {icon} {label}
                  </span>
                  <button
                    onClick={() => handleToggleReminder(type)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reminders?.[type] ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminders?.[type] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Reset de dados */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 size={16} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-orange-800">Resetar dados</h3>
          </div>
          <p className="mb-3 text-xs text-orange-700 leading-relaxed">
            Apaga todos os check-ins e recomendações. Útil para testar o app do zero. Perfil e configurações são mantidos.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-100 active:scale-95"
            >
              <Trash2 size={15} />
              Resetar dados
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-xl bg-orange-100 p-3">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-600" />
                <p className="text-xs font-medium text-orange-800">
                  Tem certeza? Isso apaga todos os check-ins e recomendações permanentemente.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => resetData.mutate()}
                  disabled={resetData.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 active:scale-95"
                >
                  {resetData.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Confirmar reset
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
        >
          <LogOut size={18} />
          Sair da conta
        </button>

        <div className="rounded-xl bg-slate-100 p-4">
          <div className="flex items-start gap-2">
            <Shield size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-500">
              Este aplicativo oferece recomendações de bem-estar com fins informativos. Não substitui
              acompanhamento médico ou nutricional. Consulte um profissional de saúde antes de iniciar
              qualquer programa de exercícios ou dieta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
