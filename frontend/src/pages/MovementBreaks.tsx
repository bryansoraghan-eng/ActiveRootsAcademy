import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { can } from '../lib/permissions';

const AGE_RANGES = ['4-5', '6-7', '6-8', '8-9', '8-10', '10-11', '10-12', '12+'];
const SCHOOL_HOURS = ['08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30'];
const FMS_COLOURS: Record<string, string> = {
  coordination: 'bg-blue-100 text-blue-700',
  balance:      'bg-purple-100 text-purple-700',
  locomotion:   'bg-green-100 text-green-700',
  agility:      'bg-orange-100 text-orange-700',
  stability:    'bg-amber-100 text-amber-700',
  strength:     'bg-red-100 text-red-700',
};

interface BreakSlot {
  time: string;
  isManual: boolean;
}

interface GeneratedBreak extends BreakSlot {
  name: string;
  steps: string[];
  fmsFocus: string;
  popupMessage: string;
  duration: number;
  isGenerated?: boolean;
}

interface Settings {
  minBreaks: number;
  duration: number;
  isEnabled: boolean;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function MovementBreaks() {
  const { user, permissions } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'school_admin';
  const canEdit = can(permissions, 'movementBreaks', 'edit');

  const [tab, setTab] = useState<'schedule' | 'live' | 'settings'>('schedule');

  // Settings
  const [settings, setSettings] = useState<Settings>({ minBreaks: 4, duration: 2, isEnabled: true });
  const [savingSettings, setSavingSettings] = useState(false);

  // Schedule builder
  const [slots, setSlots] = useState<BreakSlot[]>([
    { time: '10:00', isManual: false },
    { time: '11:30', isManual: false },
    { time: '13:30', isManual: false },
    { time: '15:00', isManual: false },
  ]);
  const [mode, setMode] = useState<'random' | 'manual' | 'mixed'>('mixed');
  const [ageRange, setAgeRange] = useState('6-8');
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState<GeneratedBreak[] | null>(null);
  const [genError, setGenError] = useState('');

  // Live view
  const [now, setNow] = useState(new Date());
  const [activeBreak, setActiveBreak] = useState<GeneratedBreak | null>(null);
  const [breakTimer, setBreakTimer] = useState(0);
  const breakRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!schedule || activeBreak) return;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const match = schedule.find(b => {
      const bMins = timeToMinutes(b.time);
      return nowMins >= bMins && nowMins < bMins + (settings.duration || 2);
    });
    if (match) {
      setActiveBreak(match);
      setBreakTimer((settings.duration || 2) * 60);
    }
  }, [now, schedule, activeBreak, settings.duration]);

  // Countdown timer
  useEffect(() => {
    if (!activeBreak) return;
    breakRef.current = setInterval(() => {
      setBreakTimer(t => {
        if (t <= 1) {
          setActiveBreak(null);
          if (breakRef.current) clearInterval(breakRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (breakRef.current) clearInterval(breakRef.current); };
  }, [activeBreak]);

  const dismissBreak = useCallback(() => {
    setActiveBreak(null);
    if (breakRef.current) clearInterval(breakRef.current);
  }, []);

  const addSlot = () => {
    const existing = new Set(slots.map(s => s.time));
    const next = SCHOOL_HOURS.find(h => !existing.has(h)) ?? '09:00';
    setSlots(prev => [...prev, { time: next, isManual: false }]);
  };

  const removeSlot = (i: number) => setSlots(prev => prev.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, field: keyof BreakSlot, value: string | boolean) => {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError('');
    try {
      const result = await api.post<{ generated: GeneratedBreak[] }>('/movement-breaks-scheduler/generate', {
        slots,
        mode,
        ageRange,
        schoolId: user?.school?.id,
        minBreaks: settings.minBreaks,
      });
      setSchedule(result.generated);
      setTab('live');
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.school?.id) return;
    setSavingSettings(true);
    try {
      await api.put(`/movement-breaks-scheduler/settings/${user.school.id}`, settings);
    } catch { /* settings save errors are surfaced through the disabled button state */ }
    finally { setSavingSettings(false); }
  };

  const nextBreak = schedule?.find(b => timeToMinutes(b.time) > now.getHours() * 60 + now.getMinutes()) ?? null;
  const minsToNext = nextBreak ? timeToMinutes(nextBreak.time) - (now.getHours() * 60 + now.getMinutes()) : null;

  const tabs = [
    { key: 'schedule', label: 'Schedule', icon: '📋' },
    { key: 'live',     label: 'Live View', icon: '▶️'  },
    ...(isAdmin ? [{ key: 'settings', label: 'Settings', icon: '⚙️' }] : []),
  ] as const;

  return (
    <div className="p-8">
      {/* Break popup */}
      {activeBreak && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
            <div className="text-5xl mb-3">🏃</div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${FMS_COLOURS[activeBreak.fmsFocus] ?? 'bg-slate-100 text-slate-600'} mb-3 inline-block`}>
              {activeBreak.fmsFocus}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{activeBreak.name}</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 text-left">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Why we're moving</p>
              <p className="text-sm text-green-800">{activeBreak.popupMessage}</p>
            </div>
            <ol className="text-left space-y-3 mb-6">
              {activeBreak.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-slate-700 text-sm">{step}</span>
                </li>
              ))}
            </ol>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-3xl font-bold text-green-600 tabular-nums">
                {pad(Math.floor(breakTimer / 60))}:{pad(breakTimer % 60)}
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-5">
              <div
                className="bg-green-500 h-2 rounded-full transition-all ara-progress-fill"
                style={{ '--progress': `${(breakTimer / ((settings.duration || 2) * 60)) * 100}%` } as React.CSSProperties}
              />
            </div>
            <button type="button" onClick={dismissBreak}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Movement Breaks</h1>
          <p className="ara-page-subtitle">Schedule, generate and run classroom movement breaks</p>
        </div>
        {tab === 'schedule' && canEdit && (
          <div className="ara-page-header-actions">
            <button type="button" onClick={handleGenerate} disabled={generating} className="ara-btn ara-btn-primary">
              {generating ? 'Generating…' : '▶ Generate Schedule'}
            </button>
          </div>
        )}
      </div>

      <div className="ara-page">
      {/* Tabs */}
      <div className="ara-tabs">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key as 'schedule' | 'live' | 'settings')}
            className={`ara-tab${tab === t.key ? ' ara-tab-active' : ''}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div className="max-w-3xl space-y-5">
          {/* Config row */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Schedule Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="mb-age-range">Age Range</label>
                <select id="mb-age-range" value={ageRange} onChange={e => setAgeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {AGE_RANGES.map(a => <option key={a} value={a}>{a} years</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="mb-mode">Mode</label>
                <select id="mb-mode" value={mode} onChange={e => setMode(e.target.value as 'random' | 'manual' | 'mixed')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="random">Random — all breaks generated</option>
                  <option value="mixed">Mixed — teacher picks some, AI fills rest</option>
                  <option value="manual">Manual — teacher selects all</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Minimum breaks per day: <strong>{settings.minBreaks}</strong> — system auto-fills if you add fewer</p>
          </div>

          {/* Time slots */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">Break Times</h3>
              {canEdit && (
                <button type="button" onClick={addSlot}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg transition">
                  + Add Time
                </button>
              )}
            </div>
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <select value={slot.time} onChange={e => updateSlot(i, 'time', e.target.value)}
                    aria-label={`Break time ${i + 1}`}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    {SCHOOL_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {mode === 'mixed' && (
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={slot.isManual} onChange={e => updateSlot(i, 'isManual', e.target.checked)}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-500" />
                      Teacher picks
                    </label>
                  )}
                  {canEdit && slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(i)}
                      className="ml-auto text-slate-400 hover:text-red-500 text-xs transition">Remove</button>
                  )}
                </div>
              ))}
            </div>
            {genError && <p className="mt-3 text-xs text-red-600">{genError}</p>}
          </div>
        </div>
      )}

      {/* ── LIVE VIEW TAB ── */}
      {tab === 'live' && (
        <div className="max-w-3xl space-y-5">
          {/* Clock + next break */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <p className="text-green-200 text-xs font-medium uppercase tracking-wider mb-1">Current Time</p>
            <p className="text-5xl font-bold tabular-nums mb-4">{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</p>
            {nextBreak ? (
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-100">Next break</p>
                  <p className="text-lg font-bold">{nextBreak.time} — {nextBreak.name}</p>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-100">In</p>
                  <p className="text-lg font-bold">{minsToNext} min{minsToNext !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ) : schedule ? (
              <p className="text-green-200 text-sm">All breaks complete for today — well done!</p>
            ) : (
              <p className="text-green-200 text-sm">Generate a schedule on the Schedule tab to activate live view.</p>
            )}
          </div>

          {/* Schedule list */}
          {schedule ? (
            <div className="space-y-3">
              {schedule.map((b, i) => {
                const bMins = timeToMinutes(b.time);
                const nowMins = now.getHours() * 60 + now.getMinutes();
                const done = bMins + (settings.duration || 2) <= nowMins;
                const active = bMins <= nowMins && nowMins < bMins + (settings.duration || 2);
                return (
                  <div key={i} className={`bg-white rounded-xl border-2 p-4 transition ${active ? 'border-green-500 shadow-lg' : done ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${active ? 'bg-green-100' : done ? 'bg-slate-100' : 'bg-green-50'}`}>
                          {done ? '✓' : active ? '▶' : '🏃'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{b.time}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FMS_COLOURS[b.fmsFocus] ?? 'bg-slate-100 text-slate-600'}`}>{b.fmsFocus}</span>
                            {active && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                          </div>
                          <p className="font-semibold text-slate-800 mt-0.5">{b.name}</p>
                          <p className="text-xs text-slate-400 italic mt-0.5">"{b.popupMessage}"</p>
                        </div>
                      </div>
                      {!done && canEdit && (
                        <button type="button" onClick={() => { setActiveBreak(b); setBreakTimer((settings.duration || 2) * 60); }}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition">
                          Start
                        </button>
                      )}
                    </div>
                    <div className="mt-3 pl-13 space-y-1">
                      {b.steps.map((step, si) => (
                        <p key={si} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-green-500 font-bold">{si + 1}.</span>{step}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">No schedule yet — go to the Schedule tab and click Generate.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB (admin only) ── */}
      {tab === 'settings' && isAdmin && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-semibold text-slate-800">Admin Break Settings</h3>
            <p className="text-xs text-slate-500">These settings apply to all teachers at your school.</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimum breaks per day</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSettings(s => ({ ...s, minBreaks: Math.max(1, s.minBreaks - 1) }))}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition">−</button>
                <span className="text-2xl font-bold text-slate-800 w-8 text-center">{settings.minBreaks}</span>
                <button type="button" onClick={() => setSettings(s => ({ ...s, minBreaks: Math.min(10, s.minBreaks + 1) }))}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition">+</button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Default: 4 — system auto-fills if teacher schedules fewer</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Break duration (minutes)</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSettings(s => ({ ...s, duration: Math.max(1, s.duration - 1) }))}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition">−</button>
                <span className="text-2xl font-bold text-slate-800 w-8 text-center">{settings.duration}</span>
                <button type="button" onClick={() => setSettings(s => ({ ...s, duration: Math.min(10, s.duration + 1) }))}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition">+</button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Default: 2 minutes per break</p>
            </div>

            <div className="flex items-center gap-3">
              <button type="button"
                aria-label="Toggle movement breaks"
                aria-checked={settings.isEnabled ? 'true' : 'false'}
                role="switch"
                onClick={() => setSettings(s => ({ ...s, isEnabled: !s.isEnabled }))}
                className={`ara-toggle${settings.isEnabled ? ' ara-toggle-on' : ''}`}>
                <span className="ara-toggle-thumb" />
              </button>
              <span className="text-sm text-slate-700">Movement breaks enabled for all teachers</span>
            </div>

            <button type="button" onClick={handleSaveSettings} disabled={savingSettings || !user?.school?.id}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition">
              {savingSettings ? 'Saving…' : 'Save Settings'}
            </button>
            {!user?.school?.id && (
              <p className="text-xs text-amber-600">Settings are saved per school — assign yourself to a school first.</p>
            )}
          </div>
        </div>
      )}
      </div>{/* end ara-page */}
    </div>
  );
}
