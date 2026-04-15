import { useNavigate } from 'react-router-dom';
import { ClipboardList, RefreshCw, Zap, Clock, MapPin } from 'lucide-react';
import { useTodayPlan } from '../hooks/useCheckin';
import { useSubmitFeedback, useRegenerateRecommendations } from '../hooks/useRecommendations';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingState, EmptyState, ErrorMessage } from '../components/LoadingState';
import { getGreeting, formatMinutes } from '../utils/formatters';
import { CONTEXT_LABELS, RECOMMENDATION_TITLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

export function PlanPage() {
  const { user } = useAuth();
  const { data: plan, isLoading, error, refetch } = useTodayPlan();
  const submitFeedback = useSubmitFeedback();
  const regenerate = useRegenerateRecommendations();
  const navigate = useNavigate();

  const handleFeedback = (id: string, status: 'accepted' | 'completed' | 'dismissed') => {
    submitFeedback.mutate({ id, data: { status } });
  };

  const handleSwap = (id: string) => {
    submitFeedback.mutate({ id, data: { status: 'dismissed' } });
  };

  const handleRegenerate = () => {
    if (plan?.checkin?.id) {
      regenerate.mutate(plan.checkin.id);
    }
  };

  if (isLoading) {
    return <LoadingState message="Carregando seu plano..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Não foi possível carregar seu plano."
        onRetry={() => refetch()}
      />
    );
  }

  if (!plan) {
    return (
      <EmptyState
        icon={<ClipboardList size={48} className="text-slate-300" />}
        title="Nenhum plano para hoje"
        description="Faça um check-in rápido para gerar seu plano personalizado"
        action={
          <button
            onClick={() => navigate('/checkin')}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700"
          >
            Fazer check-in
          </button>
        }
      />
    );
  }

  const { checkin, recommendations } = plan;
  const activeRecommendations = recommendations.filter((r) => r.status !== 'dismissed');
  const grouped = {
    meal: activeRecommendations.filter((r) => r.type === 'meal'),
    workout: activeRecommendations.filter((r) => r.type === 'workout'),
    recovery: activeRecommendations.filter((r) => r.type === 'recovery'),
    hydration: activeRecommendations.filter((r) => r.type === 'hydration'),
  };

  const contextInfo = CONTEXT_LABELS[checkin.dayContext];

  const isExpired = recommendations.length > 0 && recommendations.some(
    (r) => new Date(r.expiresAt) < new Date()
  );

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <Zap size={12} /> Energia {checkin.energyLevel}/5
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
          <MapPin size={12} /> {contextInfo?.emoji} {contextInfo?.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
          <Clock size={12} /> {formatMinutes(checkin.availableTime)}
        </span>
      </div>

      {isExpired && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm text-amber-700">Seu plano expirou. Gere um novo.</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
            className="flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            <RefreshCw size={14} className={regenerate.isPending ? 'animate-spin' : ''} />
            Gerar novo plano
          </button>
        </div>
      )}

      {activeRecommendations.length === 0 ? (
        <EmptyState
          title="Nenhuma recomendação ativa"
          description="Todas as recomendações foram tratadas. Gere um novo plano."
          action={
            <button
              onClick={handleRegenerate}
              disabled={regenerate.isPending}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Gerar novo plano
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {(['meal', 'workout', 'recovery', 'hydration'] as const).map((type) => {
            if (grouped[type].length === 0) return null;
            return (
              <div key={type}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                  {RECOMMENDATION_TITLES[type]}
                </h2>
                <div className="space-y-3">
                  {grouped[type].map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onAccept={
                        rec.status === 'pending'
                          ? (id) => handleFeedback(id, 'accepted')
                          : undefined
                      }
                      onComplete={
                        rec.status === 'accepted'
                          ? (id) => handleFeedback(id, 'completed')
                          : undefined
                      }
                      onDismiss={(id) => handleFeedback(id, 'dismissed')}
                      onSwap={(id) => handleSwap(id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
