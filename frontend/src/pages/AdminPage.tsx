import { useState } from 'react';
import { Users, Activity, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminUsers, useAdminStats } from '../hooks/useReminders';
import { useAuth } from '../hooks/useAuth';
import { LoadingState, ErrorMessage } from '../components/LoadingState';
import { Navigate } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

export function AdminPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useAdminUsers(page, 10);

  if (user?.role !== 'admin') {
    return <Navigate to="/plan" replace />;
  }

  if (statsLoading || usersLoading) return <LoadingState message="Carregando painel..." />;
  if (statsError || usersError) return <ErrorMessage message="Erro ao carregar dados administrativos." />;

  const statCards = [
    {
      icon: Users,
      label: 'Total de usuários',
      value: stats?.totalUsers ?? 0,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Activity,
      label: 'Ativos hoje',
      value: stats?.activeToday ?? 0,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: TrendingUp,
      label: 'Recomendações geradas',
      value: stats?.recommendationsGenerated ?? 0,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: CheckCircle,
      label: 'Taxa de conclusão',
      value: `${Math.round((stats?.completionRate ?? 0) * 100)}%`,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Painel administrativo</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral da organização</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-base font-semibold text-slate-800">Usuários</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.profileComplete ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Completo
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="text-sm text-slate-500">
              Página {page} de {usersData.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(usersData.totalPages, page + 1))}
              disabled={page === usersData.totalPages}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
