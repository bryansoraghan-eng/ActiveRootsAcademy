import { useState } from 'react';
import { STATIC_PROGRAMMES } from '../data/programmesData';

const CLASS_LEVELS = ['Infants', '1st-2nd', '3rd-4th', '5th-6th'];

interface Activity {
  name: string;
  description: string;
  duration: string;
}

interface Week {
  week: number;
  skillFocus: string[];
  warmUp: string;
  skillFocusDescription: string;
  activity1: Activity;
  activity2: Activity;
  coolDown: string;
  equipment: string[];
}

interface GeneratedProgramme {
  title: string;
  classLevel: string;
  weeks: Week[];
}

export default function Programmes() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [classLevel, setClassLevel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [programme, setProgramme] = useState<GeneratedProgramme | null>(null);
  const [error, setError] = useState('');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const generate = () => {
    if (!classLevel) return;
    setGenerating(true);
    setError('');
    setProgramme(null);
    setTimeout(() => {
      const result = STATIC_PROGRAMMES[classLevel];
      setProgramme(result ?? null);
      setExpandedWeek(1);
      setShowGenerator(false);
      setGenerating(false);
    }, 600);
  };

  const allEquipment = programme
    ? [...new Set(programme.weeks.flatMap(w => w.equipment))]
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Programmes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and generate PE programme blocks</p>
        </div>
        <button
          onClick={() => { setShowGenerator(true); setError(''); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <span>✦</span> Generate PE Programme
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Generator modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGenerator(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Generate 6-Week PE Programme</h2>
            <p className="text-slate-500 text-sm mb-6">
              Built on Active Roots Academy's 15 Fundamental Movement Skills framework. Select a class level to begin.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CLASS_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setClassLevel(level)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition ${
                    classLevel === level
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={generate}
                disabled={!classLevel || generating}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition"
              >
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Generating your programme…</p>
          <p className="text-slate-400 text-sm mt-1">Building your FMS programme for {classLevel}…</p>
        </div>
      )}

      {/* Generated programme */}
      {programme && !generating && (
        <div>
          {/* Header card */}
          <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">AI-Generated Programme</p>
                <h2 className="text-2xl font-bold">{programme.title}</h2>
                <p className="text-blue-200 mt-1">6 weeks · {programme.classLevel} · Active Roots FMS Framework</p>
              </div>
              <button
                onClick={() => { setShowGenerator(true); setError(''); setClassLevel(''); }}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Regenerate
              </button>
            </div>

            {/* Skill overview */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[...new Set(programme.weeks.flatMap(w => w.skillFocus))].map(skill => (
                <span key={skill} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Equipment list */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <span>🎒</span> Full Equipment List (all 6 weeks)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allEquipment.map(item => (
                <span key={item} className="bg-white border border-amber-200 text-amber-700 text-sm px-3 py-1 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Weeks */}
          <div className="space-y-3">
            {programme.weeks.map(week => (
              <div key={week.week} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      W{week.week}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Week {week.week}</p>
                      <div className="flex gap-1.5 mt-1">
                        {week.skillFocus.map(skill => (
                          <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">{expandedWeek === week.week ? '▲' : '▼'}</span>
                </button>

                {expandedWeek === week.week && (
                  <div className="border-t border-slate-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                      {/* Warm-up */}
                      <div className="bg-green-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <span>🏃</span> Warm-Up
                        </h4>
                        <p className="text-sm text-slate-700">{week.warmUp}</p>
                      </div>

                      {/* Skill Focus */}
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                          <span>🎯</span> Skill Focus: {week.skillFocus.join(' & ')}
                        </h4>
                        <p className="text-sm text-slate-700">{week.skillFocusDescription}</p>
                      </div>

                      {/* Activity 1 */}
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                            <span>⚡</span> Activity 1: {week.activity1.name}
                          </h4>
                          <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                            {week.activity1.duration}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{week.activity1.description}</p>
                      </div>

                      {/* Activity 2 */}
                      <div className="bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                            <span>⚡</span> Activity 2: {week.activity2.name}
                          </h4>
                          <span className="text-xs text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                            {week.activity2.duration}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{week.activity2.description}</p>
                      </div>
                    </div>

                    {/* Cool-down */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                        <span>🧘</span> Cool-Down
                      </h4>
                      <p className="text-sm text-slate-700">{week.coolDown}</p>
                    </div>

                    {/* Week equipment */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Equipment this week</h4>
                      <div className="flex flex-wrap gap-2">
                        {week.equipment.map(item => (
                          <span key={item} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!programme && !generating && (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📋
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">No programme generated yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Click "Generate PE Programme" to create a 6-week plan built on Active Roots Academy's 15 Fundamental Movement Skills framework.
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition"
          >
            Get started
          </button>
        </div>
      )}
    </div>
  );
}
