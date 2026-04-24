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
      setPlacements(pl);
      setCoaches(co);
      setSchools(sc);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

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
      setShowModal(false);
      load();
    } catch { setError('Failed to save placement'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/placements/${deleteId}`);
      setDeleteId(null);
      load();
    } catch { setError('Failed to delete placement'); }
  };

  const totalHours = placements.reduce((sum, p) => sum + p.hours, 0);
  const deleteTarget = placements.find(p => p.id === deleteId);

  // Group by coach for summary cards
  const byCoach = coaches
    .map(c => ({ ...c, items: placements.filter(p => p.coachId === c.id) }))
    .filter(c => c.items.length > 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placements</h1>
          <p className="text-slate-500 text-sm mt-0.5">{placements.length} placement{placements.length !== 1 ? 's' : ''} · {totalHours} total hours logged</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Add Placement
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Summary cards by coach */}
      {byCoach.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {byCoach.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {initials(c.name)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                <p className="text-xs text-slate-500">{c.items.length} school{c.items.length !== 1 ? 's' : ''} · {c.items.reduce((s, p) => s + p.hours, 0)} hrs</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : placements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">🏫</div>
            <p className="text-slate-500 text-sm">No placements yet — assign a coach to a school to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coach</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">School</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Notes</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {placements.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {initials(p.coach.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.coach.name}</p>
                        <p className="text-xs text-slate-400">{p.coach.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{p.school.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">{p.hours}</span>
                    <span className="text-xs text-slate-400 ml-1">hrs</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{p.notes ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-sm text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                      <button onClick={() => setDeleteId(p.id)} className="text-sm text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">{editing ? 'Edit Placement' : 'Add Placement'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Coach</label>
                  <select required value={form.coachId} onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select coach…</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
                  <select required value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </>
            )}
            {editing && (
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600">
                <strong>{editing.coach.name}</strong> at <strong>{editing.school.name}</strong>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hours logged</label>
              <input type="number" min="0" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any notes about this placement…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add placement'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-red-600 text-xl">!</span></div>
            <h3 className="font-semibold text-slate-800 mb-2">Delete placement?</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{deleteTarget?.coach.name}</strong> at <strong>{deleteTarget?.school.name}</strong> will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
