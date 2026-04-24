import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/teacher',            label: 'Dashboard', icon: '⊞' },
  { to: '/teacher/classes',    label: 'My Classes', icon: '📚' },
  { to: '/teacher/assessments', label: 'Assessments', icon: '📊' },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 min-h-screen bg-blue-900 flex flex-col">
        <div className="px-6 py-5 border-b border-blue-800">
          <h1 className="text-white font-bold text-lg leading-tight">
            Active Roots Academy<br />
            <span className="text-blue-300 font-normal text-sm">Teacher Portal</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/teacher'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-blue-800">
          <div className="mb-3">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.school?.name ?? 'Teacher'}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-blue-300 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
