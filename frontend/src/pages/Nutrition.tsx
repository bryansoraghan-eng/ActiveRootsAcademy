import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

type Tab = 'expert' | 'lessons' | 'resources' | 'breaks';

interface Lesson { id: string; title: string; description: string; resources?: string | null; }
interface Resource { id: string; title: string; type: string; url?: string | null; content?: string | null; }
interface MovBreak { id: string; title: string; description: string; duration: number; ageGroup: string; instructions: string; }

interface MealSection {
  main: string;
  macroTag: string;
  alternatives: string[];
}
interface NutritionPlan {
  breakfast: MealSection;
  lunchbox: MealSection;
  snack: MealSection;
  hydration: { recommendation: string; encouragement: string };
  pickyEaterStrategy: string[];
  whyFoodsAreImportant?: string[];
  generatedBy?: string;
}

const RESOURCE_TYPES = ['video', 'pdf', 'link', 'worksheet', 'poster', 'other'];
const AGE_GROUPS = ['infant', 'junior', 'senior'];
const AGE_LABELS: Record<string, string> = { infant: 'Infants', junior: 'Junior (1st–2nd)', senior: 'Senior (3rd–6th)' };

const AGE_RANGES = ['4–5', '6–7', '8–9', '10–11', '12+'];
const PREFERENCE_OPTIONS = ['sweet', 'savoury', 'crunchy', 'soft', 'fruity', 'veggie-based', 'warm foods', 'cold foods'];
const ALLERGY_OPTIONS = ['nut-free', 'dairy-free', 'gluten-free', 'egg-free', 'soy-free', 'fish-free', 'sesame-free'];
const GOAL_OPTIONS = ['energy boost', 'focus & concentration', 'trying new foods', 'healthier snacks', 'balanced diet', 'hydration'];
const PICKY_LEVELS = ['mild', 'moderate', 'severe'];

function PlanSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Nutrition() {
  const [tab, setTab] = useState<Tab>('expert');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [breaks, setBreaks] = useState<MovBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Expert state
  const [expertForm, setExpertForm] = useState({
    ageRange: '',
    preferences: [] as string[],
    allergies: [] as string[],
    pickyEaterLevel: '',
    favouriteFoods: '',
    goals: [] as string[],
  });
  const [generating, setGenerating] = useState(false);
  const [expertError, setExpertError] = useState('');
  const [plan, setPlan] = useState<NutritionPlan | null>(null);

  // Lesson modal
  const [showLesson, setShowLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '' });
  const [savingLesson, setSavingLesson] = useState(false);

  // Resource modal
  const [showResource, setShowResource] = useState(false);
  const [resForm, setResForm] = useState({ title: '', type: 'link', url: '', content: '' });
  const [savingRes, setSavingRes] = useState(false);

  // Break modal
  const [showBreak, setShowBreak] = useState(false);
  const [breakForm, setBreakForm] = useState({ title: '', description: '', duration: '120', ageGroup: 'junior', instructions: '' });
  const [savingBreak, setSavingBreak] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: Exclude<Tab, 'expert'>; name: string } | null>(null);

  const load = async () => {
    try {
      const [ls, rs, bs] = await Promise.all([
        api.get<Lesson[]>('/nutrition/lessons'),
        api.get<Resource[]>('/nutrition/resources'),
        api.get<MovBreak[]>('/nutrition/movement-breaks'),
      ]);
      setLessons(ls);
      setResources(rs);
      setBreaks(bs);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleMulti = (field: 'preferences' | 'allergies' | 'goals', value: string) => {
    setExpertForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(x => x !== value) : [...f[field], value],
    }));
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setExpertError('');
    setPlan(null);
    try {
      const result = await api.post<NutritionPlan>('/nutrition/generate', expertForm);
      setPlan(result);
    } catch (err: any) {
      setExpertError(err?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      await api.post('/nutrition/lessons', lessonForm);
      setShowLesson(false);
      setLessonForm({ title: '', description: '' });
      load();
    } catch { setError('Failed to save lesson'); }
    finally { setSavingLesson(false); }
  };

  const handleAddResource = async (e: FormEvent) => {
    e.preventDefault();
    setSavingRes(true);
    try {
      await api.post('/nutrition/resources', { ...resForm, url: resForm.url || undefined, content: resForm.content || undefined });
      setShowResource(false);
      setResForm({ title: '', type: 'link', url: '', content: '' });
      load();
    } catch { setError('Failed to save resource'); }
    finally { setSavingRes(false); }
  };

  const handleAddBreak = async (e: FormEvent) => {
    e.preventDefault();
    setSavingBreak(true);
    try {
      await api.post('/nutrition/movement-breaks', { ...breakForm, duration: parseInt(breakForm.duration) });
      setShowBreak(false);
      setBreakForm({ title: '', description: '', duration: '120', ageGroup: 'junior', instructions: '' });
      load();
    } catch { setError('Failed to save movement break'); }
    finally { setSavingBreak(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const paths: Record<Exclude<Tab, 'expert'>, string> = {
      lessons: '/nutrition/lessons',
      resources: '/nutrition/resources',
      breaks: '/nutrition/movement-breaks',
    };
    try {
      await api.delete(`${paths[deleteTarget.type]}/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch { setError('Failed to delete item'); }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'expert', label: 'Nutrition Expert', icon: '🤖' },
    { key: 'lessons', label: 'Lessons', icon: '📖' },
    { key: 'resources', label: 'Resources', icon: '📎' },
    { key: 'breaks', label: 'Movement Breaks', icon: '🏃' },
  ];

  const chipClass = (active: boolean) =>
    `cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition select-none ${
      active
        ? 'bg-green-600 border-green-600 text-white'
        : 'bg-white border-slate-300 text-slate-600 hover:border-green-400 hover:text-green-700'
    }`;

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Nutrition &amp; Movement</h1>
          <p className="ara-page-subtitle">AI-powered nutrition guidance, lessons, resources, and classroom movement breaks</p>
        </div>
        {tab !== 'expert' && (
          <div className="ara-page-header-actions">
            <button type="button"
              onClick={() => {
                if (tab === 'lessons') setShowLesson(true);
                else if (tab === 'resources') setShowResource(true);
                else setShowBreak(true);
              }}
              className="ara-btn ara-btn-primary">
              + Add {tab === 'lessons' ? 'Lesson' : tab === 'resources' ? 'Resource' : 'Movement Break'}
            </button>
          </div>
        )}
      </div>

      <div className="ara-page">
      {error && <div className="ara-error">{error}</div>}

      {/* Tabs */}
      <div className="ara-tabs">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`ara-tab${tab === t.key ? ' ara-tab-active' : ''}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── NUTRITION EXPERT TAB ── */}
      {tab === 'expert' && (
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-base">🥗</div>
                  <div>
                    <h2 className="font-semibold text-slate-800 text-sm">Generate Nutrition Plan</h2>
                    <p className="text-xs text-slate-500">All fields are optional</p>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-5">
                  {/* Age Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Age Range</label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_RANGES.map(a => (
                        <button key={a} type="button" onClick={() => setExpertForm(f => ({ ...f, ageRange: f.ageRange === a ? '' : a }))}
                          className={chipClass(expertForm.ageRange === a)}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Picky Eater Level */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Picky Eater Level</label>
                    <div className="flex gap-2">
                      {PICKY_LEVELS.map(l => (
                        <button key={l} type="button" onClick={() => setExpertForm(f => ({ ...f, pickyEaterLevel: f.pickyEaterLevel === l ? '' : l }))}
                          className={chipClass(expertForm.pickyEaterLevel === l) + ' capitalize'}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Food Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {PREFERENCE_OPTIONS.map(p => (
                        <button key={p} type="button" onClick={() => toggleMulti('preferences', p)}
                          className={chipClass(expertForm.preferences.includes(p))}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Allergies / Dietary Requirements</label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGY_OPTIONS.map(a => (
                        <button key={a} type="button" onClick={() => toggleMulti('allergies', a)}
                          className={chipClass(expertForm.allergies.includes(a))}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {GOAL_OPTIONS.map(g => (
                        <button key={g} type="button" onClick={() => toggleMulti('goals', g)}
                          className={chipClass(expertForm.goals.includes(g))}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Favourite Foods */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Favourite Foods <span className="text-slate-400 font-normal normal-case">(free text)</span></label>
                    <input
                      type="text"
                      value={expertForm.favouriteFoods}
                      onChange={e => setExpertForm(f => ({ ...f, favouriteFoods: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. pizza, pasta, apples…"
                    />
                  </div>

                  {expertError && (
                    <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{expertError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Generating plan…
                      </>
                    ) : (
                      <>🥗 Generate Nutrition Plan</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {!plan && !generating && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3">🥗</div>
                  <p className="text-slate-600 font-medium text-sm">Active Roots Nutrition Expert</p>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs">Fill in the child's details on the left and generate a personalised, allergy-safe nutrition plan.</p>
                </div>
              )}

              {generating && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-green-500 mb-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <p className="text-slate-500 text-sm">Generating personalised nutrition plan…</p>
                </div>
              )}

              {plan && !generating && (
                <div className="space-y-4">
                  {/* Header badges */}
                  <div className="flex items-center flex-wrap gap-2">
                    {plan.generatedBy === 'database'
                      ? <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">Built from food database</span>
                      : <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">AI Generated</span>
                    }
                    {expertForm.ageRange && <span className="text-xs bg-green-50 border border-green-300 text-green-700 px-2 py-0.5 rounded-full">Age {expertForm.ageRange}</span>}
                    {expertForm.allergies.map(a => (
                      <span key={a} className="text-xs bg-amber-50 border border-amber-300 text-amber-700 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>

                  {/* Meal cards — 1 main + 2 alternatives */}
                  {([
                    { icon: '🌅', title: 'Breakfast', data: plan.breakfast },
                    { icon: '🥪', title: 'Lunchbox',  data: plan.lunchbox  },
                    { icon: '🍎', title: 'Snack',     data: plan.snack     },
                  ] as const).map(({ icon, title, data }) => data && (
                    <div key={title} className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{icon}</span>
                        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                        <span className="ml-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{data.macroTag}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mb-2">{data.main}</p>
                      {data.alternatives?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 font-medium mb-1.5">Alternatives</p>
                          <ul className="space-y-1">
                            {data.alternatives.map((alt, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{alt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Hydration */}
                  {plan.hydration && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">💧</span>
                        <h3 className="font-semibold text-slate-800 text-sm">Hydration</h3>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{plan.hydration.recommendation}</p>
                      <p className="text-sm text-slate-500 mt-1">{plan.hydration.encouragement}</p>
                    </div>
                  )}

                  {/* Picky eater */}
                  {plan.pickyEaterStrategy?.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🌟</span>
                        <h3 className="font-semibold text-slate-800 text-sm">Picky Eater Strategy</h3>
                      </div>
                      <ul className="space-y-2">
                        {plan.pickyEaterStrategy.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Why these foods are important */}
                  {plan.whyFoodsAreImportant && plan.whyFoodsAreImportant.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🌱</span>
                        <h3 className="font-semibold text-green-800 text-sm">Why These Foods Are Important</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {plan.whyFoodsAreImportant.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-green-900">
                            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center pb-2">
                    General healthy-eating guidance only — not medical advice.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LESSONS TAB ── */}
      {tab === 'lessons' && !loading && (
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">No lessons yet — add your first nutrition lesson</p>
            </div>
          ) : lessons.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📖</div>
                <div>
                  <p className="font-semibold text-slate-800">{l.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{l.description}</p>
                </div>
              </div>
              <button type="button" onClick={() => setDeleteTarget({ id: l.id, type: 'lessons', name: l.title })}
                className="text-sm text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition flex-shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ── RESOURCES TAB ── */}
      {tab === 'resources' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">No resources yet — add a link, PDF, or worksheet</p>
            </div>
          ) : resources.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium capitalize">{r.type}</span>
                <button type="button" onClick={() => setDeleteTarget({ id: r.id, type: 'resources', name: r.title })}
                  className="text-xs text-slate-400 hover:text-red-600 transition">Delete</button>
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{r.title}</p>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all">{r.url}</a>
              )}
              {r.content && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.content}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── MOVEMENT BREAKS TAB ── */}
      {tab === 'breaks' && !loading && (
        <div className="space-y-3">
          {breaks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">No movement breaks yet — add one for teachers to use in class</p>
            </div>
          ) : breaks.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏃</div>
                  <div>
                    <p className="font-semibold text-slate-800">{b.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{Math.floor(b.duration / 60)}:{String(b.duration % 60).padStart(2, '0')} min</span>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{AGE_LABELS[b.ageGroup] ?? b.ageGroup}</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setDeleteTarget({ id: b.id, type: 'breaks', name: b.title })}
                  className="text-sm text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition">Delete</button>
              </div>
              <p className="text-sm text-slate-500 ml-13 mt-2">{b.description}</p>
              <div className="mt-3 bg-slate-50 rounded-lg p-3 ml-13">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Instructions</p>
                <p className="text-sm text-slate-700">{b.instructions}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && tab !== 'expert' && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading…</div>
      )}

      </div>{/* end ara-page */}

      {/* Add Lesson modal */}
      {showLesson && (
        <Modal onClose={() => setShowLesson(false)} title="Add Nutrition Lesson">
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Healthy Eating – Food Groups" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What this lesson covers…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowLesson(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={savingLesson} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {savingLesson ? 'Saving…' : 'Add lesson'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Resource modal */}
      {showResource && (
        <Modal onClose={() => setShowResource(false)}>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Add Resource</h2>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required value={resForm.title} onChange={e => setResForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Resource title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="res-type">Type</label>
              <select id="res-type" value={resForm.type} onChange={e => setResForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize">
                {RESOURCE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="url" value={resForm.url} onChange={e => setResForm(f => ({ ...f, url: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="res-notes">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea id="res-notes" value={resForm.content} onChange={e => setResForm(f => ({ ...f, content: e.target.value }))} rows={2}
                placeholder="Optional notes…"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowResource(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={savingRes} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {savingRes ? 'Saving…' : 'Add resource'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Movement Break modal */}
      {showBreak && (
        <Modal onClose={() => setShowBreak(false)} title="Add Movement Break">
          <form onSubmit={handleAddBreak} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required value={breakForm.title} onChange={e => setBreakForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Star Jump Circuit" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="break-age">Age group</label>
                <select id="break-age" value={breakForm.ageGroup} onChange={e => setBreakForm(f => ({ ...f, ageGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {AGE_GROUPS.map(a => <option key={a} value={a}>{AGE_LABELS[a]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="break-duration">Duration (seconds)</label>
                <input id="break-duration" type="number" min="30" value={breakForm.duration} onChange={e => setBreakForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input required value={breakForm.description} onChange={e => setBreakForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief summary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
              <textarea required value={breakForm.instructions} onChange={e => setBreakForm(f => ({ ...f, instructions: e.target.value }))} rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Step-by-step instructions for the teacher…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowBreak(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={savingBreak} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {savingBreak ? 'Saving…' : 'Add movement break'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal title="Delete item?" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="ara-confirm-text"><strong>{deleteTarget.name}</strong> will be permanently deleted.</p>
          <div className="ara-form-footer">
            <button type="button" onClick={() => setDeleteTarget(null)} className="ara-btn ara-btn-secondary">Cancel</button>
            <button type="button" onClick={handleDelete} className="ara-btn ara-btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
