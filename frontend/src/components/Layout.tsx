import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { viewingAs, impersonateName, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  const handleExit = () => {
    stopImpersonation();
    navigate('/');
  };

  return (
    <div className="ara-app-shell">
      <Sidebar />
      <div className="ara-main-col">
        {viewingAs && (
          <div className="ara-impersonation-bar">
            {impersonateName
              ? <>Viewing as <strong>{impersonateName}</strong></>
              : <>Admin preview — viewing as <strong>{viewingAs.replace('_', ' ')}</strong></>
            }
            {' — '}
            <button type="button" onClick={handleExit} className="underline hover:no-underline font-medium">
              Exit impersonation
            </button>
          </div>
        )}
        <main className="ara-page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
