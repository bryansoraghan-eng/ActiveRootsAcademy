import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Assessment {
  id: string;
  date: string;
  notes?: string;
  fmsScores?: string;
  class: { id: string; name: string; yearGroup: string; school: { name: string } };
  coach?: { name: string };
}

export default function TeacherAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assessment | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.get<Assessment[]>('/assessments');
        const mine = all.filter((a: Assessment) => a.class?.school?.name === user?.school?.name);
        setAssessments(mine);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const parseFmsScores = (raw?: string) => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
        <p className="text-slate-500 text-sm mt-0.5">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''} for your classes</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No assessments recorded for your classes yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 font-medium text-slate-600">Class</th>
                <th className="px-5 py-3 font-medium text-slate-600">Year</th>
                <th className="px-5 py-3 font-medium text-slate-600">Date</th>
                <th className="px-5 py-3 font-medium text-slate-600">Coach</th>
                <th className="px-5 py-3 font-medium text-slate-600">Notes</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition ${i === assessments.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-4 font-medium text-slate-800">{a.class?.name}</td>
                  <td className="px-5 py-4 text-slate-600">Year {a.class?.yearGroup}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(a.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{a.coach?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{a.notes ?? '—'}</td>
                  <td className="px-5 py-4">
                    {parseFmsScores(a.fmsScores) && (
                      <button
                        onClick={() => setSelected(a)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        FMS scores
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">FMS Scores — {selected.class?.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs text-slate-500 mb-4">
                {new Date(selected.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {Object.entries(parseFmsScores(selected.fmsScores) ?? {}).map(([skill, score]) => (
                  <div key={skill} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700 capitalize">{skill.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-blue-600">{String(score)}</span>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-medium mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
