import { useNavigate } from 'react-router-dom';
import { ClipboardList, RefreshCw, Zap, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useTodayPlan } from '../hooks/useCheckin';
import { useSubmitFeedback, useRegenerateRecommendations } from '../hooks/useRecommendations';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingState, EmptyState, ErrorMessage } from '../components/LoadingState';
import { getGreeting, formatMinutes } from '../utils/formatters';
import { CONTEXT_LABELS, RECOMMENDATION_TITLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const SECTION_CONFIG = {
  meal:      { icon: '🍽️', color: 'text-emerald-600' },
  workout:   { icon: '💪', color: 'text-blue-600' },
  recovery:  { icon: '🧘', color: 'text-purple-600' },
  hydration: { icon: '💧', color: 'text-cyan-600' },
} as const;

export function PlanPage() {
  const { user } = useAuth();
  const { data: plan, isLoading, error, refetch } = useTodayPlan();
  const submitFeedback = useSubmitFeedback();
  const regenerate = useRegenerateRecommendations();
  const navigate = useNavigate();

  const handleFeedback = (id: string, status: 'accepted' | 'completed' | 'dismissed') => {
    submitFeedback.mutate({ id, data: { status } });
  };

  const handleRegenerate = () => {
    if (plan?.checkin?.id) regenerate.mutate(plan.checkin.id);
  };

  if (isLoading) return <LoadingState message="Seu agente está preparando o plano..." />;

  if (error) {
    return <ErrorMessage message="Não foi possível carregar seu plano." onRetry={() => refetch()} />;
  }

  if (!plan) {
    return (
      <EmptyState
        icon={<ClipboardList size={48} className="text-slate-300" />}
        title="Nenhum plano para hoje"
        description="Faça um check-in rápido para seu agente gerar um plano totalmente personalizado"
        action={
          <button
            onClick={() => navigate('/checkin')}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:opacity-90 active:scale-95"
          >
            Fazer check-in agora
          </button>
        }
      />
    );
  }

  const { checkin, recommendations } = plan;
  const activeRecs = recommendations.filter((r) => r.status !== 'dismissed');
  const completedCount = recommendations.filter((r) => r.status === 'completed').length;
  const totalCount = recommendations.length;

  const grouped = {
    meal:      activeRecs.filter((r) => r.type === 'meal'),
    workout:   activeRecs.filter((r) => r.type === 'workout'),
    recovery:  activeRecs.filter((r) => r.type === 'recovery'),
    hydration: activeRecs.filter((r) => r.type === 'hydration'),
  };

  const contextInfo = CONTEXT_LABELS[checkin.dayContext];
  const isExpired = recommendations.some((r) => new Date(r.expiresAt) < new Date());
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="mx-auto max-w-lg">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Status bar */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <Zap size={11} /> Energia {checkin.energyLevel}/5
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <MapPin size={11} /> {contextInfo?.emoji} {contextInfo?.label}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Clock size={11} /> {formatMinutes(checkin.availableTime)}
        </span>
        {totalCount > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <CheckCircle2 size={11} /> {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Expired notice */}
      {isExpired && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-700">Plano expirado — gere um novo.</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={13} className={regenerate.isPending ? 'animate-spin' : ''} />
            Gerar novo
          </button>
        </div>
      )}

      {/* Recommendations */}
      {activeRecs.length === 0 ? (
        <EmptyState
          title="Plano concluído! 🎉"
          description="Parabéns! Você completou todas as recomendações. Gere um novo plano quando quiser."
          action={
            <button
              onClick={handleRegenerate}
              disabled={regenerate.isPending}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 disabled:opacity-50 active:scale-95"
            >
              <RefreshCw size={16} />
              Novo plano
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {(['meal', 'workout', 'recovery', 'hydration'] as const).map((type) => {
            if (grouped[type].length === 0) return null;
            const section = SECTION_CONFIG[type];
            return (
              <div key={type}>
                <h2 className={`mb-3 flex items-center gap-2 text-base font-bold ${section.color}`}>
                  <span>{section.icon}</span>
                  {RECOMMENDATION_TITLES[type]}
                </h2>
                <div className="space-y-3">
                  {grouped[type].map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onAccept={rec.status === 'pending' ? (id) => handleFeedback(id, 'accepted') : undefined}
                      onComplete={rec.status === 'accepted' ? (id) => handleFeedback(id, 'completed') : undefined}
                      onDismiss={(id) => handleFeedback(id, 'dismissed')}
                      onSwap={(id) => handleFeedback(id, 'dismissed')}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={15} className={regenerate.isPending ? 'animate-spin' : ''} />
            Gerar novo plano
          </button>
        </div>
      )}
    </div>
  );
}
