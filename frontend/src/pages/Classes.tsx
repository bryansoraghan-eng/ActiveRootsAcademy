import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface School   { id: string; name: string; }
interface Teacher  { id: string; name: string; }
interface Assessment { id: string; date: string; fmsScores?: string | null; }
interface Class {
  id: string; name: string; yearGroup: string;
  school: School; schoolId: string;
  teacher?: Teacher | null; teacherId?: string | null;
  assessments: Assessment[]; bookings: { id: string }[];
}

const FMS_SKILLS = [
  { name: 'Running', cat: 'Locomotor' }, { name: 'Jumping', cat: 'Locomotor' },
  { name: 'Hopping', cat: 'Locomotor' }, { name: 'Skipping', cat: 'Locomotor' },
  { name: 'Galloping', cat: 'Locomotor' }, { name: 'Leaping', cat: 'Locomotor' },
  { name: 'Sliding', cat: 'Locomotor' }, { name: 'Balancing', cat: 'Stability' },
  { name: 'Dodging', cat: 'Stability' }, { name: 'Throwing', cat: 'Manipulative' },
  { name: 'Catching', cat: 'Manipulative' }, { name: 'Kicking', cat: 'Manipulative' },
  { name: 'Striking', cat: 'Manipulative' }, { name: 'Bouncing/Dribbling', cat: 'Manipulative' },
  { name: 'Rolling', cat: 'Manipulative' },
];

function scoreClasses(score: number) {
  const tone = score === 0 ? 'ara-skill-bar-none' : score <= 1 ? 'ara-skill-bar-low' : score <= 2 ? 'ara-skill-bar-mid' : 'ara-skill-bar-high';
  const width = `ara-skill-bar-w${score}`;
  return `ara-skill-bar-fill ${tone} ${width}`;
}

const YEAR_GROUPS = ['Infants', '1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class', '6th Class'];
const empty = { name: '', yearGroup: '', schoolId: '', teacherId: '' };

