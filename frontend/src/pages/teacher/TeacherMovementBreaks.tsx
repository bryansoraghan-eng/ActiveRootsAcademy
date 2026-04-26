import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { BREAKS, CAT_TONE } from '../../lib/breaksData';
import type { BreakActivity } from '../../lib/breaksData';

const MILESTONE_MESSAGES: Record<number, { title: string; body: string }> = {
  1:  { title: 'First break done!',       body: 'You\'ve completed your first movement break. Your class thanks you!' },
  3:  { title: '3-day streak!',           body: 'Three days in a row — you\'re building a great habit.' },
  5:  { title: 'Five days strong!',       body: 'A full week\'s worth of movement. That\'s brilliant!' },
  7:  { title: 'One week streak!',        body: 'Seven days straight — your class is moving every day!' },
  14: { title: 'Two-week streak!',        body: 'Two weeks of consistent movement breaks. You\'re an inspiration!' },
  21: { title: '21-day habit!',           body: 'Science says habits form at 21 days. It\'s official now!' },
  30: { title: 'One month milestone!',    body: 'A whole month! Your class is healthier and happier because of you.' },
  50: { title: '50-day legend!',          body: 'Fifty days of movement. Extraordinary commitment!' },
  100:{ title: '100-day champion!',       body: '100 days of movement breaks. You are an Active Roots legend.' },
};

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  todayCount: number;
}


function pad(n: number) { return String(n).padStart(2, '0'); }

function StreakBar({ streak }: { streak: StreakData }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay(); // 0=Sun
  // Build last-7-days filled based on currentStreak
  return (
    <div className="ara-streak-bar">
      <div className="ara-streak-flame">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--ara-clay-500)" stroke="none">
          <path d="M12 2C9 6 5 8 5 13a7 7 0 0014 0c0-3-2-5-3-7-1 2-1 3-2 4-1-2-2-5-2-8z"/>
        </svg>
        <span className="ara-streak-count">{streak.currentStreak}</span>
      </div>
      <div>
        <div className="ara-streak-label">day streak</div>
        <div className="ara-streak-dots">
          {days.map((d, i) => {
            const dayIdx = (i + 1) % 7; // Mon=1..Sun=0
            const daysAgo = (today - dayIdx + 7) % 7;
            const filled = daysAgo < streak.currentStreak;
            return <div key={i} className={`ara-streak-dot${filled ? ' ara-streak-dot-filled' : ''}`} title={d}>{d}</div>;
          })}
        </div>
      </div>
      <div className="ara-streak-stats">
        <div className="ara-streak-stat"><span className="ara-streak-stat-val">{streak.todayCount}</span><span className="ara-streak-stat-label">today</span></div>
        <div className="ara-streak-stat"><span className="ara-streak-stat-val">{streak.totalDays}</span><span className="ara-streak-stat-label">total days</span></div>
        <div className="ara-streak-stat"><span className="ara-streak-stat-val">{streak.longestStreak}</span><span className="ara-streak-stat-label">best streak</span></div>
      </div>
    </div>
  );
}

function CongratsModal({ milestone, onClose }: { milestone: number; onClose: () => void }) {
  const msg = MILESTONE_MESSAGES[milestone];
  if (!msg) return null;
  return (
    <div className="ara-modal-backdrop" onClick={onClose}>
      <div className="ara-modal ara-congrats-modal" onClick={e => e.stopPropagation()}>
        <div className="ara-congrats-fireworks">🎉</div>
        <div className="ara-congrats-flame">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="var(--ara-clay-500)" stroke="none">
            <path d="M12 2C9 6 5 8 5 13a7 7 0 0014 0c0-3-2-5-3-7-1 2-1 3-2 4-1-2-2-5-2-8z"/>
          </svg>
          <span className="ara-congrats-streak">{milestone}</span>
        </div>
        <h2 className="ara-congrats-title">{msg.title}</h2>
        <p className="ara-congrats-body">{msg.body}</p>
        <button type="button" className="ara-btn ara-btn-primary ara-congrats-btn" onClick={onClose}>Keep it up!</button>
      </div>
    </div>
  );
}

