import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

const FMS_SKILLS = [
  'Running', 'Jumping', 'Hopping', 'Skipping', 'Galloping',
  'Leaping', 'Sliding', 'Throwing', 'Catching', 'Kicking',
  'Striking', 'Bouncing/Dribbling', 'Rolling', 'Balancing', 'Dodging',
];

const SCORE_LABELS: Record<number, string> = { 1: 'Beginning', 2: 'Developing', 3: 'Achieved', 4: 'Advanced' };

const AVG_TAG: (n: number) => string = n =>
  n >= 3.5 ? 'ara-tag-success' : n >= 2.5 ? 'ara-tag-brand' : n >= 1.5 ? 'ara-tag-warning' : 'ara-tag-danger';

interface Class { id: string; name: string; yearGroup: string; school: { name: string }; }
interface Coach { id: string; name: string; }
interface Assessment {
  id: string;
  date: string;
  notes?: string | null;
  fmsScores?: string | null;
  class: { id: string; name: string; yearGroup: string; school: { name: string } };
  classId: string;
  coach?: Coach | null;
  coachId?: string | null;
}

function emptyScores() {
  return Object.fromEntries(FMS_SKILLS.map(s => [s, 2])) as Record<string, number>;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function avgScore(fmsScores?: string | null) {
  if (!fmsScores) return null;
  try {
    const scores = Object.values(JSON.parse(fmsScores) as Record<string, number>);
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  } catch { return null; }
}

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState<Assessment | null>(null);
  const [form, setForm] = useState({ classId: '', coachId: '', date: '', notes: '' });
  const [scores, setScores] = useState<Record<string, number>>(emptyScores());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [as_, cl, co] = await Promise.all([
        api.get<Assessment[]>('/assessments'),
        api.get<Class[]>('/classes'),
        api.get<Coach[]>('/coaches'),
      ]);
      setAssessments(as_); setClasses(cl); setCoaches(co);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ classId: '', coachId: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    setScores(emptyScores());
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/assessments', {
        classId: form.classId,
        coachId: form.coachId || undefined,
        date: form.date,
        notes: form.notes || undefined,
        fmsScores: scores,
      });
      setShowModal(false); load();
    } catch { setError('Failed to save assessment'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/assessments/${deleteId}`); setDeleteId(null); load(); }
    catch { setError('Failed to delete assessment'); }
  };

  const deleteTarget = assessments.find(a => a.id === deleteId);

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Assessments</h1>
          <p className="ara-page-subtitle">{assessments.length} FMS assessment{assessments.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ New Assessment</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : assessments.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">No assessments yet — record your first FMS assessment.</div>
          </div>
        ) : (
          <div className="ara-table-wrap">
            <table className="ara-table">
              <thead>
                <tr>
                  <th className="ara-th">Class</th>
                  <th className="ara-th">School</th>
                  <th className="ara-th">Coach</th>
                  <th className="ara-th">Date</th>
                  <th className="ara-th">Avg Score</th>
                  <th className="ara-th" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(a => {
                  const avg = avgScore(a.fmsScores);
                  const avgNum = avg ? parseFloat(avg) : null;
                  return (
                    <tr key={a.id} className="ara-tr" style={{ cursor: 'pointer' }} onClick={() => setViewing(a)}>
                      <td className="ara-td ara-td-strong">
                        {a.class.name} <span className="ara-td-sub">({a.class.yearGroup})</span>
                      </td>
                      <td className="ara-td">{a.class.school.name}</td>
                      <td className="ara-td">
                        {a.coach?.name ?? <span className="ara-td-sub">Unassigned</span>}
                      </td>
                      <td className="ara-td">{fmt(a.date)}</td>
                      <td className="ara-td">
                        {avgNum
                          ? <span className={`ara-tag ${AVG_TAG(avgNum)}`}>{avg} / 4</span>
                          : <span className="ara-td-sub">—</span>}
                      </td>
                      <td className="ara-td" onClick={e => e.stopPropagation()}>
                        <div className="ara-row-actions">
                          <button type="button" className="ara-row-action" onClick={() => setViewing(a)}>View</button>
                          <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="New FMS Assessment" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit}>
            <div className="ara-form-row">
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="assess-class">Class</label>
                <select id="assess-class" required value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className="ara-form-select">
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.school.name}</option>)}
                </select>
              </div>
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="assess-coach">Coach <span className="ara-td-sub">(optional)</span></label>
                <select id="assess-coach" value={form.coachId}
                  onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))} className="ara-form-select">
                  <option value="">Unassigned</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="assess-date">Date</label>
              <input id="assess-date" required type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="ara-field-input" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label">FMS Scores <span className="ara-td-sub">(1 = Beginning · 2 = Developing · 3 = Achieved · 4 = Advanced)</span></label>
              <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                {FMS_SKILLS.map(skill => (
                  <div key={skill} className="ara-score-row">
                    <span className="ara-score-skill">{skill}</span>
                    <div className="ara-score-btns">
                      {[1, 2, 3, 4].map(n => (
                        <button key={n} type="button"
                          onClick={() => setScores(s => ({ ...s, [skill]: n }))}
                          className={`ara-score-btn ara-score-btn-${n}${scores[skill] === n ? ' ara-score-btn-active' : ''}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <span className="ara-score-label">{SCORE_LABELS[scores[skill]]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="assess-notes">Notes <span className="ara-td-sub">(optional)</span></label>
              <textarea id="assess-notes" value={form.notes} rows={2}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="ara-field-textarea" placeholder="Any additional observations…" />
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : 'Save assessment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewing && (
        <Modal title={`${viewing.class.name} — FMS Scores`} onClose={() => setViewing(null)} size="lg">
          <p className="ara-td-sub" style={{ marginBottom: 16 }}>
            {viewing.class.school.name} · {fmt(viewing.date)}{viewing.coach ? ` · ${viewing.coach.name}` : ''}
          </p>
          {viewing.fmsScores ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(JSON.parse(viewing.fmsScores) as Record<string, number>).map(([skill, score]) => (
                <div key={skill} className="ara-score-row">
                  <span className="ara-score-skill">{skill}</span>
                  <div className="ara-score-bar-track">
                    <div className={`ara-score-bar-fill ara-score-bar-${score}`}
                      style={{ width: `${(score / 4) * 100}%` }} />
                  </div>
                  <span className={`ara-tag ara-score-tag-${score}`}>{SCORE_LABELS[score]}</span>
                </div>
              ))}
            </div>
          ) : <p className="ara-td-sub">No scores recorded.</p>}
          {viewing.notes && <div className="ara-notes" style={{ marginTop: 16 }}>{viewing.notes}</div>}
          <div className="ara-form-footer" style={{ marginTop: 20 }}>
            <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete assessment?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            Assessment for <strong>{deleteTarget?.class.name}</strong> on {deleteTarget ? fmt(deleteTarget.date) : ''} will be permanently deleted.
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
