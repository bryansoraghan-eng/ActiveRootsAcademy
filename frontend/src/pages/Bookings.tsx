import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface School { id: string; name: string; }
interface Class { id: string; name: string; yearGroup: string; schoolId: string; }
interface Coach { id: string; name: string; }
interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  school: School;
  schoolId: string;
  class: { id: string; name: string; yearGroup: string };
  classId: string;
  programme: { id: string; name: string };
  programmeId: string;
  coach?: Coach | null;
  coachId?: string | null;
}

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const PROG_TYPES = ['fms', 'pe', 'nutrition', 'movement'];
const STATUS_COLOURS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const emptyForm = {
  schoolId: '', classId: '', programmeName: '', programmeType: 'fms', programmeDuration: '6',
  coachId: '', startDate: '', endDate: '', status: 'pending',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [bk, sc, cl, co] = await Promise.all([
        api.get<Booking[]>('/bookings'),
        api.get<School[]>('/schools'),
        api.get<Class[]>('/classes'),
        api.get<Coach[]>('/coaches'),
      ]);
      setBookings(bk);
      setSchools(sc);
      setClasses(cl);
      setCoaches(co);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const schoolClasses = classes.filter(c => c.schoolId === form.schoolId);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      schoolId: b.schoolId, classId: b.classId,
      programmeName: b.programme.name, programmeType: 'fms', programmeDuration: '6',
      coachId: b.coachId ?? '', startDate: b.startDate.slice(0, 10),
      endDate: b.endDate.slice(0, 10), status: b.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/bookings/${editing.id}`, {
          coachId: form.coachId || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        });
      } else {
        const prog = await api.post<{ id: string }>('/programmes', {
          name: form.programmeName,
          type: form.programmeType,
          duration: parseInt(form.programmeDuration),
          schoolId: form.schoolId,
        });
        await api.post('/bookings', {
          schoolId: form.schoolId,
          classId: form.classId,
          programmeId: prog.id,
          coachId: form.coachId || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        });
      }
      setShowModal(false);
      load();
    } catch { setError('Failed to save booking'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/bookings/${deleteId}`);
      setDeleteId(null);
      load();
    } catch { setError('Failed to delete booking'); }
  };

  const visible = bookings.filter(b => !filterStatus || b.status === filterStatus);
  const deleteTarget = bookings.find(b => b.id === deleteId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500 text-sm mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + New Booking
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex gap-2 mb-5">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">📅</div>
            <p className="text-slate-500 text-sm">{filterStatus ? `No ${filterStatus} bookings` : 'No bookings yet — create one to get started'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Programme</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">School / Class</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coach</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Dates</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{b.programme.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{b.school.name}</p>
                    <p className="text-xs text-slate-400">{b.class.name} · {b.class.yearGroup}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.coach?.name ?? <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p>{fmt(b.startDate)}</p>
                    <p className="text-slate-400">→ {fmt(b.endDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLOURS[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(b)} className="text-sm text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                      <button onClick={() => setDeleteId(b.id)} className="text-sm text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-5">{editing ? 'Edit Booking' : 'New Booking'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
                  <select required value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value, classId: '' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select required value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select class…</option>
                    {schoolClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.yearGroup})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Programme name</label>
                    <input required value={form.programmeName} onChange={e => setForm(f => ({ ...f, programmeName: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. FMS Block 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select value={form.programmeType} onChange={e => setForm(f => ({ ...f, programmeType: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {PROG_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (weeks)</label>
                  <input type="number" min="1" max="52" value={form.programmeDuration}
                    onChange={e => setForm(f => ({ ...f, programmeDuration: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coach <span className="text-slate-400 font-normal">(optional)</span></label>
              <select value={form.coachId} onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Unassigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
                <input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
                <input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize">
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-red-600 text-xl">!</span></div>
            <h3 className="font-semibold text-slate-800 mb-2">Delete booking?</h3>
            <p className="text-slate-500 text-sm mb-6"><strong>{deleteTarget?.programme.name}</strong> for {deleteTarget?.class.name} will be permanently deleted.</p>
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
