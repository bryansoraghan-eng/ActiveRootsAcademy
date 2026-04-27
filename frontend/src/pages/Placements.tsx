import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface Coach { id: string; name: string; email: string; }
interface School { id: string; name: string; }
interface Placement {
  id: string;
  hours: number;
  notes?: string | null;
  coach: Coach;
  coachId: string;
  school: School;
  schoolId: string;
}

const emptyForm = { coachId: '', schoolId: '', hours: '0', notes: '' };

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLOURS = ['ara-avatar-blue', 'ara-avatar-sage', 'ara-avatar-clay', 'ara-avatar-neutral'];
function avatarClass(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

export default function Placements() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Placement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [pl, co, sc] = await Promise.all([
        api.get<Placement[]>('/placements'),
        api.get<Coach[]>('/coaches'),
        api.get<School[]>('/schools'),
      ]);
      setPlacements(pl); setCoaches(co); setSchools(sc);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

   
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (p: Placement) => {
    setEditing(p);
    setForm({ coachId: p.coachId, schoolId: p.schoolId, hours: String(p.hours), notes: p.notes ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, hours: parseInt(form.hours), notes: form.notes || undefined };
      if (editing) {
        await api.put(`/placements/${editing.id}`, { hours: payload.hours, notes: payload.notes });
      } else {
        await api.post('/placements', payload);
      }
      setShowModal(false); load();
    } catch { setError('Failed to save placement'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/placements/${deleteId}`); setDeleteId(null); load(); }
    catch { setError('Failed to delete placement'); }
  };

  const totalHours = placements.reduce((sum, p) => sum + p.hours, 0);
  const deleteTarget = placements.find(p => p.id === deleteId);

  const byCoach = coaches
    .map(c => ({ ...c, items: placements.filter(p => p.coachId === c.id) }))
    .filter(c => c.items.length > 0);

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Placements</h1>
          <p className="ara-page-subtitle">
            {placements.length} placement{placements.length !== 1 ? 's' : ''} · {totalHours} total hours logged
          </p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ Add Placement</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        {byCoach.length > 0 && (
          <div className="ara-placement-cards">
            {byCoach.map(c => (
              <div key={c.id} className="ara-placement-card">
                <div className={`ara-avatar ara-avatar-md ${avatarClass(c.name)}`}>{initials(c.name)}</div>
                <div className="ara-placement-card-info">
                  <div className="ara-td-strong">{c.name}</div>
                  <div className="ara-td-sub">
                    {c.items.length} school{c.items.length !== 1 ? 's' : ''} · {c.items.reduce((s, p) => s + p.hours, 0)} hrs
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : placements.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">No placements yet — assign a coach to a school to get started.</div>
          </div>
        ) : (
          <div className="ara-table-wrap">
            <table className="ara-table">
              <thead>
                <tr>
                  <th className="ara-th">Coach</th>
                  <th className="ara-th">School</th>
                  <th className="ara-th">Hours</th>
                  <th className="ara-th">Notes</th>
                  <th className="ara-th" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {placements.map(p => (
                  <tr key={p.id} className="ara-tr">
                    <td className="ara-td">
                      <div className="ara-name-cell">
                        <div className={`ara-avatar ara-avatar-md ${avatarClass(p.coach.name)}`}>{initials(p.coach.name)}</div>
                        <div>
                          <div className="ara-td-strong">{p.coach.name}</div>
                          <div className="ara-td-sub">{p.coach.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ara-td ara-td-strong">{p.school.name}</td>
                    <td className="ara-td">
                      <span className="ara-tag ara-tag-brand">{p.hours} hrs</span>
                    </td>
                    <td className="ara-td ara-td-sub ara-td-truncate">
                      {p.notes ?? '—'}
                    </td>
                    <td className="ara-td">
                      <div className="ara-row-actions">
                        <button type="button" className="ara-row-action" onClick={() => openEdit(p)}>Edit</button>
                        <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Placement' : 'Add Placement'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {!editing && (
              <>
                <div className="ara-form-group">
                  <label className="ara-form-label" htmlFor="placement-coach">Coach</label>
                  <select id="placement-coach" required value={form.coachId}
                    onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))} className="ara-form-select">
                    <option value="">Select coach…</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="ara-form-group">
                  <label className="ara-form-label" htmlFor="placement-school">School</label>
                  <select id="placement-school" required value={form.schoolId}
                    onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} className="ara-form-select">
                    <option value="">Select school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </>
            )}
            {editing && (
              <div className="ara-info-block">
                <strong>{editing.coach.name}</strong> at <strong>{editing.school.name}</strong>
              </div>
            )}
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="placement-hours">Hours logged</label>
              <input id="placement-hours" type="number" min="0" value={form.hours}
                onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="ara-field-input" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="placement-notes">Notes <span className="ara-td-sub">(optional)</span></label>
              <textarea id="placement-notes" value={form.notes} rows={2}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="ara-field-textarea" placeholder="Any notes about this placement…" />
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add placement'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete placement?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            <strong>{deleteTarget?.coach.name}</strong> at <strong>{deleteTarget?.school.name}</strong> will be permanently removed.
          </p>
          <div className="ara-form-footer">
            <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button type="button" className="ara-btn ara-btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
