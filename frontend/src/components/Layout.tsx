import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { viewingAs } = useAuth();

  return (
    <div className="ara-app-shell">
      <Sidebar />
      <div className="ara-main-col">
        {viewingAs && (
          <div className="ara-impersonation-bar">
            Admin preview — viewing as <strong>{viewingAs.replace('_', ' ')}</strong>. Changes are not restricted in this view.
          </div>
        )}
        <main className="ara-page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
