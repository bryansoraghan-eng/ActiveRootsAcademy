import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingGoal, ProgressEntry, PersonalRecord } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

function LineChart({ data, label, color = '#C4703F', unit = '' }: { data: { date: string; value: number }[]; label: string; color?: string; unit?: string }) {
  if (data.length < 2) return <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem 0' }}>Not enough data yet</div>;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 400; const h = 100;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / range) * (h - 10) - 5}`).join(' ');
  return (
    <div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100, display: 'block' }}>
        <defs><linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.15" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g-${label})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((d.value - min) / range) * (h - 10) - 5} r="4" fill={color} stroke="#fff" strokeWidth="2" />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
        <span>{data[0].date}</span>
        <span style={{ color, fontWeight: 600 }}>{data[data.length - 1].value}{unit}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}

export default function ClientProgress() {
  const { token, previewClientId } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [goals, setGoals] = useState<CoachingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';

  useEffect(() => {
    Promise.all([
      fetch(`${API}/coaching/progress${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/coaching/progress/prs${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/coaching/goals${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([e, p, g]) => { setEntries(e); setPrs(p); setGoals(g); }).finally(() => setLoading(false));
  }, [token, cq]);

  if (loading) return <div className="ara-page" style={{ color: '#94a3b8' }}>Loading…</div>;

  const weights = entries.filter(e => e.weight != null).map(e => ({ date: e.date, value: e.weight! }));
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  // Group PRs by exercise name
  const prByExercise: Record<string, PersonalRecord> = {};
  prs.forEach(pr => {
    if (!prByExercise[pr.exerciseName] || pr.weight > prByExercise[pr.exerciseName].weight) prByExercise[pr.exerciseName] = pr;
  });

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Progress</h1>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="ara-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Active Goals</div>
          {activeGoals.map(goal => {
            const pct = Math.min(100, Math.round(((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
            return (
              <div key={goal.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{goal.title}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#fef3e9', color: '#92400e', padding: '0.15rem 0.4rem', borderRadius: 999 }}>{goal.type}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: '0.35rem' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#22c55e' : '#C4703F', borderRadius: 999, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{pct}% complete{goal.deadline ? ` · Due ${new Date(goal.deadline).toLocaleDateString()}` : ''}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weight chart */}
      {weights.length > 0 && (
        <div className="ara-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <LineChart data={weights} label="Weight Over Time" color="#3A7AA0" unit="kg" />
        </div>
      )}

      {/* PRs */}
      {Object.keys(prByExercise).length > 0 && (
        <div className="ara-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Personal Records</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0' }}>
            {Object.values(prByExercise).map((pr) => (
              <div key={pr.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f8fafc', borderRight: '1px solid #f8fafc' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{pr.exerciseName}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#C4703F' }}>{pr.weight}kg</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pr.reps} reps · {pr.loggedAt ? new Date(pr.loggedAt).toLocaleDateString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="ara-card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Completed Goals</div>
          {completedGoals.map(goal => (
            <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{goal.title}</span>
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 999 }}>✓ Completed</span>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && prs.length === 0 && goals.length === 0 && (
        <div className="ara-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Start training and logging check-ins to see your progress here.
        </div>
      )}
    </div>
  );
}
