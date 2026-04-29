import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient, ProgressEntry, PersonalRecord, CoachingGoal } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

function LineChart({ data, label, color = '#C4703F' }: { data: number[]; label: string; color?: string }) {
  if (data.length < 2) return <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '1rem 0' }}>Not enough data</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 300; const h = 80;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * h} r="3" fill={color} />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
        <span>{min.toFixed(1)}</span><span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function CoachProgress() {
  const { token } = useAuth();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [goals, setGoals] = useState<CoachingGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ type: 'strength', title: '', startValue: '', targetValue: '', unit: 'kg', description: '' });
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  const [newGoalValue, setNewGoalValue] = useState('');

  useEffect(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients);
  }, [token]);

  useEffect(() => {
    if (!selectedClient) { setEntries([]); setPrs([]); setGoals([]); return; }
    setLoading(true);
    Promise.all([
      fetch(`${API}/coaching/progress?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/coaching/progress/prs?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/coaching/goals?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([e, p, g]) => { setEntries(e); setPrs(p); setGoals(g); }).finally(() => setLoading(false));
  }, [selectedClient, token]);

  const createGoal = async () => {
    if (!selectedClient || !goalForm.title || !goalForm.startValue || !goalForm.targetValue) return;
    const res = await fetch(`${API}/coaching/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ clientId: selectedClient, ...goalForm }),
    });
    const g = await res.json();
    setGoals(p => [g, ...p]);
    setGoalForm({ type: 'strength', title: '', startValue: '', targetValue: '', unit: 'kg', description: '' });
    setShowGoalForm(false);
  };

  const updateGoalProgress = async (goalId: string) => {
    if (!newGoalValue) return;
    const res = await fetch(`${API}/coaching/goals/${goalId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentValue: newGoalValue }),
    });
    const updated = await res.json();
    setGoals(p => p.map(g => g.id === goalId ? updated : g));
    setUpdatingGoal(null); setNewGoalValue('');
  };

  const weights = entries.filter(e => e.weight != null).map(e => e.weight!);

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Progress Analytics</h1>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <select aria-label="Select client" value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="ara-input" style={{ maxWidth: 280 }}>
          <option value="">— choose client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.user?.name}</option>)}
        </select>
      </div>

      {selectedClient && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Goals */}
          <div className="ara-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Goals</span>
              <button type="button" onClick={() => setShowGoalForm(v => !v)} className="ara-btn ara-btn-primary" style={{ fontSize: '0.8rem' }}>+ New Goal</button>
            </div>

            {showGoalForm && (
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'type', label: 'Type', type: 'select', options: ['strength', 'weight', 'nutrition', 'consistency'] },
                    { key: 'startValue', label: 'Start Value', type: 'number' },
                    { key: 'targetValue', label: 'Target Value', type: 'number' },
                    { key: 'unit', label: 'Unit', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '0.75rem', color: '#374151', display: 'block', marginBottom: '0.2rem' }}>{f.label}</label>
                      {f.type === 'select' ? (
                        <select aria-label={f.label} value={goalForm[f.key as keyof typeof goalForm]} onChange={e => setGoalForm(p => ({ ...p, [f.key]: e.target.value }))} className="ara-input" style={{ width: '100%' }}>
                          {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={f.type} value={goalForm[f.key as keyof typeof goalForm]} onChange={e => setGoalForm(p => ({ ...p, [f.key]: e.target.value }))} className="ara-input" style={{ width: '100%' }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="button" onClick={createGoal} className="ara-btn ara-btn-primary">Create Goal</button>
                  <button type="button" onClick={() => setShowGoalForm(false)} className="ara-btn ara-btn-ghost">Cancel</button>
                </div>
              </div>
            )}

            {goals.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No goals set yet</div>
            ) : (
              goals.map(goal => {
                const pct = Math.min(100, Math.round(((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
                return (
                  <div key={goal.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{goal.title}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 999, background: goal.status === 'completed' ? '#dcfce7' : '#fef3e9', color: goal.status === 'completed' ? '#166534' : '#92400e' }}>{goal.type}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: goal.status === 'completed' ? '#22c55e' : '#C4703F', borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>{pct}% complete</span>
                      {goal.status !== 'completed' && (
                        updatingGoal === goal.id ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input type="number" value={newGoalValue} onChange={e => setNewGoalValue(e.target.value)} className="ara-input" style={{ width: 80, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} placeholder="New value" />
                            <button type="button" onClick={() => updateGoalProgress(goal.id)} style={{ fontSize: '0.7rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
                            <button type="button" onClick={() => { setUpdatingGoal(null); setNewGoalValue(''); }} style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setUpdatingGoal(goal.id)} style={{ fontSize: '0.7rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer' }}>Update progress</button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Weight chart */}
          {weights.length > 0 && (
            <div className="ara-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Weight Over Time</h3>
              <LineChart data={weights} label="Weight (kg)" />
            </div>
          )}

          {/* PRs */}
          {prs.length > 0 && (
            <div className="ara-card">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Personal Records</div>
              {prs.slice(0, 10).map(pr => (
                <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 1.25rem', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{pr.exerciseName}</span>
                  <span style={{ color: '#C4703F', fontWeight: 600 }}>{pr.weight}kg × {pr.reps}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
