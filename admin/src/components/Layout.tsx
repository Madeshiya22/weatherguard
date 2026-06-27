import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: '🏠 Dashboard', adminOnly: false },
  { to: '/users/pending', label: '⏳ Pending Users', adminOnly: true },
  { to: '/users/all', label: '👥 All Users', adminOnly: true },
  { to: '/alerts', label: '🌦 Alerts', adminOnly: true },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex h-16 items-center px-6 text-xl font-bold text-blue-400">
          ⛅  WeatherGuard
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <div className="mb-2 flex items-center gap-3">
            {user?.avatar && (
              <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-md bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
