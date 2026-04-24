import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { viewingAs } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Impersonation banner */}
        {viewingAs && (
          <div className="bg-orange-500 text-white text-xs font-medium px-4 py-2 text-center flex-shrink-0">
            Admin preview mode — viewing as <strong className="capitalize">{viewingAs.replace('_', ' ')}</strong>. Changes are not restricted in this view.
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
