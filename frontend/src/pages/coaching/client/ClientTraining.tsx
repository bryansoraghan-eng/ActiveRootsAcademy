import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { TrainingPlan } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClientTraining() {
  const { token, previewClientId } = useAuth();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [activeSession, setActiveSession] = useState<{ id: string; dayId: string } | null>(null);
  const [logs, setLogs] = useState<Record<string, { sets: { reps: number; weight: number }[] }>>({});
  const [prAlert, setPrAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';

  useEffect(() => {
    fetch(`${API}/coaching/training/plans${cq}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setPlans(data); if (data.length > 0) setSelectedPlan(data[0]); })
      .finally(() => setLoading(false));
  }, [token, cq]);

  const startSession = async (planId: string, dayId: string) => {
    const res = await fetch(`${API}/coaching/training/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planId, dayId }),
    });
    const session = await res.json();
    setActiveSession(session);
    setLogs({});
  };

  const logSet = (exerciseId: string, setIdx: number, field: 'reps' | 'weight', value: string) => {
    setLogs(prev => {
      const current = prev[exerciseId]?.sets ?? [];
      const updated = [...current];
      if (!updated[setIdx]) updated[setIdx] = { reps: 0, weight: 0 };
      updated[setIdx] = { ...updated[setIdx], [field]: parseFloat(value) || 0 };
      return { ...prev, [exerciseId]: { sets: updated } };
    });
  };

  const autoSave = async (exerciseId: string) => {
    if (!activeSession || !logs[exerciseId]) return;
    const res = await fetch(`${API}/coaching/training/sessions/${activeSession.id}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ exerciseId, sets: logs[exerciseId].sets }),
    });
    const data = await res.json();
    if (data.newPR) { setPrAlert(`New PR! ${data.prWeight}kg`); setTimeout(() => setPrAlert(null), 3000); }
  };

  const completeSession = async () => {
    if (!activeSession) return;
    setCompleting(true);
    await fetch(`${API}/coaching/training/sessions/${activeSession.id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes: '' }),
    });
    setActiveSession(null); setLogs({}); setCompleting(false);
  };

  if (loading) return <div className="ara-page" style={{ color: '#94a3b8' }}>Loading…</div>;

  if (plans.length === 0) return (
    <div className="ara-page">
      <h1 className="ara-page-title">Training</h1>
      <div className="ara-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', marginTop: '1rem' }}>Your coach hasn't set up a training plan yet.</div>
    </div>
  );

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Training</h1>
        {activeSession && (
          <button type="button" onClick={completeSession} disabled={completing} className="ara-btn ara-btn-primary" style={{ background: '#22c55e' }}>
            {completing ? 'Saving…' : '✓ Complete Session'}
          </button>
        )}
      </div>

      {prAlert && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#C4703F', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700, zIndex: 100, fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          🏆 {prAlert}
        </div>
      )}

      {plans.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {plans.map(p => (
            <button type="button" key={p.id} onClick={() => setSelectedPlan(p)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: 999, border: 'none', cursor: 'pointer', background: selectedPlan?.id === p.id ? '#C4703F' : '#f1f5f9', color: selectedPlan?.id === p.id ? '#fff' : '#374151', fontWeight: selectedPlan?.id === p.id ? 600 : 400, fontSize: '0.875rem' }}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {selectedPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(selectedPlan.days ?? []).map((day) => {
            const isActiveDay = activeSession?.dayId === day.id;
            return (
              <div key={day.id} className="ara-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{day.name}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>{DAYS[day.dayOfWeek]}</span>
                  </div>
                  {!activeSession ? (
                    <button type="button" onClick={() => startSession(selectedPlan.id, day.id)} className="ara-btn ara-btn-primary" style={{ fontSize: '0.8rem' }}>Start Session</button>
                  ) : isActiveDay ? (
                    <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>● Session Active</span>
                  ) : null}
                </div>

                {(day.exercises ?? []).map((ex, idx) => {
                  const exLog = logs[ex.id];
                  return (
                    <div key={ex.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{idx + 1}. {ex.name}</span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>{ex.sets} × {ex.reps}{ex.weight ? ` @ ${ex.weight}` : ''}{ex.rpe ? ` RPE ${ex.rpe}` : ''}</span>
                        </div>
                        {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#3A7AA0' }}>Watch demo</a>}
                      </div>

                      {isActiveDay && (
                        <div>
                          {Array.from({ length: ex.sets }).map((_, setIdx) => (
                            <div key={setIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 40 }}>Set {setIdx + 1}</span>
                              <input type="number" placeholder="Reps" value={exLog?.sets?.[setIdx]?.reps || ''} onChange={e => logSet(ex.id, setIdx, 'reps', e.target.value)} className="ara-input" style={{ width: 70, fontSize: '0.875rem' }} />
                              <input type="number" placeholder="kg" value={exLog?.sets?.[setIdx]?.weight || ''} onChange={e => logSet(ex.id, setIdx, 'weight', e.target.value)} className="ara-input" style={{ width: 70, fontSize: '0.875rem' }} />
                            </div>
                          ))}
                          <button type="button" onClick={() => autoSave(ex.id)} style={{ fontSize: '0.75rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>Save</button>
                        </div>
                      )}

                      {ex.notes && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{ex.notes}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
