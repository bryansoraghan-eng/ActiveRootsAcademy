import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Assessment {
  id: string;
  date: string;
  notes?: string;
  class: { id: string; name: string; yearGroup: string };
  coach?: { name: string };
}

interface Class {
  id: string;
  name: string;
  yearGroup: string;
  school: { name: string };
  assessments: { id: string }[];
  bookings: { id: string }[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const allClasses = await api.get<Class[]>('/classes');
        const myClasses = allClasses.filter((c: Class) => c.school?.name === user?.school?.name);
        setClasses(myClasses);

        const allAssessments = await api.get<Assessment[]>('/assessments');
        const myClassIds = new Set(myClasses.map((c: Class) => c.id));
        const mine = (allAssessments as any[])
          .filter((a: Assessment) => myClassIds.has(a.class?.id))
          .slice(0, 5);
        setRecentAssessments(mine);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const totalAssessments = classes.reduce((sum, c) => sum + c.assessments.length, 0);
  const totalBookings = classes.reduce((sum, c) => sum + c.bookings.length, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">{user?.school?.name}</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">My Classes</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{classes.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Assessments</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalAssessments}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-slate-500 text-sm">Programme Bookings</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalBookings}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">My Classes</h2>
                <Link to="/teacher/classes" className="text-blue-600 text-sm hover:underline">View all</Link>
              </div>
              {classes.length === 0 ? (
                <p className="text-slate-400 text-sm">No classes assigned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {classes.slice(0, 5).map(c => (
                    <li key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500">Year {c.yearGroup}</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {c.assessments.length} assessments
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Recent Assessments</h2>
                <Link to="/teacher/assessments" className="text-blue-600 text-sm hover:underline">View all</Link>
              </div>
              {recentAssessments.length === 0 ? (
                <p className="text-slate-400 text-sm">No assessments yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentAssessments.map(a => (
                    <li key={a.id} className="py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{a.class?.name}</p>
                        <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                      </div>
                      {a.coach && <p className="text-xs text-slate-500 mt-0.5">Coach: {a.coach.name}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
