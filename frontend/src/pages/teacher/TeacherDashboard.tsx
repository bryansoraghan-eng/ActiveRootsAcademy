import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { pickBreakForProgramme, pickRandomBreak, getCurrentSlot, hasCustomSlots, CAT_TONE } from '../../lib/breaksData';
import type { BreakActivity } from '../../lib/breaksData';
import { getDailyLunchbox } from '../../lib/lunchboxData';
import type { DailyLunchbox, LunchboxItem } from '../../lib/lunchboxData';

interface Booking {
  id: string; status: string; startDate: string; endDate: string;
  classId?: string;
  programme: { id: string; name: string; type: string };
  class: { name: string };
}

interface StreakData {
  currentStreak: number; longestStreak: number; totalDays: number; todayCount: number;
}

const TODAY_KEY = new Date().toDateString();

const LUNCHBOX_SECTIONS: { label: string; key: 'main' | 'side' | 'snack' | 'drink'; color: { bg: string; text: string } }[] = [
  { label: 'Main',  key: 'main',  color: { bg: '#eff6ff', text: '#1d4ed8' } },
  { label: 'Side',  key: 'side',  color: { bg: '#f0fdf4', text: '#166534' } },
  { label: 'Snack', key: 'snack', color: { bg: '#fff7ed', text: '#c2410c' } },
  { label: 'Drink', key: 'drink', color: { bg: '#f0f9ff', text: '#0369a1' } },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function HabitCheck({ done, label }: { done: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, padding: '0.75rem 1rem', borderRadius: 10, background: done ? '#f0fdf4' : '#f8fafc' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#16a34a' : '#e2e8f0' }}>
        {done
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />
        }
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: done ? 600 : 400, color: done ? '#166534' : '#64748b' }}>{label}</span>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalDays: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);
  const [currentBreak, setCurrentBreak] = useState<BreakActivity>(pickBreakForProgramme('', 'general'));
  const [lunchboxOpen, setLunchboxOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [allBookings, streakData] = await Promise.all([
          api.get<Booking[]>('/bookings'),
          api.get<StreakData>('/break-completions/streak').catch(() => null),
        ]);

        const now = new Date();
        const schoolBooking = (allBookings as Booking[])
          .filter(b => b.status === 'confirmed' && new Date(b.endDate) >= now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] ?? null;

        setActiveBooking(schoolBooking);
        setCurrentBreak(
          schoolBooking
            ? pickBreakForProgramme(schoolBooking.programme.name, schoolBooking.programme.type)
            : pickBreakForProgramme('', 'general')
        );
        if (streakData) setStreak(streakData);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const refreshBreak = () => {
    setFading(true);
    setTipOpen(false);
    setTimeout(() => {
      setCurrentBreak(pickRandomBreak(currentBreak.id));
      setFading(false);
    }, 160);
  };

  const openLunchbox = () => {
    setLunchboxOpen(true);
    localStorage.setItem('ara_nutrition_viewed', TODAY_KEY);
  };

  const lunchbox: DailyLunchbox = getDailyLunchbox();
  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });
  const currentSlot = getCurrentSlot();
  const nutritionViewedToday = localStorage.getItem('ara_nutrition_viewed') === TODAY_KEY;
  const breakDoneToday = streak.todayCount > 0;
  const bothDone = breakDoneToday && nutritionViewedToday;

  function habitMessage() {
    if (bothDone) return 'Both done today — you\'re building something that actually sticks.';
    if (breakDoneToday) return 'Movement break done. Open the nutrition guide to make it a full day.';
    if (nutritionViewedToday) return 'Nutrition guide done. Run a movement break to complete today.';
    return 'Every day is a fresh start. Pick one to begin.';
  }

  return (
    <div className="ara-web-portal-root">
      {/* Header */}
      <div className="ara-web-portal-header">
        <p className="ara-portal-eyebrow">{today}</p>
        <h1 className="ara-portal-title">{greeting()}, {user?.name?.split(' ')[0]}.</h1>
        <p className="ara-portal-lede">{user?.school?.name}</p>
      </div>

      {loading ? (
        <div className="ara-loading">Loading…</div>
      ) : (
        <>
          {/* Feature row — movement break (left) + lunchbox guide (right) */}
          <div className="ara-dash-feature-row">
            {/* Movement Break */}
            <div className="ara-featured-break-card">
              <div className="ara-featured-break-inner" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`ara-tag ${CAT_TONE[currentBreak.cat]}`}>{currentBreak.cat}</span>
                    {currentSlot && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', borderRadius: 999, padding: '0.2rem 0.55rem' }}>
                        {currentSlot}
                      </span>
                    )}
                  </div>
                  {activeBooking && (
                    <div className="ara-featured-break-programme" style={{ marginBottom: 0 }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      {activeBooking.programme.name}
                    </div>
                  )}
                </div>
                <h2 className="ara-featured-break-title">{currentBreak.title}</h2>
                {currentSlot && (
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '-0.2rem 0 0.5rem', fontStyle: 'italic' }}>
                    Suggested for this time of day{hasCustomSlots() ? ' · based on your chosen break times' : ''}
                  </p>
                )}
                <p className="ara-featured-break-desc">{currentBreak.desc}</p>
                {currentBreak.teacherTip && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setTipOpen(o => !o)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      Teacher tip {tipOpen ? '▴' : '▾'}
                    </button>
                    {tipOpen && (
                      <p style={{ fontSize: '0.8rem', color: '#78350f', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.5rem 0.75rem', margin: '0.4rem 0 0', lineHeight: 1.55, fontStyle: 'italic' }}>
                        {currentBreak.teacherTip}
                      </p>
                    )}
                  </div>
                )}
                <div className="ara-featured-break-meta" style={{ marginTop: '0.75rem' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
                  {currentBreak.mins} min · Ages {currentBreak.age}
                </div>
                <div className="ara-featured-break-actions">
                  <button
                    type="button"
                    className="ara-btn ara-btn-primary"
                    onClick={() => navigate('/teacher/movement-breaks', { state: { initialBreak: currentBreak } })}
                  >
                    Start break
                  </button>
                  <button
                    type="button"
                    onClick={refreshBreak}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8', padding: 0 }}
                  >
                    Try a different one ↺
                  </button>
                </div>
              </div>
            </div>

            {/* Lunchbox Guide — click to open inline modal */}
            <div
              className="ara-dash-rhythm-card"
              onClick={openLunchbox}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && openLunchbox()}
              style={{ cursor: 'pointer' }}
            >
              <p className="ara-portal-eyebrow" style={{ marginBottom: 4 }}>Daily Lunchbox Guide</p>
              <h3 className="ara-dash-rhythm-title">{lunchbox.main.name}</h3>
              {LUNCHBOX_SECTIONS.map(({ label, key }) => {
                const item = lunchbox[key];
                return (
                  <div key={label} style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', width: 36, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{item.name}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, paddingLeft: '2.4rem', lineHeight: 1.4 }}>{item.kidScript}</p>
                  </div>
                );
              })}
              <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500, textAlign: 'right', marginTop: '0.85rem' }}>
                Tap to open full guide →
              </p>
            </div>
          </div>

          {/* Streak tracker */}
          <div className="ara-card" style={{ padding: '1.25rem 1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', margin: '0 0 0.2rem' }}>Today's habits</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Both count toward your streak</p>
              </div>
              {streak.currentStreak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#C4703F" stroke="none">
                    <path d="M12 2C9 6 5 8 5 13a7 7 0 0014 0c0-3-2-5-3-7-1 2-1 3-2 4-1-2-2-5-2-8z"/>
                  </svg>
                  <span style={{ fontWeight: 700, color: '#C4703F', fontSize: '0.9rem' }}>{streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <HabitCheck done={breakDoneToday} label="Movement break" />
              <HabitCheck done={nutritionViewedToday} label="Nutrition guide" />
            </div>
            <p style={{ fontSize: '0.85rem', color: bothDone ? '#166534' : '#64748b', margin: 0, lineHeight: 1.5 }}>
              {habitMessage()}
            </p>
          </div>
        </>
      )}

      {/* Lunchbox modal */}
      {lunchboxOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setLunchboxOpen(false)}
          />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Sticky header */}
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Daily Lunchbox Guide</p>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', margin: '0.15rem 0 0' }}>{lunchbox.main.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setLunchboxOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.65rem 0.9rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                  For educational purposes only — not medical or dietary advice.
                </p>
              </div>

              {LUNCHBOX_SECTIONS.map(({ label, key, color }) => {
                const item = lunchbox[key];
                return (
                  <div key={label} style={{ borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.6rem', borderRadius: 999, background: color.bg, color: color.text, flexShrink: 0 }}>
                        {label}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{item.name}</span>
                    </div>
                    <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.6 }}>{item.teacherNote}</p>
                      <p style={{ fontSize: '0.82rem', color: '#1e293b', margin: 0, lineHeight: 1.55, fontStyle: 'italic', background: color.bg, borderRadius: 8, padding: '0.5rem 0.75rem' }}>{item.kidScript}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {item.nutrients.map(n => (
                          <div key={n.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.76rem' }}>
                            <span style={{ fontWeight: 700, color: color.text, background: color.bg, borderRadius: 999, padding: '0.15rem 0.55rem', flexShrink: 0, whiteSpace: 'nowrap' }}>{n.name}</span>
                            <span style={{ color: '#94a3b8' }}>{n.source}</span>
                            <span style={{ color: '#475569' }}>→ {n.benefit}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        <strong>Alternative:</strong> {item.alternative}
                      </p>
                    </div>
                  </div>
                );
              })}

              <Link
                to="/teacher/nutrition"
                onClick={() => setLunchboxOpen(false)}
                className="ara-btn ara-btn-primary"
                style={{ textAlign: 'center', display: 'block' }}
              >
                View full guide page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
