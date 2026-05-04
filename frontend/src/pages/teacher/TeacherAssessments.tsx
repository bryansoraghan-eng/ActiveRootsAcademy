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

type ChartRow = { date: string; [key: string]: string | number };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

function FMSChart({ rows, skills }: { rows: ChartRow[]; skills: string[] }) {
  const W = 560; const H = 160;
  const PAD = { top: 16, right: 16, bottom: 30, left: 28 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const n = rows.length;
  const xAt = (i: number) => PAD.left + (n === 1 ? iW / 2 : (i / (n - 1)) * iW);
  const yAt = (v: number) => PAD.top + iH - Math.min(Math.max(v, 0) / 3, 1) * iH;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
        {/* grid lines */}
        {[0, 1, 2, 3].map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={yAt(v)} x2={W - PAD.right} y2={yAt(v)} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD.left - 5} y={yAt(v) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{v}</text>
          </g>
        ))}
        {/* x-axis labels */}
        {rows.map((r, i) => (
          <text key={i} x={xAt(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">{r.date}</text>
        ))}
        {/* one line per skill */}
        {skills.map((skill, si) => {
          const color = COLORS[si % COLORS.length];
          const pts = rows.map((r, i) => `${xAt(i)},${yAt((r[skill] as number) ?? 0)}`).join(' ');
          return (
            <g key={skill}>
              <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {rows.map((r, i) => (
                <circle key={i} cx={xAt(i)} cy={yAt((r[skill] as number) ?? 0)} r={4} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', marginTop: '0.4rem' }}>
        {skills.map((skill, si) => (
          <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 14, height: 3, borderRadius: 2, background: COLORS[si % COLORS.length] }} />
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>{skill.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeacherAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

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

  const parseFmsScores = (raw?: string): Record<string, number> | null => {
    if (!raw) return null;
    try { return JSON.parse(raw) as Record<string, number>; } catch { return null; }
  };

  // unique classes derived from assessments
  const classes = Array.from(
    new Map(assessments.map(a => [a.class.id, a.class])).values()
  );

  const filtered = selectedClassId
    ? assessments.filter(a => a.class.id === selectedClassId)
    : assessments;

  // build FMS chart data (oldest first) for selected class
  const fmsRows: ChartRow[] = filtered
    .filter(a => parseFmsScores(a.fmsScores) !== null)
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(a => ({
      date: new Date(a.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }),
      ...(parseFmsScores(a.fmsScores) as Record<string, number>),
    }));

  const skillKeys = Array.from(
    new Set(fmsRows.flatMap(r => Object.keys(r).filter(k => k !== 'date')))
  );

  const showChart = selectedClassId !== '' && fmsRows.length > 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
        <p className="text-slate-500 text-sm mt-0.5">{filtered.length} assessment{filtered.length !== 1 ? 's' : ''}{selectedClassId ? ' for this class' : ' for your classes'}</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <>
          {/* Class filter */}
          {classes.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedClassId('')}
                style={{
                  padding: '0.35rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: '1px solid',
                  background: !selectedClassId ? '#2563eb' : '#fff',
                  color: !selectedClassId ? '#fff' : '#475569',
                  borderColor: !selectedClassId ? '#2563eb' : '#e2e8f0',
                }}
              >
                All classes
              </button>
              {classes.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClassId(c.id)}
                  style={{
                    padding: '0.35rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: '1px solid',
                    background: selectedClassId === c.id ? '#2563eb' : '#fff',
                    color: selectedClassId === c.id ? '#fff' : '#475569',
                    borderColor: selectedClassId === c.id ? '#2563eb' : '#e2e8f0',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* FMS improvement chart */}
          {showChart && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p className="text-sm font-semibold text-slate-800" style={{ margin: 0 }}>FMS Skill Progress</p>
                  <p className="text-xs text-slate-400" style={{ margin: '0.2rem 0 0' }}>
                    {fmsRows.length === 1 ? 'One assessment recorded — more will appear as scores are added' : `Scores across ${fmsRows.length} assessments`}
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  Scale: 0–3
                </span>
              </div>
              <FMSChart rows={fmsRows} skills={skillKeys} />
            </div>
          )}

          {/* No chart hint when class selected but no FMS data */}
          {selectedClassId && fmsRows.length === 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5">
              <p className="text-sm text-slate-400">No FMS scores recorded for this class yet. Scores will appear here once a coach adds them.</p>
            </div>
          )}

          {/* Assessments table */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 text-sm">No assessments recorded{selectedClassId ? ' for this class' : ' for your classes'} yet.</p>
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
                  {filtered.map((a, i) => (
                    <tr
                      key={a.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
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
                            type="button"
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
        </>
      )}

      {/* FMS scores modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">FMS Scores — {selected.class?.name}</h2>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
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
