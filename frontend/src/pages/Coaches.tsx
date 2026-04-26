import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface Coach {
  id: string; name: string; email: string; phone?: string | null;
  specialisation?: string | null; isPlacement: boolean;
  placements: { id: string; school: { name: string } }[];
  bookings: { id: string }[];
  assessments: { id: string }[];
}

const SPECIALISATIONS = ['FMS', 'PE', 'Nutrition', 'Movement', 'GAA', 'Soccer', 'Athletics', 'Other'];
const empty = { name: '', email: '', phone: '', specialisation: '', isPlacement: false };

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLOURS = ['ara-avatar-blue', 'ara-avatar-sage', 'ara-avatar-clay', 'ara-avatar-neutral'];
function avatarClass(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`ara-toggle${checked ? ' ara-toggle-on' : ''}`}>
      <span className="ara-toggle-thumb" />
    </button>
  );
}

export default function Coaches() {
  const [coaches, setCoaches]   = useState<Coach[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Coach | null>(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try { const data = await api.get<Coach[]>('/coaches'); setCoaches(data); }
    catch { setError('Failed to load coaches'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };

  const openEdit = (c: Coach) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? '', specialisation: c.specialisation ?? '', isPlacement: c.isPlacement });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, phone: form.phone || undefined, specialisation: form.specialisation || undefined };
      if (editing) { await api.put(`/coaches/${editing.id}`, payload); }
      else         { await api.post('/coaches', payload); }
      setShowModal(false);
      load();
    } catch { setError('Failed to save coach'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/coaches/${deleteId}`); setDeleteId(null); load(); }
    catch { setError('Failed to delete coach'); }
  };

  const visible = coaches.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.specialisation ?? '').toLowerCase().includes(q);
  });

  const deleteTarget = coaches.find(c => c.id === deleteId);

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Coaches</h1>
          <p className="ara-page-subtitle">{coaches.length} coach{coaches.length !== 1 ? 'es' : ''} registered</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ Add Coach</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        <div className="ara-toolbar">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or specialisation…" className="ara-search" />
        </div>

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : visible.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">{search ? 'No coaches match your search.' : 'No coaches yet — add one to get started.'}</div>
          </div>
        ) : (
          <div className="ara-table-wrap">
            <table className="ara-table">
              <thead>
                <tr>
                  <th className="ara-th">Coach</th>
                  <th className="ara-th">Contact</th>
                  <th className="ara-th">Specialisation</th>
                  <th className="ara-th">Type</th>
                  <th className="ara-th">Activity</th>
                  <th className="ara-th" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(c => (
                  <tr key={c.id} className="ara-tr">
                    <td className="ara-td">
                      <div className="ara-name-cell">
                        <div className={`ara-avatar ara-avatar-md ${avatarClass(c.name)}`}>{initials(c.name)}</div>
                        <span className="ara-td-strong">{c.name}</span>
                      </div>
                    </td>
                    <td className="ara-td">
                      <div>{c.email}</div>
                      {c.phone && <div className="ara-td-sub">{c.phone}</div>}
                    </td>
                    <td className="ara-td">
                      {c.specialisation
                        ? <span className="ara-tag ara-tag-sage">{c.specialisation}</span>
                        : <span className="ara-td-sub">General</span>}
                    </td>
                    <td className="ara-td">
                      {c.isPlacement
                        ? <span className="ara-tag ara-tag-sand">Placement</span>
                        : <span className="ara-tag ara-tag-brand">Coach</span>}
                    </td>
                    <td className="ara-td ara-td-sub">
                      <div>{c.bookings.length} booking{c.bookings.length !== 1 ? 's' : ''} · {c.assessments.length} assessment{c.assessments.length !== 1 ? 's' : ''}</div>
                      {c.placements.length > 0 && <div>{c.placements.map(p => p.school.name).join(', ')}</div>}
                    </td>
                    <td className="ara-td">
                      <div className="ara-row-actions">
                        <button type="button" className="ara-row-action" onClick={() => openEdit(c)}>Edit</button>
                        <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(c.id)}>Delete</button>
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
        <Modal title={editing ? 'Edit Coach' : 'Add Coach'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="coach-name">Full name</label>
              <input id="coach-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="ara-field-input" placeholder="Coach name" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="coach-email">Email</label>
              <input id="coach-email" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="ara-field-input" placeholder="coach@activeroots.ie" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="coach-phone">Phone <span className="ara-td-sub">(optional)</span></label>
              <input id="coach-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="ara-field-input" placeholder="087 XXX XXXX" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="coach-spec">Specialisation <span className="ara-td-sub">(optional)</span></label>
              <select id="coach-spec" value={form.specialisation} onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))} className="ara-form-select">
                <option value="">General</option>
                {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ara-toggle-row">
              <Toggle checked={form.isPlacement} onChange={v => setForm(f => ({ ...f, isPlacement: v }))} />
              <span>Placement student</span>
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add coach'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete coach?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            <strong>{deleteTarget?.name}</strong> will be permanently removed along with their placement records.
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
