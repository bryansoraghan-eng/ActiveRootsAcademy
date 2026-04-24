import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface School {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  schoolId: string;
  school: School;
  createdAt: string;
}

const emptyForm = { name: '', email: '', password: '', schoolId: '' };

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [teacherData, schoolData] = await Promise.all([
        api.get<Teacher[]>('/teachers'),
        api.get<School[]>('/schools'),
      ]);
      setTeachers(teacherData);
      setSchools(schoolData);
    } catch {
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({ name: teacher.name, email: teacher.email, password: '', schoolId: teacher.schoolId });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/teachers/${editing.id}`, {
          name: form.name,
          email: form.email,
          schoolId: form.schoolId,
        });
      } else {
        await api.post('/teachers', form);
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/teachers/${deleteId}`);
      setDeleteId(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.school?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add Teacher
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email or school…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {search ? 'No teachers match your search.' : 'No teachers yet. Add your first teacher to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 font-medium text-slate-600">Name</th>
                <th className="px-5 py-3 font-medium text-slate-600">Email</th>
                <th className="px-5 py-3 font-medium text-slate-600">School</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher, i) => (
                <tr
                  key={teacher.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{teacher.email}</td>
                  <td className="px-5 py-4">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {teacher.school?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(teacher)}
                        className="text-slate-400 hover:text-blue-600 transition text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(teacher.id)}
                        className="text-slate-400 hover:text-red-600 transition text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Edit Teacher' : 'Add Teacher'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Sarah Murphy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="teacher@school.ie"
              />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Initial password"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School *</label>
              <select
                required
                value={form.schoolId}
                onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a school…</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
              >
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add teacher'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete teacher?" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-5">
            This will permanently remove the teacher. Their classes will be unassigned but not deleted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
