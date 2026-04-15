import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Flame, BarChart3 } from 'lucide-react';
import { useCheckinHistory } from '../hooks/useCheckin';
import { LoadingState, ErrorMessage } from '../components/LoadingState';
import { CONTEXT_LABELS } from '../utils/constants';
import { formatDate, getWeekDays } from '../utils/formatters';

export function HistoryPage() {
  const { data: history, isLoading, error, refetch } = useCheckinHistory(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const weekDays = useMemo(() => getWeekDays(), []);

  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return { total: 0, streak: 0, avgEnergy: 0, topContext: '' };
    }

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = history.find((c) => c.createdAt.startsWith(dateStr));
      if (found) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const avgEnergy = Math.round(
      history.reduce((sum, c) => sum + c.energyLevel, 0) / history.length
    );

    const contextCounts: Record<string, number> = {};
    history.forEach((c) => {
      contextCounts[c.dayContext] = (contextCounts[c.dayContext] || 0) + 1;
    });
    const topContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return { total: history.length, streak, avgEnergy, topContext };
  }, [history]);

  if (isLoading) return <LoadingState message="Carregando histórico..." />;
  if (error) return <ErrorMessage message="Erro ao carregar histórico." onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Histórico</h1>
        <p className="mt-1 text-sm text-slate-500">Acompanhe sua evolução</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <Flame size={20} />
            <span className="text-2xl font-bold">{stats.streak}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Sequência de dias</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <BarChart3 size={20} />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Check-ins totais</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <TrendingUp size={20} />
            <span className="text-2xl font-bold">{stats.avgEnergy}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Energia média</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <Calendar size={20} />
            <span className="text-sm font-bold">
              {stats.topContext ? CONTEXT_LABELS[stats.topContext]?.label : '-'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Contexto mais comum</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Últimos 7 dias</h2>
        <div className="flex gap-2">
          {weekDays.map((day) => {
            const hasCheckin = history?.some((c) => c.createdAt.startsWith(day));
            const isSelected = selectedDate === day;
            const d = new Date(day + 'T12:00:00');
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50'
                    : hasCheckin
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-[10px] font-medium uppercase text-slate-500">
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="text-sm font-bold text-slate-800">{d.getDate()}</span>
                <div
                  className={`h-2 w-2 rounded-full ${
                    hasCheckin ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Check-ins recentes</h2>
        {!history || history.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Nenhum check-in registrado ainda
          </p>
        ) : (
          <div className="space-y-2">
            {history
              .filter((c) => !selectedDate || c.createdAt.startsWith(selectedDate))
              .map((checkin) => {
                const ctx = CONTEXT_LABELS[checkin.dayContext];
                return (
                  <div
                    key={checkin.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">
                        {formatDate(checkin.createdAt)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(checkin.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        ⚡ {checkin.energyLevel}/5
                      </span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        😰 {checkin.stressLevel}/5
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        😴 {checkin.sleepQuality}/5
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {ctx?.emoji} {ctx?.label}
                      </span>
                    </div>
                    {checkin.notes && (
                      <p className="mt-2 text-xs text-slate-500">{checkin.notes}</p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
