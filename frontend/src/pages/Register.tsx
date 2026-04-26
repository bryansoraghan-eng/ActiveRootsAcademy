import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface School { id: string; name: string; schoolCode?: string; }

const SELF_REG_ROLES = [
  { value: 'teacher',      label: 'Teacher',      desc: 'Class teacher at a school',          needsCode: true,  pending: false },
  { value: 'coach',        label: 'Coach',         desc: 'Active Roots coach / specialist',    needsCode: false, pending: false },
  { value: 'school_admin', label: 'School Admin',  desc: 'School office or management staff',  needsCode: false, pending: true  },
  { value: 'principal',    label: 'Principal',     desc: 'School principal or deputy',         needsCode: false, pending: true  },
];

type Step = 'details' | 'role' | 'school' | 'done';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [schools, setSchools] = useState<School[]>([]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: '', schoolId: '', schoolCode: '',
  });

  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [resolvedSchool, setResolvedSchool] = useState<School | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; pending: boolean } | null>(null);

  const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

  useEffect(() => {
    fetch(`${BASE}/auth/schools`)
      .then(r => r.json())
      .then(setSchools)
      .catch(() => {});
  }, []);

  const selectedRole = SELF_REG_ROLES.find(r => r.value === form.role);

  // Live school code lookup
  const lookupCode = async (code: string) => {
    if (code.length < 4) { setCodeStatus('idle'); setResolvedSchool(null); return; }
    setCodeStatus('checking');
    try {
      const res = await fetch(`${BASE}/auth/validate-school-code/${code.toUpperCase()}`);
      if (res.ok) {
        const school = await res.json();
        setResolvedSchool(school);
        setForm(f => ({ ...f, schoolId: school.id }));
        setCodeStatus('valid');
      } else {
        setResolvedSchool(null);
        setCodeStatus('invalid');
      }
    } catch {
      setCodeStatus('invalid');
    }
  };

  const handleCodeChange = (val: string) => {
    setForm(f => ({ ...f, schoolCode: val, schoolId: resolvedSchool?.id === form.schoolId ? '' : form.schoolId }));
    setResolvedSchool(null);
    lookupCode(val);
  };

  const validateDetails = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!form.email.trim() || !form.email.includes('@')) return 'Please enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const nextFromDetails = (e: FormEvent) => {
    e.preventDefault();
    const err = validateDetails();
    if (err) { setError(err); return; }
    setError('');
    setStep('role');
  };

  const nextFromRole = () => {
    if (!form.role) { setError('Please select a role.'); return; }
    setError('');
    setStep('school');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole?.needsCode && codeStatus !== 'valid') {
      setError('Please enter a valid school code to continue as a Teacher.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          schoolId: form.schoolId || undefined,
          schoolCode: form.schoolCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setResult({ message: data.message, pending: !!data.pending });
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (step === 'done' && result) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className={`w-14 h-14 ${result.pending ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-2xl ${result.pending ? 'text-amber-600' : 'text-green-600'}`}>{result.pending ? '⏳' : '✓'}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {result.pending ? 'Request submitted' : 'Account created!'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">{result.message}</p>
            {!result.pending && (
              <button onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition text-sm">
                Go to sign in
              </button>
            )}
            {result.pending && (
              <button onClick={() => navigate('/login')}
                className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 rounded-lg transition text-sm">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Active Roots Academy</h1>
          <p className="text-slate-400 mt-1 text-sm">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['details', 'role', 'school'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-blue-600 text-white scale-110' :
                (['details', 'role', 'school'].indexOf(step) > i) ? 'bg-green-500 text-white' :
                'bg-white/10 text-slate-400'
              }`}>
                {(['details', 'role', 'school'].indexOf(step) > i) ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${(['details', 'role', 'school'].indexOf(step) > i) ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {/* ── Step 1: Details ── */}
          {step === 'details' && (
            <form onSubmit={nextFromDetails} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Your details</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@school.ie" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                <input required type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat your password" />
              </div>
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition text-sm mt-2">
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 2: Role ── */}
          {step === 'role' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Select your role</h2>
              <p className="text-slate-500 text-sm mb-4">Choose the role that best describes your position.</p>
              <div className="space-y-2">
                {SELF_REG_ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      form.role === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-sm ${form.role === r.value ? 'text-blue-700' : 'text-slate-800'}`}>{r.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                      </div>
                      {r.pending && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">Needs approval</span>
                      )}
                      {form.role === r.value && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedRole?.pending && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Note:</strong> {selectedRole.label} accounts require admin approval. Your request will be reviewed before you can sign in.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setStep('details'); setError(''); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">← Back</button>
                <button onClick={nextFromRole} disabled={!form.role}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: School ── */}
          {step === 'school' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Link your school</h2>

              {selectedRole?.needsCode ? (
                <>
                  <p className="text-slate-500 text-sm">Teachers must enter a school code to join their school. Ask your school administrator for your code.</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">School code</label>
                    <div className="relative">
                      <input
                        value={form.schoolCode}
                        onChange={e => handleCodeChange(e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm font-mono uppercase tracking-widest focus:outline-none transition ${
                          codeStatus === 'valid' ? 'border-green-500 focus:ring-2 focus:ring-green-400' :
                          codeStatus === 'invalid' ? 'border-red-400 focus:ring-2 focus:ring-red-400' :
                          'border-slate-300 focus:ring-2 focus:ring-blue-500'
                        }`}
                        placeholder="e.g. ARS7K2"
                        maxLength={8}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {codeStatus === 'checking' && <span className="text-slate-400">…</span>}
                        {codeStatus === 'valid' && <span className="text-green-600">✓</span>}
                        {codeStatus === 'invalid' && <span className="text-red-500">✗</span>}
                      </div>
                    </div>
                    {codeStatus === 'valid' && resolvedSchool && (
                      <p className="text-green-700 text-xs mt-1.5 flex items-center gap-1">
                        <span>✓</span> {resolvedSchool.name}
                      </p>
                    )}
                    {codeStatus === 'invalid' && (
                      <p className="text-red-600 text-xs mt-1.5">Code not found — check with your school administrator.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-500 text-sm">
                    {selectedRole?.pending
                      ? 'Optionally link to a school. An admin will assign your school if needed.'
                      : 'Enter your school code to link your account, or select from the list.'}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      School code <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        value={form.schoolCode}
                        onChange={e => handleCodeChange(e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm font-mono uppercase tracking-widest focus:outline-none transition ${
                          codeStatus === 'valid' ? 'border-green-500' :
                          codeStatus === 'invalid' ? 'border-red-400' :
                          'border-slate-300 focus:ring-2 focus:ring-blue-500'
                        }`}
                        placeholder="Enter code or select below"
                        maxLength={8}
                      />
                    </div>
                    {codeStatus === 'valid' && resolvedSchool && (
                      <p className="text-green-700 text-xs mt-1.5">✓ {resolvedSchool.name}</p>
                    )}
                  </div>
                  {!resolvedSchool && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Or select a school
                      </label>
                      <select value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">No school yet</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep('role'); setError(''); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition">← Back</button>
                <button type="submit" disabled={loading || (selectedRole?.needsCode && codeStatus !== 'valid')}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition">
                  {loading ? 'Creating…' : selectedRole?.pending ? 'Submit Request' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
