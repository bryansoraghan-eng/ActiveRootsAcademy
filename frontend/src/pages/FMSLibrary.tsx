import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Category = 'all' | 'locomotion' | 'object_control' | 'stability';
type TabKey = 'cues' | 'progressions' | 'errors';

interface Progression { id: string; direction: string; description: string; ageGroup?: string; difficulty: number; }
interface Cue { id: string; cue: string; ageGroup?: string; cueType: string; }
interface FMSError { id: string; error: string; correction: string; ageGroup?: string; }
interface FMSSkill {
  id: string; name: string; slug: string; category: string; description: string;
  ageGroups: string; equipment: string; spaceNeeded: string; tags: string;
  isScoilnet: boolean;
  progressions: Progression[];
  cues: Cue[];
  errors: FMSError[];
}

const CATEGORY_LABELS: Record<string, string> = {
  locomotion:    'Locomotion',
  object_control: 'Object Control',
  stability:     'Stability',
};

const CATEGORY_STYLE: Record<string, { badge: string; badgeText: string; accent: string }> = {
  locomotion:    { badge: '#dbeafe', badgeText: '#1d4ed8', accent: '#eff6ff' },
  object_control: { badge: '#dcfce7', badgeText: '#15803d', accent: '#f0fdf4' },
  stability:     { badge: '#f3e8ff', badgeText: '#7c3aed', accent: '#faf5ff' },
};

const SPACE_LABEL: Record<string, string> = {
  hall:    'Hall only',
  outdoor: 'Outdoor only',
  both:    'Hall or outdoor',
};

const CUE_TYPE_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  verbal:       { label: 'Verbal',       bg: '#eff6ff', text: '#1d4ed8' },
  visual:       { label: 'Visual',       bg: '#fff7ed', text: '#c2410c' },
  kinaesthetic: { label: 'Kinaesthetic', bg: '#f0fdf4', text: '#15803d' },
};

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Advanced'];

function DifficultyDots({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= level ? '#3b82f6' : '#e2e8f0' }} />
      ))}
    </div>
  );
}

function IcCheck() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;
}
function IcX() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
}
function IcChevron({ open }: { open: boolean }) {
  return (
    <svg style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M19 9l-7 7-7-7"/>
    </svg>
  );
}

function parseJson(str: string): string[] {
  try { return JSON.parse(str); } catch { return []; }
}

