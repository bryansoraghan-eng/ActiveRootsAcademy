import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface School { id: string; name: string; }
interface Teacher { id: string; name: string; }
interface Class {
  id: string;
  name: string;
  yearGroup: string;
  school: School;
  schoolId: string;
  teacher?: Teacher | null;
  teacherId?: string | null;
  assessments: { id: string }[];
  bookings: { id: string }[];
}

const YEAR_GROUPS = ['Infants', '1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class', '6th Class'];
const empty = { name: '', yearGroup: '', schoolId: '', teacherId: '' };

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [cls, schs, tchs] = await Promise.all([
        api.get<Class[]>('/classes'),
        api.get<School[]>('/schools'),
        api.get<Teacher[]>('/teachers'),
      ]);
      setClasses(cls);
      setSchools(schs);
      setTeachers(tchs);
    } catch {
      setError('Failed to load data');
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

  const openEdit = (c: Class) => {
    setEditing(c);
    setForm({ name: c.name, yearGroup: c.yearGroup, schoolId: c.schoolId, teacherId: c.teacherId ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, teacherId: form.teacherId || undefined };
      if (editing) {
        await api.put(`/classes/${editing.id}`, payload);
      } else {
        await api.post('/classes', payload);
      }
      setShowModal(false);
      load();
    } catch {
      setError('Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/classes/${deleteId}`);
      setDeleteId(null);
      load();
    } catch {
      setError('Failed to delete class');
    }
  };

  const filteredTeachers = teachers;

  const visible = classes.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.yearGroup.toLowerCase().includes(q) || c.school.name.toLowerCase().includes(q);
    const matchSchool = !filterSchool || c.schoolId === filterSchool;
    return matchSearch && matchSchool;
  });

  const deleteTarget = classes.find(c => c.id === deleteId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} across all schools</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add Class
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search classes…"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterSchool}
          onChange={e => setFilterSchool(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">🏫</div>
            <p className="text-slate-500 text-sm">{search || filterSchool ? 'No classes match your search' : 'No classes yet — add one to get started'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Class</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Year Group</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">School</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Teacher</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Activity</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{c.yearGroup}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{c.school.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {c.teacher ? c.teacher.name : <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>{c.assessments.length} assessment{c.assessments.length !== 1 ? 's' : ''}</span>
                      <span>{c.bookings.length} booking{c.bookings.length !== 1 ? 's' : ''}</span>
                    </div>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-5">{editing ? 'Edit Class' : 'Add Class'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Room 5 / Ms Murphy's Class"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year group</label>
              <select
                required
                value={form.yearGroup}
                onChange={e => setForm(f => ({ ...f, yearGroup: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select year group…</option>
                {YEAR_GROUPS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
              <select
                required
                value={form.schoolId}
                onChange={e => setForm(f => ({ ...f, schoolId: e.target.value, teacherId: '' }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teacher <span className="text-slate-400 font-normal">(optional)</span></label>
              <select
                value={form.teacherId}
                onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Unassigned</option>
                {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add class'}
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
            <h3 className="font-semibold text-slate-800 mb-2">Delete class?</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{deleteTarget?.name}</strong> and all its associated assessments and bookings will be permanently deleted.
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
