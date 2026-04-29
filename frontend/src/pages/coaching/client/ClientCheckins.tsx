import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

interface Checkin {
  id: string;
  date: string;
  weight?: string | number | null;
  bodyFat?: string | number | null;
  energyLevel?: string | number | null;
  sleepQuality?: string | number | null;
  mood?: string | number | null;
  notes?: string | null;
  coachId?: string | null;
}

type SliderField = 'energyLevel' | 'sleepQuality' | 'mood';

interface SliderProps {
  field: SliderField;
  label: string;
  value: string;
  onChange: (field: SliderField, value: string) => void;
}

function Slider({ field, label, value, onChange }: SliderProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>{label}</label>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#C4703F' }}>{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={e => onChange(field, e.target.value)}
        style={{ width: '100%', accentColor: '#C4703F' }}
      />
    </div>
  );
}

export default function ClientCheckins() {
  const { token, previewClientId } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const cq = previewClientId ? `?clientId=${previewClientId}` : '';
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, weight: '', bodyFat: '', energyLevel: '5', sleepQuality: '5', mood: '5', notes: '' });

  useEffect(() => {
    fetch(`${API}/coaching/checkins${cq}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCheckins).finally(() => setLoading(false));
  }, [token, cq]);

  const handleSliderChange = (field: SliderField, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const save = async () => {
    setSaving(true); setSuccess(false);
    const res = await fetch(`${API}/coaching/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const ci = await res.json() as Checkin;
      setCheckins(p => [ci, ...p]);
      setForm({ date: today, weight: '', bodyFat: '', energyLevel: '5', sleepQuality: '5', mood: '5', notes: '' });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Check-ins</h1>
      </div>

      <div className="ara-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>New Check-in</h3>
        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>Check-in saved!</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="ara-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="ara-input" style={{ width: '100%' }} placeholder="e.g. 75.5" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Body Fat %</label>
            <input type="number" step="0.1" value={form.bodyFat} onChange={e => setForm(p => ({ ...p, bodyFat: e.target.value }))} className="ara-input" style={{ width: '100%' }} placeholder="Optional" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' }}>
          <Slider field="energyLevel" label="Energy Level" value={form.energyLevel} onChange={handleSliderChange} />
          <Slider field="sleepQuality" label="Sleep Quality" value={form.sleepQuality} onChange={handleSliderChange} />
          <Slider field="mood" label="Mood" value={form.mood} onChange={handleSliderChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="ara-input" rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="How are you feeling? Any observations…" />
        </div>

        <button onClick={save} disabled={saving} className="ara-btn ara-btn-primary" style={{ width: '100%' }}>
          {saving ? 'Saving…' : 'Submit Check-in'}
        </button>
      </div>

      {/* History */}
      <div className="ara-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>History</div>
        {loading ? <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</div> :
          checkins.length === 0 ? <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>No check-ins yet</div> :
          checkins.map(ci => (
            <div key={ci.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{ci.date}</span>
                {ci.weight && <span style={{ fontWeight: 600, color: '#C4703F' }}>{ci.weight} kg</span>}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                {ci.energyLevel && <span>Energy: {ci.energyLevel}/10</span>}
                {ci.sleepQuality && <span>Sleep: {ci.sleepQuality}/10</span>}
                {ci.mood && <span>Mood: {ci.mood}/10</span>}
              </div>
              {ci.notes && <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 6 }}>{ci.notes}</div>}
              {/* Coach note */}
              {ci.notes && ci.coachId && (
                <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '0.4rem', padding: '0.4rem 0.75rem', background: '#fef3e9', borderRadius: 6 }}>Coach: {ci.notes}</div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}