function BreakPlayer({ activity, onDone, onBack }: { activity: BreakActivity; onDone: () => void; onBack: () => void }) {
  const total = activity.mins * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= total) { if (intervalRef.current) clearInterval(intervalRef.current); return total; }
        return e + 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, total]);

  const pct = Math.min(100, (elapsed / total) * 100);
  const remain = Math.max(0, total - elapsed);
  const circumference = 2 * Math.PI * 118;
  const done = remain === 0;

  return (
    <div className="ara-break-player">
      <button type="button" className="ara-break-back" onClick={onBack}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Back to library
      </button>

      <div className="ara-break-player-cat">
        <span className={`ara-tag ${CAT_TONE[activity.cat] ?? 'ara-tag-neutral'}`}>{activity.cat}</span>
        <span className="ara-break-player-age">Ages {activity.age}</span>
      </div>

      <h1 className="ara-break-player-title">{activity.title}</h1>
      <p className="ara-break-player-desc">{activity.desc}</p>

      <div className="ara-timer-ring-wrap">
        <svg width="260" height="260" className="ara-timer-svg">
          <circle cx="130" cy="130" r="118" fill="none" stroke="var(--ara-ink-100)" strokeWidth="10"/>
          <circle cx="130" cy="130" r="118" fill="none" stroke="var(--brand)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            className="ara-timer-arc"
          />
        </svg>
        <div className="ara-timer-inner">
          <div className="ara-timer-digits">{pad(Math.floor(remain / 60))}:{pad(remain % 60)}</div>
          <div className="ara-timer-status">{done ? 'Nicely done' : running ? 'Moving' : 'Paused'}</div>
        </div>
      </div>

      <div className="ara-break-player-actions">
        {done ? (
          <button type="button" className="ara-btn ara-btn-primary ara-btn-lg" onClick={onDone}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Mark done
          </button>
        ) : (
          <>
            <button type="button" className="ara-btn ara-btn-secondary ara-btn-lg" onClick={() => setRunning(r => !r)}>
              {running ? (
                <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
              ) : (
                <><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Resume</>
              )}
            </button>
            <button type="button" className="ara-btn ara-btn-ghost ara-btn-lg" onClick={onDone}>Finish early</button>
          </>
        )}
      </div>
    </div>
  );
}

type View = 'library' | 'player';

export default function TeacherMovementBreaks() {
  const [view, setView] = useState<View>('library');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<BreakActivity | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalDays: 0, todayCount: 0 });
  const [milestone, setMilestone] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);

  const cats = ['All', 'Movement', 'Calming', 'Focus'];

  useEffect(() => {
    api.get<StreakData>('/break-completions/streak')
      .then(setStreak)
      .catch(() => {});
  }, []);

  const filtered = BREAKS.filter(b =>
    (filter === 'All' || b.cat === filter) &&
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const startBreak = (b: BreakActivity) => { setActive(b); setView('player'); };

  const handleDone = async () => {
    setRecording(true);
    try {
      const result = await api.post<StreakData & { milestone: number | null }>('/break-completions', {});
      setStreak(result);
      if (result.milestone) setMilestone(result.milestone);
    } catch {}
    finally { setRecording(false); }
    setView('library');
    setActive(null);
  };

  return (
    <div className="ara-web-portal-root">
      {milestone && <CongratsModal milestone={milestone} onClose={() => setMilestone(null)} />}

      {view === 'player' && active ? (
        <BreakPlayer
          activity={active}
          onDone={handleDone}
          onBack={() => { setView('library'); setActive(null); }}
        />
      ) : (
        <>
          <div className="ara-web-portal-header">
            <div>
              <p className="ara-portal-eyebrow">Library</p>
              <h1 className="ara-portal-title">Movement breaks</h1>
              <p className="ara-portal-lede">Short activities for your classroom, sorted by energy level.</p>
            </div>
            {recording && <span className="ara-td-sub">Saving…</span>}
          </div>

          <StreakBar streak={streak} />

          <div className="ara-breaks-toolbar">
            <div className="ara-search-wrap">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="ara-search-icon"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Find a break…" className="ara-search ara-search-icon-padded" />
            </div>
            <div className="ara-filter-pills">
              {cats.map(c => (
                <button key={c} type="button"
                  className={`ara-filter-pill${filter === c ? ' ara-filter-pill-active' : ''}`}
                  onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="ara-breaks-grid">
            {filtered.map(b => (
              <button key={b.id} type="button" className="ara-break-card" onClick={() => startBreak(b)}>
                <span className={`ara-tag ${CAT_TONE[b.cat] ?? 'ara-tag-neutral'}`}>{b.cat}</span>
                <h3 className="ara-break-card-title">{b.title}</h3>
                <p className="ara-break-card-desc">{b.desc}</p>
                <div className="ara-break-card-meta">
                  <span className="ara-break-card-meta-item">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
                    {b.mins} min
                  </span>
                  <span className="ara-break-card-meta-item">Ages {b.age}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
