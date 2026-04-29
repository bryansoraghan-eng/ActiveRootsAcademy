import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingGoal } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function ClientDashboard() {
  const { token, user, previewClientId } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [goals, setGoals] = useState<CoachingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';

  useEffect(() => {
    Promise.all([
      fetch(`${API}/coaching/clients/me${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/coaching/goals${cq}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([p, g]) => { setProfile(p); setGoals(g); }).finally(() => setLoading(false));
  }, [token, cq]);

  const activePlan = (profile?.trainingPlans as Record<string, unknown>[] | undefined)?.[0] as Record<string, unknown> | undefined;
  const target = (profile?.nutritionTargets as Record<string, unknown>[] | undefined)?.[0] as Record<string, unknown> | undefined;

  if (loading) return <div className="ara-page" style={{ color: '#94a3b8' }}>Loading…</div>;

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="ara-page-sub">Here's your overview</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/client/training" style={{ textDecoration: 'none' }}>
          <div className="ara-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3A7AA0' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Current Plan</div>
            <div style={{ fontWeight: 700, color: '#3A7AA0' }}>{activePlan?.name ?? 'No plan yet'}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{activePlan?.days?.length ?? 0} training days</div>
          </div>
        </Link>
        <Link to="/client/nutrition" style={{ textDecoration: 'none' }}>
          <div className="ara-card" style={{ padding: '1.25rem', borderLeft: '3px solid #22c55e' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Daily Target</div>
            <div style={{ fontWeight: 700, color: '#166534' }}>{target ? `${target.calories} kcal` : 'Not set'}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{target ? `P: ${target.protein}g · C: ${target.carbs}g · F: ${target.fats}g` : 'Ask your coach'}</div>
          </div>
        </Link>
        <Link to="/client/checkins" style={{ textDecoration: 'none' }}>
          <div className="ara-card" style={{ padding: '1.25rem', borderLeft: '3px solid #C4703F' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Weekly Check-in</div>
            <div style={{ fontWeight: 700, color: '#C4703F' }}>Submit Check-in</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Track your progress</div>
          </div>
        </Link>
      </div>

      {/* Active Goals */}
      {goals.filter(g => g.status === 'active').length > 0 && (
        <div className="ara-card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Your Goals</div>
          {goals.filter(g => g.status === 'active').map(goal => {
            const pct = Math.min(100, Math.round(((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
            return (
              <div key={goal.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>{goal.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#C4703F', borderRadius: 999, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>{pct}% complete</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Today's training */}
      {activePlan && (
        <div className="ara-card" style={{ marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Training Plan: {activePlan.name}</span>
            <Link to="/client/training" style={{ fontSize: '0.8rem', color: '#C4703F', textDecoration: 'none' }}>View full plan</Link>
          </div>
          {(activePlan as { days?: { id: string; name: string; exercises?: unknown[] }[] }).days?.slice(0, 3).map((day) => (
            <div key={day.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{day.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{day.exercises?.length ?? 0} exercises</div>
              </div>
              <Link to="/client/training" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: 6, background: '#C4703F', color: '#fff', textDecoration: 'none' }}>Start</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
