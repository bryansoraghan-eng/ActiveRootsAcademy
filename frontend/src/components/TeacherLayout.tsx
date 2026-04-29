import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can } from '../lib/permissions';

const Ic = {
  home:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v11h14V10"/></svg>,
  classes:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  assessments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  nutrition:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10m0 0l-3-3m3 3l3-3"/></svg>,
  lessons:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  fms:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
  movement:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  signout:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
};

export default function TeacherLayout() {
  const { user, permissions, logout, impersonateName, stopImpersonation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const basePath = impersonateName ? '/preview/teacher' : '/teacher';

  const navItems = [
    { to: basePath,                       label: 'Dashboard',       icon: Ic.home,        always: true },
    { to: `${basePath}/classes`,          label: 'My Classes',      icon: Ic.classes,     module: 'classes'        as const },
    { to: `${basePath}/assessments`,      label: 'Assessments',     icon: Ic.assessments, module: 'assessments'    as const },
    { to: `${basePath}/nutrition`,        label: 'Nutrition',       icon: Ic.nutrition,   module: 'nutrition'      as const },
    { to: `${basePath}/lesson-plans`,     label: 'Lesson Plans',    icon: Ic.lessons,     module: 'lessonPlans'    as const },
    { to: `${basePath}/fms`,              label: 'FMS Library',     icon: Ic.fms,         module: 'fmsLibrary'     as const },
    { to: `${basePath}/movement-breaks`,  label: 'Movement Breaks', icon: Ic.movement,    module: 'movementBreaks' as const },
  ];

  const visibleItems = navItems.filter(item =>
    item.always || (item.module && can(permissions, item.module))
  );

  return (
    <div className="ara-app-shell">
      {/* Mobile top bar */}
      <div className="ara-mobile-topbar">
        <button type="button" className="ara-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span className="ara-mobile-topbar-title">Active <span className="ara-sidebar-wordmark-accent">Roots</span></span>
      </div>

      {/* Backdrop */}
      {sidebarOpen && <div className="ara-sidebar-backdrop" onClick={closeSidebar} />}

      <aside className={`ara-sidebar${sidebarOpen ? ' ara-sidebar-open' : ''}`}>
        <button type="button" className="ara-sidebar-close" onClick={closeSidebar} aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="ara-sidebar-logo">
          <img src="/logo-mark.svg" className="ara-sidebar-logo-img" alt="" />
          <div>
            <div className="ara-sidebar-wordmark">
              Active <span className="ara-sidebar-wordmark-accent">Roots</span>
            </div>
            <div className="ara-sidebar-sub">Teacher Portal</div>
          </div>
        </div>

        {impersonateName && (
          <div className="px-4 py-2 mx-3 mb-1 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            Previewing as <strong>{impersonateName}</strong>
            <button
              type="button"
              onClick={stopImpersonation}
              className="block mt-1 underline hover:no-underline font-medium"
            >
              Exit preview
            </button>
          </div>
        )}

        <div className="ara-sidebar-dashboard">
          <NavLink to={basePath} end onClick={closeSidebar} className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
            {Ic.home}
            Dashboard
          </NavLink>
        </div>

        <nav className="ara-sidebar-nav">
          <div className="ara-sidebar-group">
            <div className="ara-sidebar-group-items">
              {visibleItems.slice(1).map(({ to, label, icon }) => (
                <NavLink key={to} to={to} onClick={closeSidebar} className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
                  {icon}
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="ara-sidebar-footer">
          <div className="ara-sidebar-profile">
            <div className="ara-sidebar-avatar" style={{ backgroundColor: '#3A7AA0' }}>
              {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="ara-sidebar-profile-name">{impersonateName ?? user?.name}</div>
              <div className="ara-sidebar-profile-role">{user?.school?.name ?? 'Teacher'}</div>
            </div>
          </div>
          {!impersonateName && (
            <button className="ara-signout-btn" onClick={logout}>
              {Ic.signout}
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="ara-main-col">
        <main className="ara-page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
