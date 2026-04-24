import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Class {
  id: string;
  name: string;
  yearGroup: string;
  school: { name: string };
  teacher?: { name: string };
  assessments: { id: string; date: string }[];
  bookings: { id: string; status: string; programme: { name: string } }[];
}

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.get<Class[]>('/classes');
        const mine = all.filter((c: Class) => c.school?.name === user?.school?.name);
        setClasses(mine);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Classes</h1>
        <p className="text-slate-500 text-sm mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} at {user?.school?.name}</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No classes assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {c.yearGroup}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">Year {c.yearGroup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {c.assessments.length} assessments
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    {c.bookings.length} bookings
                  </span>
                  <span className="text-slate-400 text-sm">{expanded === c.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === c.id && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Assessments</h3>
                      {c.assessments.length === 0 ? (
                        <p className="text-slate-400 text-xs">No assessments yet.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {c.assessments.map(a => (
                            <li key={a.id} className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                              {new Date(a.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Programme Bookings</h3>
                      {c.bookings.length === 0 ? (
                        <p className="text-slate-400 text-xs">No bookings yet.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {c.bookings.map(b => (
                            <li key={b.id} className="text-xs text-slate-600 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                                {b.programme?.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                                b.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                                b.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                'bg-yellow-50 text-yellow-700'
                              }`}>
                                {b.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
