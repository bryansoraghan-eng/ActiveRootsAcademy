import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function ClientNutrition() {
  const { token, previewClientId } = useAuth();
  const [target, setTarget] = useState<Record<string, number> | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [today, setToday] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ calories: '', protein: '', carbs: '', fats: '', water: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';

  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/coaching/nutrition/targets/me/current${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/coaching/nutrition/logs${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([t, l]) => {
      setTarget(t);
      setLogs(l);
      const todayLog = l.find((x: Record<string, unknown>) => x.date === todayDate);
      if (todayLog) {
        setToday(todayLog);
        setForm({ calories: String(todayLog.calories), protein: String(todayLog.protein), carbs: String(todayLog.carbs), fats: String(todayLog.fats), water: String(todayLog.water), notes: todayLog.notes ?? '' });
      }
    });
  }, [token, cq, todayDate]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`${API}/coaching/nutrition/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: todayDate, ...form }),
    });
    const log = await res.json();
    setToday(log);
    setLogs(prev => { const idx = prev.findIndex(x => x.date === todayDate); return idx >= 0 ? prev.map((x, i) => i === idx ? log : x) : [log, ...prev]; });
    setSaving(false);
  };

  const pct = (val: number, tgt: number) => tgt > 0 ? Math.min(100, Math.round((val / tgt) * 100)) : 0;

  const macros = [
    { key: 'calories', label: 'Calories', unit: 'kcal', color: '#C4703F', target: target?.calories },
    { key: 'protein', label: 'Protein', unit: 'g', color: '#3A7AA0', target: target?.protein },
    { key: 'carbs', label: 'Carbs', unit: 'g', color: '#22c55e', target: target?.carbs },
    { key: 'fats', label: 'Fats', unit: 'g', color: '#f59e0b', target: target?.fats },
    { key: 'water', label: 'Water', unit: 'L', color: '#06b6d4', target: target?.water },
  ];

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Nutrition</h1>
        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{todayDate}</span>
      </div>

      {/* Today's targets progress */}
      {target && today && (
        <div className="ara-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Today's Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {macros.map(m => {
              const val = parseFloat(form[m.key as keyof typeof form] || '0');
              const p = pct(val, m.target ?? 0);
              const remaining = (m.target ?? 0) - val;
              return (
                <div key={m.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500 }}>{m.label}</span>
                    <span style={{ color: '#64748b' }}>{val}{m.unit} / {m.target}{m.unit} <span style={{ color: remaining > 0 ? '#94a3b8' : '#22c55e' }}>({remaining > 0 ? `${remaining} remaining` : 'target hit!'})</span></span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: m.color, borderRadius: 999, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="ara-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Log Today</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {macros.map(m => (
            <div key={m.key}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>{m.label} ({m.unit})</label>
              <input type="number" step={m.key === 'water' ? '0.1' : '1'} value={form[m.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [m.key]: e.target.value }))} className="ara-input" style={{ width: '100%' }} placeholder="0" />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="ara-input" style={{ width: '100%' }} placeholder="Optional notes…" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="ara-btn ara-btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
          {saving ? 'Saving…' : today ? 'Update Log' : 'Save Log'}
        </button>
      </div>

      {/* Recent logs */}
      <div className="ara-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Recent History</div>
        {logs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No logs yet</div>
        ) : (
          logs.slice(0, 14).map(log => (
            <div key={log.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{log.date}</span>
                <span style={{ fontWeight: 600, color: '#C4703F' }}>{log.calories} kcal</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>P: {log.protein}g · C: {log.carbs}g · F: {log.fats}g · Water: {log.water}L</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
