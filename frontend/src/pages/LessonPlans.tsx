import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

const CLASS_LEVELS = ['Infants', '1st-2nd', '3rd-4th', '5th-6th'];
const DURATIONS = [30, 40, 45, 60];
const ALL_SKILLS = [
  'Running', 'Jumping', 'Hopping', 'Skipping', 'Galloping', 'Leaping', 'Sliding',
  'Throwing', 'Catching', 'Kicking', 'Striking', 'Bouncing/Dribbling', 'Rolling',
  'Balancing', 'Dodging',
];
const EQUIPMENT_OPTIONS = [
  'Cones', 'Bibs', 'Footballs', 'Basketballs', 'Beanbags', 'Hoops',
  'Skipping Ropes', 'Agility Ladders', 'Hurdles', 'Parachute',
  'Tennis Balls', 'Foam Balls', 'Rubber Spots', 'Gym Mats',
  'None (classroom/minimal space)',
];
const WEEK_PRESETS = [1, 2, 4, 6, 8, 10, 12];

interface SavedPlan {
  id: string;
  title: string;
  classLevel: string;
  duration: number;
  skillFocus: string;
  warmUp: string;
  mainActivity: string;
  coolDown: string;
  equipment?: string | null;
  notes?: string | null;
  generatedBy: string;
  createdAt: string;
}

interface ActivitySection {
  activity: string;
  description: string;
  duration: string;
  coachingPoints: string[];
  diagram?: string;
}

interface MainActivitySection extends ActivitySection {
  differentiation: { easier: string; harder: string };
}

interface GeneratedPlan {
  id?: string;
  title: string;
  classLevel: string;
  duration: number;
  skillFocus: string[];
  warmUp: ActivitySection;
  mainActivity: MainActivitySection;
  coolDown: { activity: string; description: string; duration: string };
  equipment: string[];
  safetyNotes: string;
  teacherTips: string;
  generatedBy?: string;
}

interface WeekPlan {
  weekNumber: number;
  theme: string;
  skillFocus: string[];
  warmUp: ActivitySection;
  mainActivity: MainActivitySection;
  coolDown: { activity: string; description: string; duration: string };
  equipment: string[];
  teacherTips: string;
}

interface FullProgramme {
  id?: string;
  title: string;
  classLevel: string;
  totalWeeks: number;
  skillFocus: string[];
  equipment: string[];
  weeks: WeekPlan[];
  generatedBy?: string;
  createdAt?: string;
}

interface SavedProgramme {
  id: string;
  title: string;
  classLevel: string;
  totalWeeks: number;
  skillFocus: string;
  equipment: string;
  weeks: string;
  generatedBy: string;
  createdAt: string;
}

