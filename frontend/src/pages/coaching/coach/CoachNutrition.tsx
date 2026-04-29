import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient, NutritionTarget, NutritionLog } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function CoachNutrition() {
  const { token } = useAuth();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [targets, setTargets] = useState<NutritionTarget[]>([]);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [form, setForm] = useState({ calories: '', protein: '', carbs: '', fats: '', water: '2.5', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients);
  }, [token]);

  useEffect(() => {
    if (!selectedClient) { setTargets([]); setLogs([]); return; }
    fetch(`${API}/coaching/nutrition/targets/${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setTargets);
    fetch(`${API}/coaching/nutrition/logs?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLogs);
  }, [selectedClient, token]);

  const saveTarget = async () => {
    if (!selectedClient || !form.calories || !form.protein || !form.carbs || !form.fats) {
      setError('All macro fields required'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/coaching/nutrition/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientId: selectedClient, ...form }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const t = await res.json();
      setTargets(p => [t, ...p]);
      setForm({ calories: '', protein: '', carbs: '', fats: '', water: '2.5', notes: '' });
    } finally { setSaving(false); }
  };

  const current = targets[0];
  const last7 = logs.slice(0, 7);

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Nutrition Tracking</h1>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Select Client</label>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="ara-input" style={{ maxWidth: 280 }}>
          <option value="">— choose client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.user?.name}</option>)}
        </select>
      </div>

      {selectedClient && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Set targets */}
          <div className="ara-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Set Targets</h3>
            {current && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>Current targets</div>
                <div style={{ color: '#64748b' }}>{current.calories} kcal · {current.protein}g protein · {current.carbs}g carbs · {current.fats}g fats · {current.water}L water</div>
              </div>
            )}
            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem', borderRadius: 6, marginBottom: '0.75rem', fontSize: '0.8rem' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { key: 'calories', label: 'Calories (kcal)' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fats', label: 'Fats (g)' },
                { key: 'water', label: 'Water (L)' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.75rem', color: '#374151', display: 'block', marginBottom: '0.2rem' }}>{f.label}</label>
                  <input type="number" value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="ara-input" style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.75rem', color: '#374151', display: 'block', marginBottom: '0.2rem' }}>Notes</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="ara-input" style={{ width: '100%' }} />
              </div>
            </div>
            <button onClick={saveTarget} disabled={saving} className="ara-btn ara-btn-primary" style={{ marginTop: '0.75rem', width: '100%' }}>
              {saving ? 'Saving…' : 'Set Targets'}
            </button>
          </div>

          {/* Client logs */}
          <div className="ara-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>Recent Logs (last 7 days)</div>
            {logs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No logs yet</div>
            ) : (
              last7.map(log => (
                <div key={log.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.date}</span>
                    <span style={{ fontSize: '0.875rem', color: current && log.calories >= current.calories * 0.9 ? '#166534' : '#94a3b8' }}>{log.calories} kcal</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    P: {log.protein}g · C: {log.carbs}g · F: {log.fats}g · Water: {log.water}L
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
