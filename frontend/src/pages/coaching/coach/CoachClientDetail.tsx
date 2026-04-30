import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CoachClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState<CoachingClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/coaching/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : r.json().then((d: { error: string }) => { throw new Error(d.error); }))
      .then(setClient)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="ara-page"><div style={{ color: '#94a3b8', padding: '2rem' }}>Loading…</div></div>;
  if (error || !client) return <div className="ara-page"><div style={{ color: '#ef4444', padding: '2rem' }}>{error || 'Client not found'}</div></div>;

  const activePlan = client.trainingPlans?.find(p => p.isActive) ?? client.trainingPlans?.[0];
  const latestNutrition = client.nutritionTargets?.[0];
  const recentCheckins = client.checkIns?.slice(0, 3) ?? [];
  const recentPrs = client.personalRecords?.slice(0, 8) ?? [];
  const activeGoals = client.clientGoals?.filter(g => g.status !== 'completed') ?? [];

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => navigate('/coaching/clients')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="ara-page-title">{client.user?.name}</h1>
            <p className="ara-page-sub">{client.user?.email}</p>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 999, background: client.status === 'active' ? '#dcfce7' : '#f1f5f9', color: client.status === 'active' ? '#166534' : '#64748b' }}>
          {client.status}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Age', value: client.age ? `${client.age} yrs` : '—' },
          { label: 'Starting weight', value: client.startingWeight ? `${client.startingWeight} kg` : '—' },
          { label: 'Height', value: client.height ? `${client.height} cm` : '—' },
          { label: 'Check-ins', value: String(client.checkIns?.length ?? 0) },
        ].map(s => (
          <div key={s.label} className="ara-card" style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Goals */}
          <div className="ara-card">
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Goals</div>
            {activeGoals.length === 0 ? (
              <div style={{ padding: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>No active goals</div>
            ) : activeGoals.map(goal => {
              const pct = Math.min(100, Math.round(((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
              return (
                <div key={goal.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{goal.title}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#C4703F', borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>{pct}%</div>
                </div>
              );
            })}
          </div>

          {/* Nutrition targets */}
          {latestNutrition && (
            <div className="ara-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Nutrition Targets</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: 'Calories', value: `${latestNutrition.calories} kcal` },
                  { label: 'Protein', value: `${latestNutrition.protein}g` },
                  { label: 'Carbs', value: `${latestNutrition.carbs}g` },
                  { label: 'Fats', value: `${latestNutrition.fats}g` },
                  { label: 'Water', value: `${latestNutrition.water}L` },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent check-ins */}
          {recentCheckins.length > 0 && (
            <div className="ara-card">
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Recent Check-ins</div>
              {recentCheckins.map(ci => (
                <div key={ci.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ci.date}</span>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                    {ci.energyLevel != null && <span>⚡ {ci.energyLevel}/10</span>}
                    {ci.sleepQuality != null && <span>😴 {ci.sleepQuality}/10</span>}
                    {ci.mood != null && <span>😊 {ci.mood}/10</span>}
                    {ci.weight != null && <span style={{ color: '#C4703F', fontWeight: 600 }}>{ci.weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active training plan */}
          {activePlan ? (
            <div className="ara-card">
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{activePlan.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{activePlan.days?.length ?? 0} training days</div>
                </div>
                {activePlan.isActive && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: 999 }}>Active</span>}
              </div>
              {(activePlan.days ?? []).map(day => (
                <div key={day.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{day.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{DAYS[day.dayOfWeek]}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {(day.exercises ?? []).map(ex => (
                      <div key={ex.id} style={{ fontSize: '0.775rem', color: '#64748b' }}>
                        {ex.name} — {ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ara-card" style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>No training plan assigned</div>
          )}

          {/* Personal records */}
          {recentPrs.length > 0 && (
            <div className="ara-card">
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Personal Records</div>
              {recentPrs.map(pr => (
                <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 1.25rem', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{pr.exerciseName}</span>
                  <span style={{ color: '#C4703F', fontWeight: 600 }}>{pr.weight}kg × {pr.reps}</span>
                </div>
              ))}
            </div>
          )}

          {/* Goals text */}
          {client.goals && (
            <div className="ara-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Client Goals</div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{client.goals}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
