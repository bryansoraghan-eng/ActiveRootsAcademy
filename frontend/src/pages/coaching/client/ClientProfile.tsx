import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function ClientProfile() {
  const { token, user, previewClientId } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ age: '', startingWeight: '', height: '', goals: '' });
  const [saving, setSaving] = useState(false);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';

  useEffect(() => {
    fetch(`${API}/coaching/clients/me${cq}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        setProfile(p);
        if (p) setForm({ age: p.age ?? '', startingWeight: p.startingWeight ?? '', height: p.height ?? '', goals: p.goals ?? '' });
      }).finally(() => setLoading(false));
  }, [token, cq]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const res = await fetch(`${API}/coaching/clients/${profile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { const p = await res.json(); setProfile(p); setEditing(false); }
    setSaving(false);
  };

  if (loading) return <div className="ara-page" style={{ color: '#94a3b8' }}>Loading…</div>;

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Profile</h1>
        {!editing && <button onClick={() => setEditing(true)} className="ara-btn ara-btn-ghost">Edit</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Account info */}
        <div className="ara-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Name</div>
              <div style={{ fontWeight: 500 }}>{user?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Email</div>
              <div style={{ fontWeight: 500 }}>{user?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Member since</div>
              <div style={{ fontWeight: 500 }}>{profile?.startDate ? new Date(profile.startDate as string).toLocaleDateString() : '—'}</div>
            </div>
          </div>
        </div>

        {/* Physical info */}
        <div className="ara-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Physical Info</h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'age', label: 'Age', type: 'number' },
                { key: 'startingWeight', label: 'Starting Weight (kg)', type: 'number' },
                { key: 'height', label: 'Height (cm)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.75rem', color: '#374151', display: 'block', marginBottom: '0.2rem' }}>{f.label}</label>
                  <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="ara-input" style={{ width: '100%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Age', value: profile?.age ? `${profile.age} yrs` : '—' },
                { label: 'Starting Weight', value: profile?.startingWeight ? `${profile.startingWeight} kg` : '—' },
                { label: 'Height', value: profile?.height ? `${profile.height} cm` : '—' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>{f.label}</div>
                  <div style={{ fontWeight: 500 }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="ara-card" style={{ padding: '1.25rem', gridColumn: '1/-1' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>My Goals</h3>
          {editing ? (
            <textarea value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} className="ara-input" rows={4} style={{ width: '100%', resize: 'vertical' }} placeholder="Describe your goals…" />
          ) : (
            <p style={{ color: profile?.goals ? '#374151' : '#94a3b8', lineHeight: 1.6 }}>{String(profile?.goals || 'No goals set yet')}</p>
          )}
        </div>
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setEditing(false)} className="ara-btn ara-btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="ara-btn ara-btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      )}
    </div>
  );
}
