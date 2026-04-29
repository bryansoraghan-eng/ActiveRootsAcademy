import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', startingWeight: '', height: '', goals: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/coaching/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      onCreated();
      onClose();
    } catch { setError('Failed to create client'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="ara-card" style={{ width: '100%', maxWidth: 480, padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add Client</h2>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'password', label: 'Password', type: 'password', required: true },
            { key: 'age', label: 'Age', type: 'number', required: false },
            { key: 'startingWeight', label: 'Starting Weight (kg)', type: 'number', required: false },
            { key: 'height', label: 'Height (cm)', type: 'number', required: false },
          ].map(f => (
            <div key={f.key}>
              <label htmlFor={f.key} style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>{f.label}{f.required && ' *'}</label>
              <input
                id={f.key}
                type={f.type}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="ara-input"
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <div>
            <label htmlFor="goals" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Goals</label>
            <textarea id="goals" value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} className="ara-input" rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="ara-btn ara-btn-ghost">Cancel</button>
          <button type="button" onClick={save} disabled={saving} className="ara-btn ara-btn-primary">{saving ? 'Saving…' : 'Create Client'}</button>
        </div>
      </div>
    </div>
  );
}

export default function CoachClients() {
  const { token, previewUserType } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Clients</h1>
          <p className="ara-page-sub">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="ara-btn ara-btn-primary">+ Add Client</button>
      </div>

      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} onCreated={load} />}

      <div className="ara-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No clients yet.</div>
        ) : (
          clients.map(client => (
            <div key={client.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3A7AA0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {client.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{client.user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{client.user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {client.trainingPlans?.length > 0 && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active plan</span>}
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: client.status === 'active' ? '#dcfce7' : '#f1f5f9', color: client.status === 'active' ? '#166534' : '#64748b' }}>
                  {client.status}
                </span>
                <button
                  type="button"
                  onClick={() => { previewUserType('client', client.id); navigate('/client'); }}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: 6, background: '#3A7AA0', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  View as Client
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