export default function Classes() {
  const [classes, setClasses]       = useState<Class[]>([]);
  const [schools, setSchools]       = useState<School[]>([]);
  const [teachers, setTeachers]     = useState<Teacher[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [selected, setSelected]     = useState<Class | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Class | null>(null);
  const [form, setForm]             = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const load = async () => {
    try {
      const [cls, schs, tchs] = await Promise.all([
        api.get<Class[]>('/classes'),
        api.get<School[]>('/schools'),
        api.get<Teacher[]>('/teachers'),
      ]);
      setClasses(cls); setSchools(schs); setTeachers(tchs);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };

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
      if (editing) { await api.put(`/classes/${editing.id}`, payload); }
      else         { await api.post('/classes', payload); }
      setShowModal(false);
      load();
    } catch { setError('Failed to save class'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/classes/${deleteId}`); setDeleteId(null); load(); }
    catch { setError('Failed to delete class'); }
  };

  const visible = classes.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.yearGroup.toLowerCase().includes(q) || c.school.name.toLowerCase().includes(q);
    return matchSearch && (!filterSchool || c.schoolId === filterSchool);
  });

  const deleteTarget = classes.find(c => c.id === deleteId);

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Classes</h1>
          <p className="ara-page-subtitle">{classes.length} class{classes.length !== 1 ? 'es' : ''} across all schools</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ Add Class</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        <div className="ara-toolbar">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search classes…" className="ara-search" />
          <select id="classes-school-filter" value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
            aria-label="Filter by school" className="ara-form-select-narrow">
            <option value="">All schools</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : visible.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">{search || filterSchool ? 'No classes match your search.' : 'No classes yet — add one to get started.'}</div>
          </div>
        ) : (
          <div className={selected ? 'ara-classes-split' : ''}>
            <div className="ara-table-wrap">
              <table className="ara-table">
                <thead>
                  <tr>
                    <th className="ara-th">Class</th>
                    <th className="ara-th">Year Group</th>
                    <th className="ara-th">School</th>
                    <th className="ara-th">Teacher</th>
                    <th className="ara-th">Assessments</th>
                    <th className="ara-th" aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(c => (
                    <tr key={c.id} className={`ara-tr ara-tr-clickable${selected?.id === c.id ? ' ara-tr-selected' : ''}`}
                      onClick={() => setSelected(prev => prev?.id === c.id ? null : c)}>
                      <td className="ara-td">
                        <div className="ara-name-cell">
                          <div className="ara-avatar ara-avatar-md ara-avatar-neutral">{c.name.slice(0, 2).toUpperCase()}</div>
                          <span className="ara-td-strong">{c.name}</span>
                        </div>
                      </td>
                      <td className="ara-td">
                        <span className="ara-tag ara-tag-brand">{c.yearGroup}</span>
                      </td>
                      <td className="ara-td">{c.school.name}</td>
                      <td className="ara-td">
                        {c.teacher ? c.teacher.name : <span className="ara-td-sub">Unassigned</span>}
                      </td>
                      <td className="ara-td ara-td-sub">
                        {c.assessments.length} assessment{c.assessments.length !== 1 ? 's' : ''} · {c.bookings.length} booking{c.bookings.length !== 1 ? 's' : ''}
                      </td>
                      <td className="ara-td" onClick={e => e.stopPropagation()}>
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

            {selected && (() => {
              const latest = selected.assessments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              const scores: Record<string, number> = latest?.fmsScores ? (() => { try { return JSON.parse(latest.fmsScores!); } catch { return {}; } })() : {};
              const categories = ['Locomotor', 'Stability', 'Manipulative'];
              return (
                <div className="ara-detail-card ara-classes-detail">
                  <div className="ara-detail-header">
                    <div>
                      <div className="ara-detail-title">{selected.name}</div>
                      <div className="ara-detail-subtitle">{selected.school.name} · {selected.yearGroup}</div>
                    </div>
                    <button type="button" className="ara-row-action" onClick={() => setSelected(null)}>✕ Close</button>
                  </div>

                  <div className="ara-detail-section-label">
                    FMS skill levels{latest ? ` · assessed ${new Date(latest.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </div>

                  {!latest ? (
                    <div className="ara-empty">No assessments yet — add one to track skill levels.</div>
                  ) : (
                    <div className="ara-skill-heatmap">
                      {categories.map(cat => {
                        const skills = FMS_SKILLS.filter(s => s.cat === cat);
                        return (
                          <div key={cat} className="ara-skill-category">
                            <div className="ara-skill-category-label">{cat}</div>
                            {skills.map(s => {
                              const score = scores[s.name] ?? 0;
                              return (
                                <div key={s.name} className="ara-skill-row">
                                  <div className="ara-skill-name">{s.name}</div>
                                  <div className="ara-skill-bar-track">
                                    <div className={scoreClasses(score)} />
                                  </div>
                                  <div className="ara-skill-score">{score === 0 ? '—' : score + '/4'}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Class' : 'Add Class'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="class-name">Class name</label>
              <input id="class-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="ara-field-input" placeholder="e.g. Room 5 / Ms Murphy's Class" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="class-year">Year group</label>
              <select id="class-year" required value={form.yearGroup} onChange={e => setForm(f => ({ ...f, yearGroup: e.target.value }))} className="ara-form-select">
                <option value="">Select year group…</option>
                {YEAR_GROUPS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="class-school">School</label>
              <select id="class-school" required value={form.schoolId}
                onChange={e => setForm(f => ({ ...f, schoolId: e.target.value, teacherId: '' }))} className="ara-form-select">
                <option value="">Select school…</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="class-teacher">Teacher <span className="ara-td-sub">(optional)</span></label>
              <select id="class-teacher" value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} className="ara-form-select">
                <option value="">Unassigned</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add class'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete class?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            <strong>{deleteTarget?.name}</strong> and all its associated assessments and bookings will be permanently deleted.
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
