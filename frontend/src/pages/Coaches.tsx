import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface Coach {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialisation?: string | null;
  isPlacement: boolean;
  placements: { id: string; school: { name: string } }[];
  bookings: { id: string }[];
  assessments: { id: string }[];
}

const SPECIALISATIONS = ['FMS', 'PE', 'Nutrition', 'Movement', 'GAA', 'Soccer', 'Athletics', 'Other'];

const empty = { name: '', email: '', phone: '', specialisation: '', isPlacement: false };

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const COLOURS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
function colour(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLOURS[h % COLOURS.length];
}

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Coach[]>('/coaches');
      setCoaches(data);
    } catch {
      setError('Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  };

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
      if (editing) {
        await api.put(`/coaches/${editing.id}`, payload);
      } else {
        await api.post('/coaches', payload);
      }
      setShowModal(false);
      load();
    } catch {
      setError('Failed to save coach');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/coaches/${deleteId}`);
      setDeleteId(null);
      load();
    } catch {
      setError('Failed to delete coach');
    }
  };

  const visible = coaches.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.specialisation ?? '').toLowerCase().includes(q);
  });

  const deleteTarget = coaches.find(c => c.id === deleteId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coaches</h1>
          <p className="text-slate-500 text-sm mt-0.5">{coaches.length} coach{coaches.length !== 1 ? 'es' : ''} registered</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Add Coach
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email, or specialisation…"
        className="w-full mb-5 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">🏃</div>
            <p className="text-slate-500 text-sm">{search ? 'No coaches match your search' : 'No coaches yet — add one to get started'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coach</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Specialisation</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Activity</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${colour(c.name)} text-white flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                        {initials(c.name)}
                      </div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{c.email}</p>
                    {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    {c.specialisation
                      ? <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">{c.specialisation}</span>
                      : <span className="text-slate-400 text-sm italic">General</span>}
                  </td>
                  <td className="px-6 py-4">
                    {c.isPlacement
                      ? <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">Placement</span>
                      : <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Coach</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex gap-3">
                      <span>{c.bookings.length} booking{c.bookings.length !== 1 ? 's' : ''}</span>
                      <span>{c.assessments.length} assessment{c.assessments.length !== 1 ? 's' : ''}</span>
                    </div>
                    {c.placements.length > 0 && (
                      <div className="mt-0.5 text-slate-400">
                        {c.placements.map(p => p.school.name).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="text-sm text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                      <button onClick={() => setDeleteId(c.id)} className="text-sm text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">{editing ? 'Edit Coach' : 'Add Coach'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Coach name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="coach@activeroots.ie" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="087 XXX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialisation <span className="text-slate-400 font-normal">(optional)</span></label>
              <select value={form.specialisation} onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">General</option>
                {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, isPlacement: !f.isPlacement }))}
                className={`relative w-11 h-6 rounded-full transition ${form.isPlacement ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPlacement ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm text-slate-700">Placement student</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add coach'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Delete coach?</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{deleteTarget?.name}</strong> will be permanently removed along with their placement records.
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
