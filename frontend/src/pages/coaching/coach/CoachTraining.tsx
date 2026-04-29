import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient, TrainingPlan, TrainingDay, Exercise } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CoachTraining() {
  const { token } = useAuth();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState({ name: '', dayOfWeek: 0 });
  const [showAddEx, setShowAddEx] = useState<string | null>(null);
  const [newEx, setNewEx] = useState({ name: '', sets: '3', reps: '10', weight: '', rpe: '', notes: '', videoUrl: '' });

  useEffect(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients);
  }, [token]);

  useEffect(() => {
    if (!selectedClient) { setPlans([]); setSelectedPlan(null); return; }
    setLoading(true);
    fetch(`${API}/coaching/training/plans?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setPlans(data); if (data.length > 0) setSelectedPlan(data[0]); })
      .finally(() => setLoading(false));
  }, [selectedClient, token]);

  const createPlan = async () => {
    if (!newPlanName || !selectedClient) return;
    const res = await fetch(`${API}/coaching/training/plans`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ clientId: selectedClient, name: newPlanName }),
    });
    const plan = await res.json();
    setPlans(p => [plan, ...p]);
    setSelectedPlan(plan);
    setNewPlanName(''); setShowNewPlan(false);
  };

  const addDay = async () => {
    if (!selectedPlan || !newDay.name) return;
    const res = await fetch(`${API}/coaching/training/plans/${selectedPlan.id}/days`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newDay, order: selectedPlan.days?.length ?? 0 }),
    });
    const day = await res.json();
    setSelectedPlan((p) => p ? { ...p, days: [...(p.days ?? []), day] } : p);
    setNewDay({ name: '', dayOfWeek: 0 }); setShowAddDay(false);
  };

  const addExercise = async (dayId: string) => {
    if (!newEx.name) return;
    const res = await fetch(`${API}/coaching/training/days/${dayId}/exercises`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newEx),
    });
    const ex = await res.json();
    setSelectedPlan((p) => p ? { ...p, days: (p.days ?? []).map((d) => d.id === dayId ? { ...d, exercises: [...(d.exercises ?? []), ex] } : d) } : p);
    setNewEx({ name: '', sets: '3', reps: '10', weight: '', rpe: '', notes: '', videoUrl: '' });
    setShowAddEx(null);
  };

  const deleteExercise = async (dayId: string, exId: string) => {
    await fetch(`${API}/coaching/training/exercises/${exId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setSelectedPlan((p) => p ? { ...p, days: (p.days ?? []).map((d) => d.id === dayId ? { ...d, exercises: (d.exercises ?? []).filter((e) => e.id !== exId) } : d) } : p);
  };

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Training Plans</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ara-card" style={{ padding: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Select Client</label>
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="ara-input" style={{ width: '100%' }}>
              <option value="">— choose client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.user?.name}</option>)}
            </select>
          </div>

          {selectedClient && (
            <div className="ara-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Plans</span>
                <button onClick={() => setShowNewPlan(true)} style={{ fontSize: '0.75rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer' }}>+ New</button>
              </div>
              {showNewPlan && (
                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <input value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="Plan name" className="ara-input" style={{ flex: 1, fontSize: '0.8rem' }} />
                  <button onClick={createPlan} className="ara-btn ara-btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Add</button>
                </div>
              )}
              {loading ? <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Loading…</div> :
                plans.map(plan => (
                  <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.625rem', borderRadius: 6, marginBottom: '0.25rem', background: selectedPlan?.id === plan.id ? '#fef3e9' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: selectedPlan?.id === plan.id ? 600 : 400, color: selectedPlan?.id === plan.id ? '#C4703F' : '#374151' }}>
                    {plan.name}
                    {plan.isActive && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: 999 }}>Active</span>}
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Right panel */}
        {selectedPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="ara-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedPlan.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedPlan.days?.length ?? 0} training days</div>
              </div>
              <button onClick={() => setShowAddDay(true)} className="ara-btn ara-btn-primary">+ Add Day</button>
            </div>

            {showAddDay && (
              <div className="ara-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input value={newDay.name} onChange={e => setNewDay(p => ({ ...p, name: e.target.value }))} placeholder="Day name (e.g. Push Day)" className="ara-input" style={{ flex: 1, minWidth: 160 }} />
                  <select value={newDay.dayOfWeek} onChange={e => setNewDay(p => ({ ...p, dayOfWeek: parseInt(e.target.value) }))} className="ara-input">
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                  <button onClick={addDay} className="ara-btn ara-btn-primary">Add</button>
                  <button onClick={() => setShowAddDay(false)} className="ara-btn ara-btn-ghost">Cancel</button>
                </div>
              </div>
            )}

            {(selectedPlan.days ?? []).map((day: TrainingDay) => (
              <div key={day.id} className="ara-card">
                <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{day.name}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>{DAYS[day.dayOfWeek]}</span>
                  </div>
                  <button onClick={() => setShowAddEx(day.id)} style={{ fontSize: '0.8rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer' }}>+ Exercise</button>
                </div>

                {showAddEx === day.id && (
                  <div style={{ padding: '0.75rem 1.25rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '0.5rem', alignItems: 'center' }}>
                      <input value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} placeholder="Exercise name" className="ara-input" />
                      <input value={newEx.sets} onChange={e => setNewEx(p => ({ ...p, sets: e.target.value }))} placeholder="Sets" className="ara-input" style={{ width: 60 }} type="number" />
                      <input value={newEx.reps} onChange={e => setNewEx(p => ({ ...p, reps: e.target.value }))} placeholder="Reps" className="ara-input" style={{ width: 80 }} />
                      <input value={newEx.weight} onChange={e => setNewEx(p => ({ ...p, weight: e.target.value }))} placeholder="Weight" className="ara-input" style={{ width: 80 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input value={newEx.rpe} onChange={e => setNewEx(p => ({ ...p, rpe: e.target.value }))} placeholder="RPE (1-10)" className="ara-input" style={{ width: 100 }} type="number" min="1" max="10" />
                      <input value={newEx.notes} onChange={e => setNewEx(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="ara-input" style={{ flex: 1 }} />
                      <button onClick={() => addExercise(day.id)} className="ara-btn ara-btn-primary">Add</button>
                      <button onClick={() => setShowAddEx(null)} className="ara-btn ara-btn-ghost">Cancel</button>
                    </div>
                  </div>
                )}

                <div>
                  {(day.exercises ?? []).length === 0 ? (
                    <div style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>No exercises yet</div>
                  ) : (
                    (day.exercises ?? []).map((ex: Exercise, i: number) => (
                      <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 20 }}>{i + 1}</span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ex.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {ex.sets} sets × {ex.reps} reps{ex.weight ? ` @ ${ex.weight}` : ''}{ex.rpe ? ` — RPE ${ex.rpe}` : ''}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteExercise(day.id, ex.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ara-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            {selectedClient ? 'Select or create a training plan' : 'Select a client to get started'}
          </div>
        )}
      </div>
    </div>
  );
}
