import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/plan', icon: Home, label: 'Plano' },
  { to: '/checkin', icon: ClipboardList, label: 'Check-in' },
  { to: '/history', icon: BarChart3, label: 'Histórico' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              VE
            </div>
            <span className="text-lg font-bold text-slate-800">VidaEquilibrio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                <User size={16} className="text-slate-500" />
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1">
        <nav className="hidden border-r border-slate-200 bg-white p-4 lg:block lg:w-56">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              </li>
            ))}
            {user?.role === 'admin' && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <BarChart3 size={20} />
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`
              }
            >
              <Icon size={22} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`
              }
            >
              <BarChart3 size={22} />
              <span className="font-medium">Admin</span>
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
