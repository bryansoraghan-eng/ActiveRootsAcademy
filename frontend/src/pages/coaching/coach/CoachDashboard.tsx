import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function CoachDashboard() {
  const { token } = useAuth();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients).finally(() => setLoading(false));
  }, [token]);

  const active = clients.filter(c => c.status === 'active');
  const totalGoals = clients.reduce((acc, c) => acc + (c.clientGoals?.length ?? 0), 0);

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Coaching Dashboard</h1>
          <p className="ara-page-sub">Overview of your clients</p>
        </div>
        <Link to="/coaching/clients" className="ara-btn ara-btn-primary">+ Add Client</Link>
      </div>

      <div className="ara-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Clients', value: clients.length },
          { label: 'Active Clients', value: active.length },
          { label: 'Active Goals', value: totalGoals },
        ].map(s => (
          <div key={s.label} className="ara-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#C4703F' }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ara-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>Your Clients</div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No clients yet. <Link to="/coaching/clients" style={{ color: '#C4703F' }}>Add your first client</Link></div>
        ) : (
          <div>
            {clients.map(client => (
              <Link key={client.id} to={`/coaching/clients/${client.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f8fafc', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3A7AA0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                    {client.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{client.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{client.user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: client.status === 'active' ? '#dcfce7' : '#f1f5f9', color: client.status === 'active' ? '#166534' : '#64748b' }}>
                    {client.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{client.clientGoals?.length ?? 0} goals</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
