import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can, ROLE_LABELS } from '../lib/permissions';
import type { ModuleKey } from '../lib/permissions';
import RoleSwitcher from './RoleSwitcher';

interface NavItem { to: string; label: string; module: ModuleKey; icon: React.ReactNode; }
interface NavGroup { label: string; key: string; items: NavItem[]; }

const Ic = {
  home:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v11h14V10"/></svg>,
  school:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V11l3-3 3 3v10M5 21V7l7-4 7 4v14"/></svg>,
  teachers:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  classes:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  coaches:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>,
  team:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 22v-2a6 6 0 0112 0v2"/><circle cx="17" cy="10" r="3"/><path d="M22 22v-1a5 5 0 00-6-5"/></svg>,
  lessons:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  bookings:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  assessments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  placements:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  fms:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
  nutrition:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10m0 0l-3-3m3 3l3-3"/></svg>,
  movement:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  signout:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  chevron:     (open: boolean) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="M19 9l-7 7-7-7"/></svg>,
};

const ROLE_AVATAR_BG: Record<string, string> = {
  admin: '#C4703F', school_admin: '#628749', principal: '#628749',
  coach: '#3A7AA0', teacher: '#3A7AA0', online_coach: '#7C3AED', client: '#7C3AED',
};

const COACHING_NAV = [
  { to: '/coaching', label: 'Coach Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v11h14V10"/></svg> },
  { to: '/coaching/clients', label: 'Clients', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { to: '/coaching/training', label: 'Training Plans', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { to: '/coaching/nutrition', label: 'Nutrition', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10m0 0l-3-3m3 3l3-3"/></svg> },
  { to: '/coaching/progress', label: 'Progress', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { to: '/coaching/checkins', label: 'Check-ins', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
];

const NAV_GROUPS: NavGroup[] = [
  { label: 'Operations', key: 'operations', items: [
    { to: '/schools',  label: 'Schools',  module: 'schools',  icon: Ic.school   },
    { to: '/teachers', label: 'Teachers', module: 'teachers', icon: Ic.teachers },
    { to: '/classes',  label: 'Classes',  module: 'classes',  icon: Ic.classes  },
    { to: '/coaches',  label: 'Coaches',  module: 'coaches',  icon: Ic.coaches  },
    { to: '/users',    label: 'Team',     module: 'users',    icon: Ic.team     },
  ]},
  { label: 'Programmes', key: 'programmes', items: [
    { to: '/lesson-plans', label: 'Lesson Plans', module: 'lessonPlans', icon: Ic.lessons  },
    { to: '/bookings',     label: 'Bookings',     module: 'bookings',    icon: Ic.bookings },
  ]},
  { label: 'Assessment', key: 'assessment', items: [
    { to: '/assessments', label: 'Assessments', module: 'assessments', icon: Ic.assessments },
    { to: '/placements',  label: 'Placements',  module: 'placements',  icon: Ic.placements  },
  ]},
  { label: 'Learning', key: 'learning', items: [
    { to: '/fms',             label: 'FMS Library',     module: 'fmsLibrary',     icon: Ic.fms       },
    { to: '/nutrition',       label: 'Nutrition',       module: 'nutrition',      icon: Ic.nutrition },
    { to: '/movement-breaks', label: 'Movement Breaks', module: 'movementBreaks', icon: Ic.movement  },
  ]},
];

export default function Sidebar() {
  const { user, permissions, logout, viewingAs, previewUserType } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('ara_sidebar_collapsed') ?? '{}'); }
    catch { return {}; }
  });

  const toggleGroup = (key: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('ara_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  const effectiveRole = viewingAs ?? user?.role ?? 'teacher';
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <aside className="ara-sidebar">
      <div className="ara-sidebar-logo">
        <img src="/logo-mark.svg" className="ara-sidebar-logo-img" alt="" />
        <div>
          <div className="ara-sidebar-wordmark">
            Active <span className="ara-sidebar-wordmark-accent">Roots</span>
          </div>
          <div className="ara-sidebar-sub">Academy</div>
        </div>
      </div>

      {user?.role === 'admin' && <RoleSwitcher />}

      <div className="ara-sidebar-dashboard">
        <NavLink to="/" end className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
          {Ic.home}
          Dashboard
        </NavLink>
      </div>

      <nav className="ara-sidebar-nav">
        {user?.role === 'admin' && (
          <div className="ara-sidebar-group">
            <button className="ara-sidebar-group-btn" onClick={() => toggleGroup('coaching')}>
              Online Coaching
              {Ic.chevron(!collapsed['coaching'])}
            </button>
            {!collapsed['coaching'] && (
              <div className="ara-sidebar-group-items">
                <button
                  type="button"
                  className="ara-nav-link ara-nav-link-coach-portal"
                  onClick={() => { previewUserType('online_coach'); navigate('/coaching'); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3"/></svg>
                  Enter Coach Portal
                </button>
                {COACHING_NAV.map(({ to, label, icon }) => (
                  <NavLink key={to} to={to} end={to === '/coaching'} className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
                    {icon}{label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => can(permissions, item.module));
          if (visibleItems.length === 0) return null;
          const isOpen = !collapsed[group.key];
          return (
            <div key={group.key} className="ara-sidebar-group">
              <button className="ara-sidebar-group-btn" onClick={() => toggleGroup(group.key)}>
                {group.label}
                {Ic.chevron(isOpen)}
              </button>
              {isOpen && (
                <div className="ara-sidebar-group-items">
                  {visibleItems.map(({ to, label, icon }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
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

      <div className="ara-sidebar-footer">
        <div className="ara-sidebar-profile">
          <div
            className="ara-sidebar-avatar"
            style={{ backgroundColor: ROLE_AVATAR_BG[effectiveRole] ?? '#3A7AA0' }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="ara-sidebar-profile-name">{user?.name}</div>
            <div className="ara-sidebar-profile-role">{ROLE_LABELS[effectiveRole] ?? effectiveRole}</div>
          </div>
        </div>
        <button className="ara-signout-btn" onClick={logout}>
          {Ic.signout}
          Sign out
        </button>
      </div>
    </aside>
  );
}
