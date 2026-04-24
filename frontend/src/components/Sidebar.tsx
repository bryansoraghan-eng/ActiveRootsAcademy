import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can, ROLE_LABELS, ROLE_COLOURS } from '../lib/permissions';
import type { ModuleKey } from '../lib/permissions';
import RoleSwitcher from './RoleSwitcher';

interface NavItem {
  to: string;
  label: string;
  module: ModuleKey;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  key: string;
  items: NavItem[];
}

const ICON = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  schools: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18M9 21V11l3-3 3 3v10M5 21V7l7-4 7 4v14"/>
    </svg>
  ),
  teachers: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  classes: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  coaches: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
    </svg>
  ),
  programmes: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  ),
  lessonPlans: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  ),
  bookings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  assessments: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
  placements: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  ),
  fmsLibrary: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
    </svg>
  ),
  nutrition: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a3 3 0 110 6 3 3 0 010-6z"/>
    </svg>
  ),
  movementBreaks: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/>
    </svg>
  ),
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    key: 'operations',
    items: [
      { to: '/schools',    label: 'Schools',    module: 'schools',    icon: ICON.schools    },
      { to: '/teachers',   label: 'Teachers',   module: 'teachers',   icon: ICON.teachers   },
      { to: '/classes',    label: 'Classes',    module: 'classes',    icon: ICON.classes    },
      { to: '/coaches',    label: 'Coaches',    module: 'coaches',    icon: ICON.coaches    },
      { to: '/users',      label: 'Team',       module: 'users',      icon: ICON.users      },
    ],
  },
  {
    label: 'Programmes',
    key: 'programmes',
    items: [
      { to: '/lesson-plans', label: 'Lesson Plans', module: 'lessonPlans',  icon: ICON.lessonPlans  },
      { to: '/bookings',     label: 'Bookings',     module: 'bookings',     icon: ICON.bookings     },
    ],
  },
  {
    label: 'Assessment',
    key: 'assessment',
    items: [
      { to: '/assessments', label: 'Assessments', module: 'assessments', icon: ICON.assessments },
      { to: '/placements',  label: 'Placements',  module: 'placements',  icon: ICON.placements  },
    ],
  },
  {
    label: 'Training',
    key: 'training',
    items: [
      { to: '/fms',              label: 'FMS Library',     module: 'fmsLibrary',     icon: ICON.fmsLibrary     },
      { to: '/nutrition',        label: 'Nutrition',       module: 'nutrition',      icon: ICON.nutrition      },
      { to: '/movement-breaks',  label: 'Movement Breaks', module: 'movementBreaks', icon: ICON.movementBreaks },
    ],
  },
];

const CHEVRON = (open: boolean) => (
  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path d="M19 9l-7 7-7-7"/>
  </svg>
);

export default function Sidebar() {
  const { user, permissions, logout, viewingAs } = useAuth();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('ara_sidebar_collapsed') ?? '{}');
    } catch {
      return {};
    }
  });

  const toggleGroup = (key: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('ara_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  const effectiveRole = viewingAs ?? user?.role ?? 'teacher';
  const roleColour = ROLE_COLOURS[effectiveRole]?.bg ?? 'bg-orange-500';

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-[#0f172a] flex flex-col z-40 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Active Roots</p>
            <p className="text-slate-500 text-xs">Academy</p>
          </div>
        </div>
      </div>

      {/* Admin Role Switcher */}
      {user?.role === 'admin' && <RoleSwitcher />}

      {/* Dashboard link (always visible) */}
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
          }
        >
          {ICON.dashboard}
          Dashboard
        </NavLink>
      </div>

      {/* Scrollable nav groups */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-thin">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => can(permissions, item.module));
          if (visibleItems.length === 0) return null;
          const isOpen = !collapsed[group.key];

          return (
            <div key={group.key}>
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
              >
                {group.label}
                {CHEVRON(isOpen)}
              </button>

              {isOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {visibleItems.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={false}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`
                      }
                    >
                      {icon}
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 ${roleColour} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs capitalize">{ROLE_LABELS[effectiveRole] ?? effectiveRole}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors px-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
