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

const STATUS_TAG: Record<string, string> = {
  confirmed: 'ara-tag-success',
  pending:   'ara-tag-warning',
  completed: 'ara-tag-neutral',
  cancelled: 'ara-tag-danger',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>({ schools: 0, coaches: 0, classes: 0, bookings: 0 });
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [pending, setPending] = useState<Booking[]>([]);
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
        const sorted = (bookings as Booking[]).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setUpcoming(sorted.filter(b => new Date(b.startDate) >= now && b.status !== 'cancelled').slice(0, 5));
        setPending(sorted.filter(b => b.status === 'pending').slice(0, 3));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Active team',      value: counts.coaches, sub: 'coaches on the team',   href: '/coaches'  },
    { label: 'Partner schools',  value: counts.schools, sub: counts.schools + ' schools total', href: '/schools'  },
    { label: 'Active blocks',    value: counts.classes, sub: 'classes running',        href: '/classes'  },
    { label: 'Total bookings',   value: counts.bookings, sub: 'across all schools',   href: '/bookings' },
  ];

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">{greeting()}, {user?.name?.split(' ')[0]}.</h1>
          <p className="ara-page-subtitle">{todayLabel()} · {counts.coaches} coaches · {counts.schools} schools</p>
        </div>
        <div className="ara-page-header-actions">
          <Link to="/bookings" className="ara-btn ara-btn-secondary">View bookings</Link>
          <Link to="/coaches" className="ara-btn ara-btn-primary">Add to team</Link>
        </div>
      </div>

      <div className="ara-page">
        <div className="ara-stats-grid">
          {stats.map(({ label, value, sub, href }) => (
            <Link key={label} to={href} className="ara-stat-card">
              <div className="ara-stat-label">{label}</div>
              <div className="ara-stat-value">{loading ? '—' : value}</div>
              <div className="ara-stat-sub">{sub}</div>
            </Link>
          ))}
        </div>

        <div className="ara-dash-grid">
          <div className="ara-card ara-card-body">
            <div className="ara-card-header">
              <h3 className="ara-card-title">Upcoming bookings</h3>
              <Link to="/bookings" className="ara-card-link">Full schedule →</Link>
            </div>
            {loading ? (
              <div className="ara-loading">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="ara-empty">No upcoming bookings</div>
            ) : (
              <div>
                {upcoming.map(b => (
                  <div key={b.id} className="ara-booking-row">
                    <div className="ara-booking-date">
                      {new Date(b.startDate).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="ara-booking-info">
                      <div className="ara-booking-name">{b.programme.name}</div>
                      <div className="ara-booking-sub">{b.school.name} · {b.class.name}{b.coach ? ' · ' + b.coach.name : ''}</div>
                    </div>
                    <span className={`ara-tag ${STATUS_TAG[b.status] ?? 'ara-tag-neutral'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ara-card ara-card-body">
            <h3 className="ara-card-title">Needs attention</h3>
            <div className="ara-attention-list">
              {pending.length > 0 && pending.map(b => (
                <div key={b.id} className="ara-attention-item ara-attention-item-sand">
                  <span className="ara-tag ara-tag-warning">Pending</span>
                  <span className="ara-attention-label">{b.programme.name} — {b.school.name}</span>
                </div>
              ))}
              {counts.classes > 0 && (
                <div className="ara-attention-item ara-attention-item-brand">
                  <span className="ara-tag ara-tag-brand">Active</span>
                  <span className="ara-attention-label">{counts.classes} class block{counts.classes !== 1 ? 's' : ''} currently running</span>
                </div>
              )}
              {pending.length === 0 && counts.classes === 0 && (
                <div className="ara-empty">Nothing needs attention right now</div>
              )}
              <Link to="/bookings" className="ara-card-link ara-attention-link">View all bookings →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
