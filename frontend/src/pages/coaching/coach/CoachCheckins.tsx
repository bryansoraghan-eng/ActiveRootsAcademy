import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { CoachingClient, CheckIn } from '../../../types/coaching';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function CoachCheckins() {
  const { token } = useAuth();
  const [clients, setClients] = useState<CoachingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch(`${API}/coaching/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setClients);
  }, [token]);

  useEffect(() => {
    if (!selectedClient) { setCheckins([]); return; }
    setLoading(true);
    fetch(`${API}/coaching/checkins?clientId=${selectedClient}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCheckins).finally(() => setLoading(false));
  }, [selectedClient, token]);

  const saveNote = async (id: string) => {
    await fetch(`${API}/coaching/checkins/${id}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes: noteText }),
    });
    setCheckins(p => p.map(c => c.id === id ? { ...c, notes: noteText } : c));
    setEditingNote(null); setNoteText('');
  };

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <h1 className="ara-page-title">Check-ins</h1>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <select aria-label="Select client" value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="ara-input" style={{ maxWidth: 280 }}>
          <option value="">— choose client —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.user?.name}</option>)}
        </select>
      </div>

      {selectedClient && (
        loading ? <div style={{ color: '#94a3b8' }}>Loading…</div> :
        checkins.length === 0 ? (
          <div className="ara-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No check-ins yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkins.map(ci => (
              <div key={ci.id} className="ara-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700 }}>{ci.date}</span>
                  {ci.weight && <span style={{ fontWeight: 600, color: '#C4703F' }}>{ci.weight} kg</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[
                    { label: 'Energy', value: ci.energyLevel },
                    { label: 'Sleep', value: ci.sleepQuality },
                    { label: 'Mood', value: ci.mood },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{m.label}</div>
                      <div style={{ fontWeight: 600 }}>{m.value ?? '—'}<span style={{ fontWeight: 400, color: '#94a3b8' }}>/10</span></div>
                    </div>
                  ))}
                </div>
                {editingNote === ci.id ? (
                  <div>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="ara-input" rows={3} style={{ width: '100%', resize: 'vertical', marginBottom: '0.5rem' }} placeholder="Leave a note for the client…" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => saveNote(ci.id)} className="ara-btn ara-btn-primary" style={{ fontSize: '0.8rem' }}>Save Note</button>
                      <button type="button" onClick={() => { setEditingNote(null); setNoteText(''); }} className="ara-btn ara-btn-ghost" style={{ fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {ci.notes && (
                    <div className="ara-coach-note">
                      <div className="ara-coach-note-label">Coach note</div>
                      {ci.notes}
                    </div>
                  )}
                    <button type="button" onClick={() => { setEditingNote(ci.id); setNoteText(ci.notes ?? ''); }} style={{ fontSize: '0.8rem', color: '#C4703F', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {ci.notes ? 'Edit note' : '+ Add note'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
