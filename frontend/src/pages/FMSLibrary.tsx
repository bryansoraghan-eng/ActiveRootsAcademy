import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Category = 'all' | 'locomotion' | 'object_control' | 'stability';

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
  locomotion: 'Locomotion',
  object_control: 'Object Control',
  stability: 'Stability',
};

const CATEGORY_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  locomotion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  object_control: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  stability: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Advanced'];

const CUE_ICONS: Record<string, string> = { verbal: '💬', visual: '👁', kinaesthetic: '🤲' };

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <div key={n} className={`w-2 h-2 rounded-full ${n <= level ? 'bg-blue-500' : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}

export default function FMSLibrary() {
  const [skills, setSkills] = useState<FMSSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, 'cues' | 'progressions' | 'errors'>>({});

  useEffect(() => {
    api.get<FMSSkill[]>('/fms')
      .then(setSkills)
      .catch(() => setError('Failed to load FMS library'))
      .finally(() => setLoading(false));
  }, []);

  const visible = category === 'all' ? skills : skills.filter(s => s.category === category);

  const byCategory = {
    locomotion: visible.filter(s => s.category === 'locomotion'),
    object_control: visible.filter(s => s.category === 'object_control'),
    stability: visible.filter(s => s.category === 'stability'),
  };

  const getTab = (skillId: string) => activeTab[skillId] ?? 'cues';
  const setTab = (skillId: string, tab: 'cues' | 'progressions' | 'errors') => {
    setActiveTab(prev => ({ ...prev, [skillId]: tab }));
  };

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  const parseJson = (str: string) => { try { return JSON.parse(str); } catch { return []; } };

  if (loading) return <div className="ara-loading">Loading FMS Library…</div>;

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">FMS Knowledge Library</h1>
          <p className="ara-page-subtitle">
            {skills.length} Fundamental Movement Skills — Active Roots Academy's expert knowledge base of teaching cues, progressions, and error corrections
          </p>
        </div>
      </div>

      <div className="ara-page">
      {error && <div className="ara-error">{error}</div>}

      {skills.length === 0 && !loading && (
        <div className="ara-seed-notice">
          <div className="ara-pending-banner-header">FMS Library not yet seeded</div>
          <div className="ara-seed-notice-body">
            <p className="ara-td-sub">Run the FMS seed script to populate the knowledge base:</p>
            <code className="ara-code ara-code-block">
              cd backend &amp;&amp; npx ts-node prisma/seed-fms.ts
            </code>
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="ara-filter-strip">
        {(['all', 'locomotion', 'object_control', 'stability'] as Category[]).map(cat => (
          <button key={cat} type="button" onClick={() => setCategory(cat)}
            className={`ara-filter-btn${category === cat ? ' ara-filter-btn-active' : ''}`}>
            {cat === 'all' ? `All Skills (${skills.length})` : `${CATEGORY_LABELS[cat]} (${skills.filter(s => s.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Skills grouped by category */}
      {Object.entries(byCategory).map(([cat, catSkills]) => {
        if (catSkills.length === 0) return null;
        const colours = CATEGORY_COLOURS[cat];
        return (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-widest">{CATEGORY_LABELS[cat]}</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colours.bg} ${colours.text}`}>
                {catSkills.length} skill{catSkills.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {catSkills.map(skill => (
                <div key={skill.id} className={`bg-white rounded-xl border overflow-hidden transition-shadow ${expanded === skill.id ? 'border-blue-200 shadow-md' : 'border-slate-200'}`}>
                  {/* Skill header */}
                  <button
                    type="button"
                    onClick={() => toggle(skill.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${colours.bg} ${colours.text}`}>
                        {skill.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{skill.name}</p>
                          {skill.isScoilnet && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Core Skill</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{skill.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <div className="hidden sm:flex gap-3 text-xs text-slate-500">
                        <span>{skill.cues.length} cues</span>
                        <span>{skill.progressions.length} progressions</span>
                        <span>{skill.errors.length} errors</span>
                      </div>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded === skill.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expanded === skill.id && (
                    <div className="border-t border-slate-100">
                      {/* Metadata row */}
                      <div className="px-6 py-3 bg-slate-50 flex flex-wrap gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                          {skill.spaceNeeded}
                        </span>
                        {parseJson(skill.ageGroups).map((ag: string) => (
                          <span key={ag} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{ag}</span>
                        ))}
                        {parseJson(skill.equipment).map((eq: string) => (
                          <span key={eq} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{eq}</span>
                        ))}
                      </div>

                      {/* Tabs */}
                      <div className="px-6 pt-4">
                        <div className="flex gap-1 border-b border-slate-100 mb-4">
                          {(['cues', 'progressions', 'errors'] as const).map(tab => (
                            <button key={tab} type="button" onClick={() => setTab(skill.id, tab)}
                              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                                getTab(skill.id) === tab
                                  ? 'border-blue-600 text-blue-700'
                                  : 'border-transparent text-slate-500 hover:text-slate-700'
                              }`}>
                              {tab === 'cues' ? 'Teaching Cues' : tab === 'progressions' ? 'Progressions & Regressions' : 'Common Errors'}
                              <span className="ml-1.5 text-xs text-slate-400">
                                ({tab === 'cues' ? skill.cues.length : tab === 'progressions' ? skill.progressions.length : skill.errors.length})
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Cues tab */}
                        {getTab(skill.id) === 'cues' && (
                          <div className="pb-5 space-y-2">
                            {skill.cues.length === 0 && <p className="text-slate-400 text-sm">No cues added yet.</p>}
                            {skill.cues.map(cue => (
                              <div key={cue.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <span className="text-base flex-shrink-0 mt-0.5">{CUE_ICONS[cue.cueType] ?? '💬'}</span>
                                <div>
                                  <p className="text-sm text-slate-800">{cue.cue}</p>
                                  {cue.ageGroup && (
                                    <span className="text-xs text-slate-500 mt-0.5 inline-block">For: {cue.ageGroup}</span>
                                  )}
                                </div>
                                <span className="ml-auto text-xs text-slate-400 capitalize flex-shrink-0">{cue.cueType}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Progressions tab */}
                        {getTab(skill.id) === 'progressions' && (
                          <div className="pb-5 space-y-3">
                            {['regression', 'progression'].map(dir => {
                              const items = skill.progressions.filter(p => p.direction === dir);
                              if (items.length === 0) return null;
                              return (
                                <div key={dir}>
                                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dir === 'regression' ? 'text-amber-600' : 'text-green-600'}`}>
                                    {dir === 'regression' ? '▼ Regressions (easier)' : '▲ Progressions (harder)'}
                                  </p>
                                  <div className="space-y-2">
                                    {items.map(p => (
                                      <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                                        <DifficultyDots level={p.difficulty} />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-slate-800">{p.description}</p>
                                          {p.ageGroup && <span className="text-xs text-slate-400">{p.ageGroup}</span>}
                                        </div>
                                        <span className="text-xs text-slate-400 flex-shrink-0">{DIFFICULTY_LABELS[p.difficulty]}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Errors tab */}
                        {getTab(skill.id) === 'errors' && (
                          <div className="pb-5 space-y-3">
                            {skill.errors.length === 0 && <p className="text-slate-400 text-sm">No errors documented yet.</p>}
                            {skill.errors.map(err => (
                              <div key={err.id} className="rounded-xl border border-slate-100 overflow-hidden">
                                <div className="flex items-start gap-2 p-3 bg-red-50">
                                  <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">✕</span>
                                  <div>
                                    <p className="text-sm font-medium text-red-800">{err.error}</p>
                                    {err.ageGroup && <span className="text-xs text-red-500">{err.ageGroup}</span>}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 p-3 bg-green-50">
                                  <span className="text-green-600 text-sm flex-shrink-0 mt-0.5">✓</span>
                                  <p className="text-sm text-green-800">{err.correction}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      </div>{/* end ara-page */}
    </div>
  );
}
