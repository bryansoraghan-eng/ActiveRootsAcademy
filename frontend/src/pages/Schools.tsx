import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  principal?: string;
  email?: string;
  schoolCode?: string;
  classes: { id: string }[];
  teachers: { id: string }[];
  programmes: { id: string }[];
}

const empty = { name: '', address: '', phone: '', principal: '', email: '' };

export default function Schools() {
  const { user: currentUser } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<School[]>('/schools');
      setSchools(data);
    } catch {
      setError('Failed to load schools');
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

  const openEdit = (school: School) => {
    setEditing(school);
    setForm({
      name: school.name,
      address: school.address ?? '',
      phone: school.phone ?? '',
      principal: school.principal ?? '',
      email: school.email ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/schools/${editing.id}`, form);
      } else {
        await api.post('/schools', form);
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
      await api.delete(`/schools/${deleteId}`);
      setDeleteId(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRegenerateCode = async (id: string) => {
    if (!confirm('Generate a new school code? The old code will stop working immediately.')) return;
    setRegeneratingId(id);
    try {
      await api.post(`/schools/${id}/regenerate-code`, {});
      await load();
    } catch {}
    finally { setRegeneratingId(null); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schools</h1>
          <p className="text-slate-500 text-sm mt-0.5">{schools.length} partner school{schools.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add School
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : schools.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No schools yet. Add your first school to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 font-medium text-slate-600">School</th>
                <th className="px-5 py-3 font-medium text-slate-600">Staff Code</th>
                <th className="px-5 py-3 font-medium text-slate-600">Principal</th>
                <th className="px-5 py-3 font-medium text-slate-600">Contact</th>
                <th className="px-5 py-3 font-medium text-slate-600 hidden lg:table-cell">Address</th>
                <th className="px-5 py-3 font-medium text-slate-600 text-center">Classes</th>
                <th className="px-5 py-3 font-medium text-slate-600 text-center">Teachers</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, i) => (
                <tr
                  key={school.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition ${i === schools.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{school.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    {school.schoolCode ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold tracking-widest text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {school.schoolCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(school.id, school.schoolCode!)}
                          title="Copy code"
                          className="text-slate-400 hover:text-blue-600 transition"
                        >
                          {copiedId === school.id ? (
                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                          )}
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleRegenerateCode(school.id)}
                            disabled={regeneratingId === school.id}
                            title="Regenerate code"
                            className="text-slate-400 hover:text-amber-600 transition text-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{school.principal || '—'}</td>
                  <td className="px-5 py-4">
                    <p className="text-slate-600">{school.email || '—'}</p>
                    <p className="text-slate-400 text-xs">{school.phone || ''}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 hidden lg:table-cell">{school.address || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {school.classes.length}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {school.teachers.length}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(school)}
                        className="text-slate-400 hover:text-blue-600 transition text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(school.id)}
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
          title={editing ? 'Edit School' : 'Add School'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. St. Patrick's National School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Principal</label>
              <input
                value={form.principal}
                onChange={e => setForm(f => ({ ...f, principal: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Principal name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="school@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01 234 5678"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street, Town, County"
              />
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
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add school'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete school?" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-5">
            This will permanently delete the school and all its associated classes, bookings, and data. This cannot be undone.
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
