import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PermissionsModal from '../components/PermissionsModal';

interface School { id: string; name: string; }
interface Teacher {
  id: string; name: string; email: string;
  schoolId: string; school: School; createdAt: string;
}

const emptyForm = { name: '', email: '', password: '', schoolId: '' };

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Teachers() {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools]   = useState<School[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Teacher | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [permissionsTarget, setPermissionsTarget] = useState<Teacher | null>(null);

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

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, password: '', schoolId: t.schoolId });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/teachers/${editing.id}`, { name: form.name, email: form.email, schoolId: form.schoolId });
      } else {
        await api.post('/teachers', form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save teacher');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete teacher');
    }
  };

  const handleViewDashboard = async (teacher: Teacher) => {
    try {
      const data = await api.post<{ id: string; name: string; role: string }>(
        `/admin/impersonate/${teacher.id}?type=teacher`, {}
      );
      startImpersonation(data.name, data.role);
      navigate('/preview/teacher');
    } catch {
      setError('Failed to open dashboard preview');
    }
  };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.school?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Teachers</h1>
          <p className="ara-page-subtitle">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ Add Teacher</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        <div className="ara-toolbar">
          <input
            type="text"
            placeholder="Search by name, email or school…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ara-search"
          />
        </div>

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : filtered.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">
              {search ? 'No teachers match your search.' : 'No teachers yet. Add your first teacher to get started.'}
            </div>
          </div>
        ) : (
          <div className="ara-table-wrap">
            <table className="ara-table">
              <thead>
                <tr>
                  <th className="ara-th">Name</th>
                  <th className="ara-th">Email</th>
                  <th className="ara-th">School</th>
                  <th className="ara-th" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(teacher => (
                  <tr key={teacher.id} className="ara-tr">
                    <td className="ara-td">
                      <div className="ara-name-cell">
                        <div className="ara-avatar ara-avatar-md ara-avatar-blue">{initials(teacher.name)}</div>
                        <span className="ara-td-strong">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="ara-td">{teacher.email}</td>
                    <td className="ara-td">
                      <span className="ara-tag ara-tag-brand">{teacher.school?.name ?? '—'}</span>
                    </td>
                    <td className="ara-td">
                      <div className="ara-row-actions">
                        <button
                          type="button"
                          className="ara-row-action"
                          onClick={() => handleViewDashboard(teacher)}
                        >
                          View Dashboard
                        </button>
                        <button
                          type="button"
                          className="ara-row-action"
                          onClick={() => setPermissionsTarget(teacher)}
                        >
                          Permissions
                        </button>
                        <button type="button" className="ara-row-action" onClick={() => openEdit(teacher)}>Edit</button>
                        <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(teacher.id)}>Delete</button>
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
        <Modal title={editing ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="ara-form-group">
              <label className="ara-form-label">Full name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="ara-field-input" placeholder="e.g. Sarah Murphy" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="ara-field-input" placeholder="teacher@school.ie" />
            </div>
            {!editing && (
              <div className="ara-form-group">
                <label className="ara-form-label">Password *</label>
                <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="ara-field-input" placeholder="Initial password" />
              </div>
            )}
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="teacher-school">School *</label>
              <select id="teacher-school" required value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} className="ara-form-select">
                <option value="">Select a school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add teacher'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete teacher?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            This will permanently remove the teacher. Their classes will be unassigned but not deleted.
          </p>
          <div className="ara-form-footer">
            <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button type="button" className="ara-btn ara-btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}

      {permissionsTarget && (
        <PermissionsModal
          userId={permissionsTarget.id}
          userType="teacher"
          role="teacher"
          name={permissionsTarget.name}
          onClose={() => setPermissionsTarget(null)}
        />
      )}
    </div>
  );
}
