import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { pickBreakForProgramme, CAT_TONE } from '../../lib/breaksData';
import type { BreakActivity } from '../../lib/breaksData';

interface Assessment {
  id: string; date: string; notes?: string;
  class: { id: string; name: string; yearGroup: string };
  coach?: { name: string };
}

interface Class {
  id: string; name: string; yearGroup: string;
  school: { name: string };
  assessments: { id: string }[];
  bookings: { id: string }[];
}

interface Booking {
  id: string; status: string; startDate: string; endDate: string;
  classId?: string;
  programme: { id: string; name: string; type: string };
  class: { name: string };
}

interface StreakData {
  currentStreak: number; longestStreak: number; totalDays: number; todayCount: number;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalDays: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allClasses, allAssessments, allBookings, streakData] = await Promise.all([
          api.get<Class[]>('/classes'),
          api.get<Assessment[]>('/assessments'),
          api.get<Booking[]>('/bookings'),
          api.get<StreakData>('/break-completions/streak').catch(() => null),
        ]);

        const myClasses = allClasses.filter((c: Class) => c.school?.name === user?.school?.name);
        setClasses(myClasses);

        const myClassIds = new Set(myClasses.map((c: Class) => c.id));
        setRecentAssessments(
          allAssessments.filter((a) => myClassIds.has(a.class?.id)).slice(0, 5)
        );

        const now = new Date();
        const active = (allBookings as Booking[]).find(b =>
          b.status === 'confirmed' &&
          myClassIds.has(b.classId ?? '') ||
          myClasses.some(c => c.bookings.some(bk => bk.id === b.id))
        ) ?? null;

        // Fallback: pick the soonest upcoming confirmed booking for this school
        const schoolBooking = (allBookings as Booking[])
          .filter(b => b.status === 'confirmed' && new Date(b.endDate) >= now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] ?? null;

        setActiveBooking(active ?? schoolBooking);
        if (streakData) setStreak(streakData);
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

  const featuredBreak: BreakActivity = activeBooking
    ? pickBreakForProgramme(activeBooking.programme.name, activeBooking.programme.type)
    : pickBreakForProgramme('', 'general');

  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="ara-web-portal-root">
      {/* Header */}
      <div className="ara-web-portal-header">
        <p className="ara-portal-eyebrow">{today}</p>
        <h1 className="ara-portal-title">{greeting()}, {user?.name?.split(' ')[0]}.</h1>
        <p className="ara-portal-lede">{user?.school?.name}{classes.length > 0 ? ` · ${classes.length} class${classes.length !== 1 ? 'es' : ''}` : ''}</p>
      </div>

      {loading ? (
        <div className="ara-loading">Loading…</div>
      ) : (
        <>
          {/* Feature row */}
          <div className="ara-dash-feature-row">
            {/* Featured break card */}
            <div className="ara-featured-break-card">
              <div className="ara-featured-break-inner">
                {activeBooking && (
                  <div className="ara-featured-break-programme">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Matched to: {activeBooking.programme.name}
                  </div>
                )}
                <span className={`ara-tag ${CAT_TONE[featuredBreak.cat]}`}>{featuredBreak.cat}</span>
                <h2 className="ara-featured-break-title">{featuredBreak.title}</h2>
                <p className="ara-featured-break-desc">{featuredBreak.desc}</p>
                <div className="ara-featured-break-meta">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
                  {featuredBreak.mins} min · Ages {featuredBreak.age}
                </div>
                <div className="ara-featured-break-actions">
                  <button
                    type="button"
                    className="ara-btn ara-btn-primary"
                    onClick={() => navigate('/teacher/movement-breaks')}
                  >
                    Start break
                  </button>
                  <Link to="/teacher/movement-breaks" className="ara-featured-break-all">
                    See all breaks →
                  </Link>
                </div>
              </div>
            </div>

            {/* Weekly rhythm */}
            <div className="ara-dash-rhythm-card">
              <p className="ara-portal-eyebrow" style={{marginBottom: 4}}>This week</p>
              <h3 className="ara-dash-rhythm-title">Your rhythm</h3>
              <RhythmStat label="Movement breaks" value={streak.todayCount} sub={`of ${Math.max(streak.todayCount, 4)} today`} pct={Math.min(100, (streak.todayCount / 4) * 100)} />
              <RhythmStat label="Day streak" value={streak.currentStreak} sub="days in a row" pct={Math.min(100, (streak.currentStreak / 7) * 100)} />
              <RhythmStat label="Total days active" value={streak.totalDays} sub="all time" pct={Math.min(100, (streak.totalDays / 30) * 100)} />
            </div>
          </div>

          {/* Streak banner */}
          {streak.currentStreak > 0 && (
            <div className="ara-streak-banner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--ara-clay-500)" stroke="none">
                <path d="M12 2C9 6 5 8 5 13a7 7 0 0014 0c0-3-2-5-3-7-1 2-1 3-2 4-1-2-2-5-2-8z"/>
              </svg>
              <span><strong>{streak.currentStreak}-day streak</strong> — keep it going! {streak.currentStreak >= 7 ? '🎉' : ''}</span>
              <Link to="/teacher/movement-breaks" className="ara-streak-banner-link">Go to breaks →</Link>
            </div>
          )}

          {/* Stats row */}
          <div className="ara-dash-stats-row">
            <div className="ara-dash-stat-card">
              <p className="ara-dash-stat-label">My Classes</p>
              <p className="ara-dash-stat-value">{classes.length}</p>
            </div>
            <div className="ara-dash-stat-card">
              <p className="ara-dash-stat-label">Assessments</p>
              <p className="ara-dash-stat-value">{totalAssessments}</p>
            </div>
            <div className="ara-dash-stat-card">
              <p className="ara-dash-stat-label">Programme Bookings</p>
              <p className="ara-dash-stat-value">{totalBookings}</p>
            </div>
            {activeBooking && (
              <div className="ara-dash-stat-card ara-dash-stat-card-highlight">
                <p className="ara-dash-stat-label">Active Programme</p>
                <p className="ara-dash-stat-value-sm">{activeBooking.programme.name}</p>
              </div>
            )}
          </div>

          {/* Classes + Assessments */}
          <div className="ara-dash-two-col">
            <div className="ara-card ara-card-body">
              <div className="ara-card-header">
                <h2 className="ara-card-title">My Classes</h2>
                <Link to="/teacher/classes" className="ara-card-link">View all →</Link>
              </div>
              {classes.length === 0 ? (
                <p className="ara-empty">No classes assigned yet.</p>
              ) : (
                <ul className="ara-simple-list">
                  {classes.slice(0, 5).map(c => (
                    <li key={c.id} className="ara-simple-list-item">
                      <div>
                        <p className="ara-td-strong">{c.name}</p>
                        <p className="ara-td-sub">{c.yearGroup}</p>
                      </div>
                      <span className="ara-tag ara-tag-brand">{c.assessments.length} assessments</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="ara-card ara-card-body">
              <div className="ara-card-header">
                <h2 className="ara-card-title">Recent Assessments</h2>
                <Link to="/teacher/assessments" className="ara-card-link">View all →</Link>
              </div>
              {recentAssessments.length === 0 ? (
                <p className="ara-empty">No assessments yet.</p>
              ) : (
                <ul className="ara-simple-list">
                  {recentAssessments.map(a => (
                    <li key={a.id} className="ara-simple-list-item">
                      <div>
                        <p className="ara-td-strong">{a.class?.name}</p>
                        {a.coach && <p className="ara-td-sub">Coach: {a.coach.name}</p>}
                      </div>
                      <p className="ara-td-sub">{new Date(a.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}</p>
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

function RhythmStat({ label, value, sub, pct }: { label: string; value: number; sub: string; pct: number }) {
  return (
    <div className="ara-rhythm-stat">
      <div className="ara-rhythm-stat-row">
        <span className="ara-rhythm-stat-label">{label}</span>
        <span className="ara-rhythm-stat-val">{pad(value)} <span className="ara-rhythm-stat-sub">{sub}</span></span>
      </div>
      <div className="ara-rhythm-bar-track">
        <div className="ara-rhythm-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
