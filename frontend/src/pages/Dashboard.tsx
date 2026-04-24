import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  school: { name: string };
  class: { name: string; yearGroup: string };
  programme: { name: string };
  coach?: { name: string } | null;
}

interface Counts {
  schools: number;
  coaches: number;
  classes: number;
  bookings: number;
}

const STATUS_COLOURS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>({ schools: 0, coaches: 0, classes: 0, bookings: 0 });
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [schools, coaches, classes, bookings] = await Promise.all([
          api.get<{ id: string }[]>('/schools'),
          api.get<{ id: string }[]>('/coaches'),
          api.get<{ id: string }[]>('/classes'),
          api.get<Booking[]>('/bookings'),
        ]);
        setCounts({ schools: schools.length, coaches: coaches.length, classes: classes.length, bookings: bookings.length });
        const now = new Date();
        const future = (bookings as Booking[])
          .filter(b => new Date(b.startDate) >= now && b.status !== 'cancelled')
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5);
        setUpcoming(future);
      } catch {
        // silently fail — counts stay at 0
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Schools', value: counts.schools, colour: 'bg-blue-500', icon: '🏫', href: '/schools' },
    { label: 'Active Coaches', value: counts.coaches, colour: 'bg-green-500', icon: '🏃', href: '/coaches' },
    { label: 'Classes', value: counts.classes, colour: 'bg-purple-500', icon: '📚', href: '/classes' },
    { label: 'Bookings', value: counts.bookings, colour: 'bg-orange-500', icon: '📅', href: '/bookings' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Here's an overview of Active Roots Academy</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, colour, icon, href }) => (
          <Link
            key={label}
            to={href}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition group"
          >
            <div className={`w-12 h-12 ${colour} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm">{label}</p>
              <p className="text-slate-800 font-bold text-2xl">
                {loading ? <span className="text-slate-300">—</span> : value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Upcoming Bookings</h2>
            <Link to="/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading…</div>
          ) : upcoming.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No upcoming bookings</div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                      {new Date(b.startDate).getDate()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{b.programme.name}</p>
                      <p className="text-xs text-slate-400 truncate">{b.school.name} · {b.class.name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 flex-shrink-0 ${STATUS_COLOURS[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: 'Add School', href: '/schools' },
              { label: 'Add Coach', href: '/coaches' },
              { label: 'Add Class', href: '/classes' },
              { label: 'New Booking', href: '/bookings' },
              { label: 'New Assessment', href: '/assessments' },
              { label: 'Generate Programme', href: '/programmes' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
              >
                {label}
                <span className="text-slate-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
