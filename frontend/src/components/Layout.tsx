import { NavLink, Outlet } from 'react-router-dom';
import { Home, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/plan', icon: Home, label: 'Plano' },
  { to: '/checkin', icon: ClipboardList, label: 'Check-in' },
  { to: '/history', icon: BarChart3, label: 'Histórico' },
  { to: '/settings', icon: Settings, label: 'Perfil' },
];

export function Layout() {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'VE';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
              <span className="text-xs font-black text-white">VE</span>
            </div>
            <span className="text-base font-bold text-slate-800">VidaEquilibrio</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 lg:max-w-5xl">
        <nav className="hidden border-r border-slate-100 bg-white p-3 lg:block lg:w-56">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 pt-1 pb-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`rounded-xl p-1.5 transition-all duration-200 ${isActive ? 'bg-emerald-50' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