function parseJ(s?: string | null) { try { return s ? JSON.parse(s) : null; } catch { return null; } }
function fmt(d: string) { return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function LessonPlans() {
  const [mode, setMode] = useState<'plans' | 'programmes'>('plans');

  // ── Lesson Plans state ──
  const [saved, setSaved] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPlan | null>(null);
  const [viewing, setViewing] = useState<GeneratedPlan | null>(null);
  const [planError, setPlanError] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [duration, setDuration] = useState(45);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // ── Programme Builder state ──
  const [savedProgrammes, setSavedProgrammes] = useState<SavedProgramme[]>([]);
  const [loadingProg, setLoadingProg] = useState(true);
  const [showProgGenerator, setShowProgGenerator] = useState(false);
  const [generatingProg, setGeneratingProg] = useState(false);
  const [currentProgramme, setCurrentProgramme] = useState<FullProgramme | null>(null);
  const [viewingProgramme, setViewingProgramme] = useState<FullProgramme | null>(null);
  const [progError, setProgError] = useState('');
  const [progClassLevel, setProgClassLevel] = useState('');
  const [progWeeks, setProgWeeks] = useState(6);
  const [extendedWeeks, setExtendedWeeks] = useState(false);
  const [progSkills, setProgSkills] = useState<string[]>([]);
  const [progEquipment, setProgEquipment] = useState<string[]>([]);

  const loadPlans = () => {
    api.get<SavedPlan[]>('/lesson-plans')
      .then(setSaved)
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  };

  const loadProgrammes = () => {
    api.get<SavedProgramme[]>('/lesson-plans/programmes')
      .then(setSavedProgrammes)
      .catch(() => {})
      .finally(() => setLoadingProg(false));
  };

  useEffect(() => { loadPlans(); loadProgrammes(); }, []);

  const toggleSkill = (skill: string, list: string[], setList: (v: string[]) => void, max = 4) => {
    setList(list.includes(skill) ? list.filter(s => s !== skill) : list.length < max ? [...list, skill] : list);
  };

  const toggleEquipment = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(e => e !== item) : [...list, item]);
  };

  // ── Single lesson plan generate ──
  const generatePlan = async () => {
    if (!classLevel || selectedSkills.length === 0) return;
    setGenerating(true);
    setPlanError('');
    try {
      const result = await api.post<GeneratedPlan>('/lesson-plans/generate', {
        classLevel, duration, skillFocus: selectedSkills, equipment: selectedEquipment,
      });
      setGenerated(result);
      setShowGenerator(false);
      loadPlans();
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Failed to generate lesson plan');
    } finally {
      setGenerating(false);
    }
  };

  // ── Programme generate ──
  const generateProgramme = async () => {
    if (!progClassLevel || progSkills.length === 0) return;
    setGeneratingProg(true);
    setProgError('');
    try {
      const result = await api.post<FullProgramme>('/lesson-plans/generate-programme', {
        classLevel: progClassLevel,
        weeks: progWeeks,
        skillFocus: progSkills,
        equipment: progEquipment,
      });
      setCurrentProgramme(result);
      setViewingProgramme(null);
      setShowProgGenerator(false);
      loadProgrammes();
    } catch (err) {
      setProgError(err instanceof Error ? err.message : 'Failed to generate programme');
    } finally {
      setGeneratingProg(false);
    }
  };

  const deletePlan = async (id: string) => {
    try { await api.delete(`/lesson-plans/${id}`); loadPlans(); } catch { /* deletion errors are non-critical */ }
  };

  const deleteProgramme = async (id: string) => {
    try { await api.delete(`/lesson-plans/programmes/${id}`); loadProgrammes(); } catch { /* deletion errors are non-critical */ }
  };

  const openSavedPlan = (plan: SavedPlan) => {
    setGenerated(null);
    setViewing({
      id: plan.id,
      title: plan.title,
      classLevel: plan.classLevel,
      duration: plan.duration,
      skillFocus: parseJ(plan.skillFocus) ?? [],
      warmUp: parseJ(plan.warmUp) ?? {},
      mainActivity: parseJ(plan.mainActivity) ?? {},
      coolDown: parseJ(plan.coolDown) ?? {},
      equipment: parseJ(plan.equipment) ?? [],
      safetyNotes: parseJ(plan.notes)?.safetyNotes ?? '',
      teacherTips: parseJ(plan.notes)?.teacherTips ?? '',
    });
  };

  const openSavedProgramme = (prog: SavedProgramme) => {
    setCurrentProgramme(null);
    setViewingProgramme({
      id: prog.id,
      title: prog.title,
      classLevel: prog.classLevel,
      totalWeeks: prog.totalWeeks,
      skillFocus: parseJ(prog.skillFocus) ?? [],
      equipment: parseJ(prog.equipment) ?? [],
      weeks: parseJ(prog.weeks) ?? [],
      generatedBy: prog.generatedBy,
      createdAt: prog.createdAt,
    });
  };

  const displayPlan = generated ?? viewing;
  const displayProgramme = currentProgramme ?? viewingProgramme;

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Lesson Plans &amp; Programmes</h1>
          <p className="ara-page-subtitle">AI-generated, FMS-aligned content for Irish primary schools</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button"
            onClick={() => mode === 'plans'
              ? (setShowGenerator(true), setGenerated(null), setPlanError(''), setClassLevel(''), setSelectedSkills([]), setSelectedEquipment([]), setDuration(45))
              : (setShowProgGenerator(true), setProgError(''), setProgClassLevel(''), setProgSkills([]), setProgEquipment([]), setProgWeeks(6))
            }
            className="ara-btn ara-btn-primary">
            {mode === 'plans' ? '⚡ Generate Lesson Plan' : '📅 Build Programme'}
          </button>
        </div>
      </div>

      <div className="ara-page">
      {/* Mode tabs */}
      <div className="ara-tabs">
        {[
          { key: 'plans', label: 'Lesson Plans', icon: '📖' },
          { key: 'programmes', label: 'Programme Builder', icon: '📅' },
        ].map(t => (
          <button key={t.key} type="button" onClick={() => setMode(t.key as 'plans' | 'programmes')}
            className={`ara-tab${mode === t.key ? ' ara-tab-active' : ''}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── LESSON PLANS MODE ── */}
      {mode === 'plans' && (
        <>
          {planError && <div className="ara-error">{planError}</div>}
          {generating && (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center mb-6">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-700 font-medium">Generating your lesson plan…</p>
              <p className="text-slate-400 text-sm mt-1">Using FMS knowledge base for {classLevel} · {selectedSkills.join(', ')}</p>
            </div>
          )}
          <div className="flex gap-6">
            <div className={`${displayPlan && !generating ? 'w-72 flex-shrink-0' : 'flex-1'}`}>
              <h2 className="ara-section-label">Saved Plans ({saved.length})</h2>
              {loadingPlans ? (
                <p className="text-slate-400 text-sm">Loading…</p>
              ) : saved.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">📖</div>
                  <p className="text-slate-500 text-sm">No lesson plans yet</p>
                  <p className="text-slate-400 text-xs mt-1">Generate your first FMS-aligned plan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {saved.map(plan => (
                    <div key={plan.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 transition cursor-pointer group"
                      onClick={() => { openSavedPlan(plan); }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{plan.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{plan.classLevel}</span>
                            <span className="text-xs text-slate-400">{plan.duration} min</span>
                            <span className="text-xs text-slate-400">{fmt(plan.createdAt)}</span>
                            {plan.generatedBy === 'database' && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">FMS library</span>}
                          </div>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {(parseJ(plan.skillFocus) ?? []).map((s: string) => (
                              <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deletePlan(plan.id); }}
                          className="text-slate-300 hover:text-red-500 transition flex-shrink-0 opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {displayPlan && !generating && (
              <div className="flex-1 min-w-0">
                <PlanView plan={displayPlan} isNew={!!generated} onClose={() => { setGenerated(null); setViewing(null); }} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PROGRAMME BUILDER MODE ── */}
      {mode === 'programmes' && (
        <>
          {progError && <div className="ara-error">{progError}</div>}
          {generatingProg && (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center mb-6">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-700 font-medium">Building your {progWeeks}-week programme…</p>
              <p className="text-slate-400 text-sm mt-1">Generating progressive plans for {progClassLevel} · {progSkills.join(', ')}</p>
            </div>
          )}
          <div className="flex gap-6">
            <div className={`${displayProgramme && !generatingProg ? 'w-72 flex-shrink-0' : 'flex-1'}`}>
              <h2 className="ara-section-label">Saved Programmes ({savedProgrammes.length})</h2>
              {loadingProg ? (
                <p className="text-slate-400 text-sm">Loading…</p>
              ) : savedProgrammes.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">📅</div>
                  <p className="text-slate-500 text-sm">No programmes yet</p>
                  <p className="text-slate-400 text-xs mt-1">Build your first multi-week programme</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedProgrammes.map(prog => (
                    <div key={prog.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 transition cursor-pointer group"
                      onClick={() => openSavedProgramme(prog)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{prog.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{prog.classLevel}</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{prog.totalWeeks} weeks</span>
                            <span className="text-xs text-slate-400">{fmt(prog.createdAt)}</span>
                            {prog.generatedBy === 'database' && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">FMS library</span>}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteProgramme(prog.id); }}
                          className="text-slate-300 hover:text-red-500 transition flex-shrink-0 opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {displayProgramme && !generatingProg && (
              <div className="flex-1 min-w-0">
                <ProgrammeView programme={displayProgramme} isNew={!!currentProgramme} onClose={() => { setCurrentProgramme(null); setViewingProgramme(null); }} />
              </div>
            )}
          </div>
        </>
      )}

      </div>{/* end ara-page */}

      {/* ── Lesson Plan Generator Modal ── */}
      {showGenerator && (
        <Modal onClose={() => setShowGenerator(false)} title="Generate Lesson Plan" size="lg">
          <div className="ara-form-group">
            <label className="ara-form-label">Class Level</label>
            <div className="ara-chip-grid">
              {CLASS_LEVELS.map(level => (
                <button key={level} type="button" onClick={() => setClassLevel(level)}
                  className={`ara-chip${classLevel === level ? ' ara-chip-active' : ''}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Duration</label>
            <div className="ara-chip-grid">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => setDuration(d)}
                  className={`ara-chip${duration === d ? ' ara-chip-active' : ''}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Skill Focus <span className="ara-td-sub">(select 1–4)</span></label>
            <div className="ara-chip-grid ara-chip-grid-3">
              {ALL_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill, selectedSkills, setSelectedSkills)}
                  className={`ara-chip${selectedSkills.includes(skill) ? ' ara-chip-active' : selectedSkills.length >= 4 ? ' ara-chip-disabled' : ''}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Available Equipment</label>
            <div className="ara-chip-grid ara-chip-grid-3">
              {EQUIPMENT_OPTIONS.map(item => (
                <button key={item} type="button" onClick={() => toggleEquipment(item, selectedEquipment, setSelectedEquipment)}
                  className={`ara-chip ara-chip-amber${selectedEquipment.includes(item) ? ' ara-chip-amber-active' : ''}`}>
                  {item}
                </button>
              ))}
            </div>
            {selectedEquipment.length > 0 && (
              <p className="ara-td-sub" style={{ marginTop: 6 }}>Selected: {selectedEquipment.join(', ')}</p>
            )}
          </div>
          <div className="ara-form-footer">
            <button type="button" onClick={() => setShowGenerator(false)} className="ara-btn ara-btn-secondary">Cancel</button>
            <button type="button" onClick={generatePlan}
              disabled={!classLevel || selectedSkills.length === 0}
              className="ara-btn ara-btn-primary">
              Generate
            </button>
          </div>
        </Modal>
      )}

      {/* ── Programme Generator Modal ── */}
      {showProgGenerator && (
        <Modal onClose={() => setShowProgGenerator(false)} title="Build Multi-Week Programme" size="lg">
          <div className="ara-form-group">
            <label className="ara-form-label">Class Level</label>
            <div className="ara-chip-grid">
              {CLASS_LEVELS.map(level => (
                <button key={level} type="button" onClick={() => setProgClassLevel(level)}
                  className={`ara-chip${progClassLevel === level ? ' ara-chip-active' : ''}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Number of Weeks</label>
            <div className="ara-chip-grid">
              {(extendedWeeks ? [13,14,15,16,17,18,19,20,21,22,23,24] : WEEK_PRESETS).map(w => (
                <button key={w} type="button" onClick={() => setProgWeeks(w)}
                  className={`ara-chip${progWeeks === w ? ' ara-chip-active' : ''}`}>
                  {w}
                </button>
              ))}
              <button type="button" onClick={() => { setExtendedWeeks(!extendedWeeks); setProgWeeks(extendedWeeks ? 6 : 13); }}
                className="ara-chip ara-chip-dashed">
                {extendedWeeks ? '← Standard' : 'Extended (13–24) →'}
              </button>
            </div>
            <p className="ara-td-sub" style={{ marginTop: 4 }}>Selected: <strong>{progWeeks} weeks</strong></p>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Skill Focus <span className="ara-td-sub">(select 1–4)</span></label>
            <div className="ara-chip-grid ara-chip-grid-3">
              {ALL_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill, progSkills, setProgSkills)}
                  className={`ara-chip${progSkills.includes(skill) ? ' ara-chip-active' : progSkills.length >= 4 ? ' ara-chip-disabled' : ''}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label">Available Equipment</label>
            <div className="ara-chip-grid ara-chip-grid-3">
              {EQUIPMENT_OPTIONS.map(item => (
                <button key={item} type="button" onClick={() => toggleEquipment(item, progEquipment, setProgEquipment)}
                  className={`ara-chip ara-chip-amber${progEquipment.includes(item) ? ' ara-chip-amber-active' : ''}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          {progError && <div className="ara-error">{progError}</div>}
          <div className="ara-form-footer">
            <button type="button" onClick={() => setShowProgGenerator(false)} className="ara-btn ara-btn-secondary">Cancel</button>
            <button type="button" onClick={generateProgramme}
              disabled={!progClassLevel || progSkills.length === 0}
              className="ara-btn ara-btn-primary">
              Build Programme
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Diagram panel ──────────────────────────────────────────────────────────────
function DiagramPanel({ diagram }: { diagram?: string }) {
  const [open, setOpen] = useState(false);
  if (!diagram) return null;
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition">
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 9l-7 7-7-7"/>
        </svg>
        {open ? 'Hide diagram' : 'Show diagram'}
      </button>
      {open && (
        <div className="mt-2 bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs whitespace-pre overflow-x-auto leading-relaxed">
          {diagram}
        </div>
      )}
    </div>
  );
}

// ── Single lesson plan view ────────────────────────────────────────────────────
function PlanView({ plan, isNew, onClose }: { plan: GeneratedPlan; isNew: boolean; onClose: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-[#0f172a] p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isNew && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Just generated</span>}
              {plan.generatedBy === 'database' && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Built from FMS library</span>}
              {plan.generatedBy === 'ai' && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">AI generated</span>}
            </div>
            <h2 className="text-xl font-bold">{plan.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{plan.classLevel} · {plan.duration} minutes</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {plan.skillFocus.map(s => <span key={s} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{s}</span>)}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {plan.equipment?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Equipment needed</p>
            <div className="flex flex-wrap gap-2">
              {plan.equipment.map(eq => <span key={eq} className="bg-white border border-amber-200 text-amber-700 text-sm px-3 py-1 rounded-full">{eq}</span>)}
            </div>
          </div>
        )}

        <PlanSection colour="green" icon="🏃" label={`Warm-Up · ${plan.warmUp?.duration}`} title={plan.warmUp?.activity}>
          <p className="text-sm text-slate-700 mb-3">{plan.warmUp?.description}</p>
          {plan.warmUp?.coachingPoints?.length > 0 && (
            <ul className="space-y-1 mb-2">
              {plan.warmUp.coachingPoints.map((cp, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{cp}</li>
              ))}
            </ul>
          )}
          <DiagramPanel diagram={plan.warmUp?.diagram} />
        </PlanSection>

        <PlanSection colour="blue" icon="⚡" label={`Main Activity · ${plan.mainActivity?.duration}`} title={plan.mainActivity?.activity}>
          <p className="text-sm text-slate-700 mb-3">{plan.mainActivity?.description}</p>
          {plan.mainActivity?.coachingPoints?.length > 0 && (
            <ul className="space-y-1 mb-3">
              {plan.mainActivity.coachingPoints.map((cp, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>{cp}</li>
              ))}
            </ul>
          )}
          {plan.mainActivity?.differentiation && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">▼ Make easier</p>
                <p className="text-xs text-amber-800">{plan.mainActivity.differentiation.easier}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">▲ Challenge</p>
                <p className="text-xs text-green-800">{plan.mainActivity.differentiation.harder}</p>
              </div>
            </div>
          )}
          <DiagramPanel diagram={plan.mainActivity?.diagram} />
        </PlanSection>

        <PlanSection colour="slate" icon="🧘" label={`Cool-Down · ${plan.coolDown?.duration}`} title={plan.coolDown?.activity}>
          <p className="text-sm text-slate-700">{plan.coolDown?.description}</p>
        </PlanSection>

        {(plan.safetyNotes || plan.teacherTips) && (
          <div className="grid grid-cols-2 gap-4">
            {plan.safetyNotes && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Safety Notes</p>
                <p className="text-sm text-red-800">{plan.safetyNotes}</p>
              </div>
            )}
            {plan.teacherTips && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Teacher Tips</p>
                <p className="text-sm text-blue-800">{plan.teacherTips}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Multi-week programme view ──────────────────────────────────────────────────
function ProgrammeView({ programme, isNew, onClose }: { programme: FullProgramme; isNew: boolean; onClose: () => void }) {
  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-[#0f172a] p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isNew && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Just generated</span>}
              {programme.generatedBy === 'database' && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Built from FMS library</span>}
              {programme.generatedBy === 'ai' && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">AI generated</span>}
            </div>
            <h2 className="text-xl font-bold">{programme.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{programme.classLevel} · {programme.totalWeeks} weeks</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(programme.skillFocus ?? []).map(s => <span key={s} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{s}</span>)}
          {(programme.equipment ?? []).filter(e => e !== 'None (classroom/minimal space)').map(e => (
            <span key={e} className="bg-amber-500/30 text-amber-200 text-xs px-3 py-1 rounded-full">{e}</span>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
        {(programme.weeks ?? []).map(week => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            isExpanded={expandedWeek === week.weekNumber}
            onToggle={() => setExpandedWeek(expandedWeek === week.weekNumber ? 0 : week.weekNumber)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Week card ──────────────────────────────────────────────────────────────────
function WeekCard({ week, isExpanded, onToggle }: { week: WeekPlan; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
            W{week.weekNumber}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{week.theme}</p>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {(week.skillFocus ?? []).map(s => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>)}
              {(week.equipment ?? []).slice(0, 2).map(e => <span key={e} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{e}</span>)}
            </div>
          </div>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/30">
          {/* Warm-up */}
          <WeekSection colour="green" icon="🏃" label={`Warm-Up · ${week.warmUp?.duration}`} title={week.warmUp?.activity}>
            <p className="text-sm text-slate-700 mb-2">{week.warmUp?.description}</p>
            {week.warmUp?.coachingPoints?.length > 0 && (
              <ul className="space-y-1 mb-2">
                {week.warmUp.coachingPoints.map((cp, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><span className="text-green-500">•</span>{cp}</li>
                ))}
              </ul>
            )}
            <DiagramPanel diagram={week.warmUp?.diagram} />
          </WeekSection>

          {/* Main Activity */}
          <WeekSection colour="blue" icon="⚡" label={`Main Activity · ${week.mainActivity?.duration}`} title={week.mainActivity?.activity}>
            <p className="text-sm text-slate-700 mb-2">{week.mainActivity?.description}</p>
            {week.mainActivity?.coachingPoints?.length > 0 && (
              <ul className="space-y-1 mb-2">
                {week.mainActivity.coachingPoints.map((cp, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><span className="text-blue-500">•</span>{cp}</li>
                ))}
              </ul>
            )}
            {week.mainActivity?.differentiation && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-amber-50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">▼ Make easier</p>
                  <p className="text-xs text-amber-800">{week.mainActivity.differentiation.easier}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-green-700 mb-1">▲ Challenge</p>
                  <p className="text-xs text-green-800">{week.mainActivity.differentiation.harder}</p>
                </div>
              </div>
            )}
            <DiagramPanel diagram={week.mainActivity?.diagram} />
          </WeekSection>

          {/* Cool-down */}
          <WeekSection colour="slate" icon="🧘" label={`Cool-Down · ${week.coolDown?.duration}`} title={week.coolDown?.activity}>
            <p className="text-sm text-slate-700">{week.coolDown?.description}</p>
          </WeekSection>

          {week.teacherTips && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Teacher Tips</p>
              <p className="text-xs text-blue-800">{week.teacherTips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section components ─────────────────────────────────────────────────────────
function PlanSection({ colour, icon, label, title, children }: {
  colour: string; icon: string; label: string; title?: string; children: React.ReactNode;
}) {
  const bg: Record<string, string> = { green: 'bg-green-50 border-green-100', blue: 'bg-blue-50 border-blue-100', slate: 'bg-slate-50 border-slate-100' };
  const lbl: Record<string, string> = { green: 'text-green-700', blue: 'text-blue-700', slate: 'text-slate-600' };
  return (
    <div className={`rounded-xl border p-4 ${bg[colour] ?? 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${lbl[colour]}`}>{label}</span>
        {title && <span className="text-sm font-semibold text-slate-800 ml-1">· {title}</span>}
      </div>
      {children}
    </div>
  );
}

function WeekSection({ colour, icon, label, title, children }: {
  colour: string; icon: string; label: string; title?: string; children: React.ReactNode;
}) {
  const bg: Record<string, string> = { green: 'bg-green-50/70 border-green-100', blue: 'bg-blue-50/70 border-blue-100', slate: 'bg-white border-slate-100' };
  const lbl: Record<string, string> = { green: 'text-green-700', blue: 'text-blue-700', slate: 'text-slate-600' };
  return (
    <div className={`rounded-xl border p-3 ${bg[colour] ?? 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${lbl[colour]}`}>{label}</span>
        {title && <span className="text-xs font-semibold text-slate-700 ml-1">· {title}</span>}
      </div>
      {children}
    </div>
  );
}
