import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Ic = {
  home:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12 12 3l9 9"/><path d="M5 10v11h14V10"/></svg>,
  training: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  nutrition:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10m0 0l-3-3m3 3l3-3"/></svg>,
  progress: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  checkins: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  profile:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>,
  signout:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
};

const NAV = [
  { to: '/client', label: 'Dashboard', icon: Ic.home, end: true },
  { to: '/client/training', label: 'Training', icon: Ic.training },
  { to: '/client/nutrition', label: 'Nutrition', icon: Ic.nutrition },
  { to: '/client/progress', label: 'Progress', icon: Ic.progress },
  { to: '/client/checkins', label: 'Check-ins', icon: Ic.checkins },
  { to: '/client/profile', label: 'Profile', icon: Ic.profile },
];

export default function ClientLayout() {
  const { user, logout, isPreviewMode, exitPreview } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className="ara-app-shell">
      <aside className="ara-sidebar">
        <div className="ara-sidebar-logo">
          <img src="/logo-mark.svg" className="ara-sidebar-logo-img" alt="" />
          <div>
            <div className="ara-sidebar-wordmark">Active <span className="ara-sidebar-wordmark-accent">Roots</span></div>
            <div className="ara-sidebar-sub">Coaching</div>
          </div>
        </div>

        <div className="ara-sidebar-dashboard">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `ara-nav-link${isActive ? ' active' : ''}`}>
              {icon}{label}
            </NavLink>
          ))}
        </div>

        <div className="ara-sidebar-footer">
          <div className="ara-sidebar-profile">
            <div className="ara-sidebar-avatar" style={{ backgroundColor: '#3A7AA0' }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="ara-sidebar-profile-name">{user?.name}</div>
              <div className="ara-sidebar-profile-role">Client</div>
            </div>
          </div>
          <button className="ara-signout-btn" onClick={logout}>{Ic.signout}Sign out</button>
        </div>
      </aside>

      <main className="ara-main-col">
        {isPreviewMode && (
          <div className="ara-preview-banner">
            <span>Admin Preview — Client Portal</span>
            <button type="button" onClick={() => { exitPreview(); navigate('/coaching'); }}>Exit Preview</button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