export default function FMSLibrary() {
  const [skills, setSkills] = useState<FMSSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, TabKey>>({});

  useEffect(() => {
    api.get<FMSSkill[]>('/fms')
      .then(setSkills)
      .catch(() => setError('Failed to load FMS library'))
      .finally(() => setLoading(false));
  }, []);

  const visible = category === 'all' ? skills : skills.filter(s => s.category === category);
  const byCategory: Record<string, FMSSkill[]> = {
    locomotion:    visible.filter(s => s.category === 'locomotion'),
    object_control: visible.filter(s => s.category === 'object_control'),
    stability:     visible.filter(s => s.category === 'stability'),
  };

  const getTab = (id: string): TabKey => activeTab[id] ?? 'cues';
  const setTab = (id: string, tab: TabKey) => setActiveTab(prev => ({ ...prev, [id]: tab }));
  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  if (loading) return <div className="ara-loading">Loading FMS Library…</div>;

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">FMS Knowledge Library</h1>
          <p className="ara-page-subtitle">
            {skills.length} Fundamental Movement Skills — teaching cues, progressions, and error corrections
          </p>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        {skills.length === 0 && !loading && !error && (
          <div className="ara-seed-notice">
            <div className="ara-pending-banner-header">FMS Library not yet seeded</div>
            <div className="ara-seed-notice-body">
              <p className="ara-td-sub">Run the FMS seed script to populate the knowledge base:</p>
              <code className="ara-code ara-code-block">cd backend &amp;&amp; npx ts-node prisma/seed-fms.ts</code>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="ara-filter-strip">
          {(['all', 'locomotion', 'object_control', 'stability'] as Category[]).map(cat => (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className={`ara-filter-btn${category === cat ? ' ara-filter-btn-active' : ''}`}>
              {cat === 'all'
                ? `All Skills (${skills.length})`
                : `${CATEGORY_LABELS[cat]} (${skills.filter(s => s.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Skills grouped by category */}
        {(Object.entries(byCategory) as [string, FMSSkill[]][]).map(([cat, catSkills]) => {
          if (catSkills.length === 0) return null;
          const style = CATEGORY_STYLE[cat];
          return (
            <div key={cat} style={{ marginBottom: '2rem' }}>
              {/* Category heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, background: style.badge, color: style.badgeText, borderRadius: 999, padding: '0.2rem 0.65rem' }}>
                  {catSkills.length} skill{catSkills.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catSkills.map(skill => {
                  const isOpen = expanded === skill.id;
                  const tab = getTab(skill.id);
                  return (
                    <div key={skill.id} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${isOpen ? style.badge : '#e2e8f0'}`, overflow: 'hidden', boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,0.06)' : 'none' }}>

                      {/* Skill header row */}
                      <button
                        type="button"
                        onClick={() => toggle(skill.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, background: style.badge, color: style.badgeText, letterSpacing: '0.02em' }}>
                            {skill.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{skill.name}</span>
                              {skill.isScoilnet && (
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, background: style.accent, color: style.badgeText, borderRadius: 999, padding: '0.15rem 0.55rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Core Skill
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                              {skill.description}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, marginLeft: '1rem' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            {[
                              { n: skill.cues.length, label: 'cues' },
                              { n: skill.progressions.length, label: 'progressions' },
                              { n: skill.errors.length, label: 'errors' },
                            ].map(({ n, label }) => (
                              <span key={label} style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                <strong style={{ color: '#475569' }}>{n}</strong> {label}
                              </span>
                            ))}
                          </div>
                          <span style={{ color: '#94a3b8' }}><IcChevron open={isOpen} /></span>
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid #f1f5f9' }}>
                          {/* Metadata row */}
                          <div style={{ padding: '0.6rem 1.25rem', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', borderRadius: 999, padding: '0.2rem 0.65rem' }}>
                              {SPACE_LABEL[skill.spaceNeeded] ?? skill.spaceNeeded}
                            </span>
                            {parseJson(skill.ageGroups).map((ag: string) => (
                              <span key={ag} style={{ fontSize: '0.72rem', background: style.badge, color: style.badgeText, borderRadius: 999, padding: '0.2rem 0.65rem' }}>{ag}</span>
                            ))}
                            {parseJson(skill.equipment).map((eq: string) => (
                              <span key={eq} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', borderRadius: 999, padding: '0.2rem 0.65rem' }}>{eq}</span>
                            ))}
                          </div>

                          {/* Tabs */}
                          <div style={{ padding: '0 1.25rem' }}>
                            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #f1f5f9', marginBottom: 0 }}>
                              {(['cues', 'progressions', 'errors'] as TabKey[]).map(t => {
                                const count = t === 'cues' ? skill.cues.length : t === 'progressions' ? skill.progressions.length : skill.errors.length;
                                const labels = { cues: 'Teaching Cues', progressions: 'Progressions & Regressions', errors: 'Common Errors' };
                                return (
                                  <button key={t} type="button" onClick={() => setTab(skill.id, t)}
                                    style={{ padding: '0.7rem 1rem', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? style.badgeText : 'transparent'}`, color: tab === t ? style.badgeText : '#94a3b8', transition: 'color 0.15s' }}>
                                    {labels[t]}
                                    <span style={{ marginLeft: '0.35rem', fontSize: '0.7rem', color: '#cbd5e1' }}>({count})</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Cues tab */}
                            {tab === 'cues' && (
                              <div style={{ padding: '1rem 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {skill.cues.length === 0 && <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No cues added yet.</p>}
                                {skill.cues.map(cue => {
                                  const ct = CUE_TYPE_STYLE[cue.cueType] ?? { label: cue.cueType, bg: '#f1f5f9', text: '#475569' };
                                  return (
                                    <div key={cue.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
                                      <span style={{ fontSize: '0.62rem', fontWeight: 700, background: ct.bg, color: ct.text, borderRadius: 999, padding: '0.2rem 0.6rem', flexShrink: 0, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {ct.label}
                                      </span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: 0, lineHeight: 1.55 }}>{cue.cue}</p>
                                        {cue.ageGroup && (
                                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', display: 'inline-block' }}>For: {cue.ageGroup}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Progressions tab */}
                            {tab === 'progressions' && (
                              <div style={{ padding: '1rem 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(['regression', 'progression'] as const).map(dir => {
                                  const items = skill.progressions.filter(p => p.direction === dir);
                                  if (items.length === 0) return null;
                                  return (
                                    <div key={dir}>
                                      <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem', color: dir === 'regression' ? '#b45309' : '#15803d' }}>
                                        {dir === 'regression' ? '▼ Regressions (easier)' : '▲ Progressions (harder)'}
                                      </p>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {items.map(p => (
                                          <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: 8 }}>
                                            <DifficultyDots level={p.difficulty} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: 0, lineHeight: 1.55 }}>{p.description}</p>
                                              {p.ageGroup && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.ageGroup}</span>}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>{DIFFICULTY_LABELS[p.difficulty]}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Errors tab */}
                            {tab === 'errors' && (
                              <div style={{ padding: '1rem 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {skill.errors.length === 0 && <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No errors documented yet.</p>}
                                {skill.errors.map(err => (
                                  <div key={err.id} style={{ borderRadius: 10, border: '1px solid #fee2e2', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.7rem 0.85rem', background: '#fef2f2' }}>
                                      <span style={{ color: '#dc2626', flexShrink: 0, marginTop: '0.05rem' }}><IcX /></span>
                                      <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', margin: 0, lineHeight: 1.45 }}>{err.error}</p>
                                        {err.ageGroup && <span style={{ fontSize: '0.72rem', color: '#b91c1c' }}>{err.ageGroup}</span>}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.7rem 0.85rem', background: '#f0fdf4' }}>
                                      <span style={{ color: '#16a34a', flexShrink: 0, marginTop: '0.05rem' }}><IcCheck /></span>
                                      <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, lineHeight: 1.55 }}>{err.correction}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
