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
const SCORE_COLOURS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-green-100 text-green-700',
};

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
      setAssessments(as_);
      setClasses(cl);
      setCoaches(co);
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
      setShowModal(false);
      load();
    } catch { setError('Failed to save assessment'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/assessments/${deleteId}`);
      setDeleteId(null);
      load();
    } catch { setError('Failed to delete assessment'); }
  };

  const deleteTarget = assessments.find(a => a.id === deleteId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{assessments.length} FMS assessment{assessments.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + New Assessment
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading…</div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">📊</div>
            <p className="text-slate-500 text-sm">No assessments yet — record your first FMS assessment</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Class</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">School</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Coach</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Avg Score</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map(a => {
                const avg = avgScore(a.fmsScores);
                const avgNum = avg ? parseFloat(avg) : null;
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setViewing(a)}>
                    <td className="px-6 py-4 font-medium text-slate-800">{a.class.name} <span className="text-slate-400 font-normal text-xs">({a.class.yearGroup})</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.class.school.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.coach?.name ?? <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{fmt(a.date)}</td>
                    <td className="px-6 py-4">
                      {avgNum ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${SCORE_COLOURS[Math.round(avgNum)]}`}>
                          {avg} / 4
                        </span>
                      ) : <span className="text-slate-400 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewing(a)} className="text-sm text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition">View</button>
                        <button onClick={() => setDeleteId(a.id)} className="text-sm text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New assessment modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">New FMS Assessment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select required value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.school.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Coach <span className="text-slate-400 font-normal">(optional)</span></label>
                <select value={form.coachId} onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Unassigned</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">FMS Scores <span className="text-slate-400 font-normal">(1=Beginning · 2=Developing · 3=Achieved · 4=Advanced)</span></label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {FMS_SKILLS.map(skill => (
                  <div key={skill} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-700 w-36 flex-shrink-0">{skill}</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map(n => (
                        <button key={n} type="button"
                          onClick={() => setScores(s => ({ ...s, [skill]: n }))}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${scores[skill] === n ? SCORE_COLOURS[n] + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 w-20 text-right">{SCORE_LABELS[scores[skill]]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any additional observations…" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Saving…' : 'Save assessment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View scores modal */}
      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">{viewing.class.name} — FMS Scores</h2>
            <p className="text-sm text-slate-500">{viewing.class.school.name} · {fmt(viewing.date)}{viewing.coach ? ` · ${viewing.coach.name}` : ''}</p>
          </div>
          {viewing.fmsScores ? (
            <div className="space-y-2">
              {Object.entries(JSON.parse(viewing.fmsScores) as Record<string, number>).map(([skill, score]) => (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-36 flex-shrink-0">{skill}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${score >= 3 ? 'bg-green-500' : score === 2 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${(score / 4) * 100}%` }} />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center ${SCORE_COLOURS[score]}`}>{SCORE_LABELS[score]}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm">No scores recorded.</p>}
          {viewing.notes && <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{viewing.notes}</p>}
          <button onClick={() => setViewing(null)} className="w-full mt-5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Close</button>
        </Modal>
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-red-600 text-xl">!</span></div>
            <h3 className="font-semibold text-slate-800 mb-2">Delete assessment?</h3>
            <p className="text-slate-500 text-sm mb-6">Assessment for <strong>{deleteTarget?.class.name}</strong> on {deleteTarget ? fmt(deleteTarget.date) : ''} will be permanently deleted.</p>
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
