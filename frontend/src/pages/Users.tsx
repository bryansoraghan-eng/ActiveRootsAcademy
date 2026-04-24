import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DEFAULT_PERMISSIONS, ROLE_LABELS, ROLE_COLOURS, resolvePermissions } from '../lib/permissions';
import type { ModuleKey, Permissions } from '../lib/permissions';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface School { id: string; name: string; }
interface UserRecord {
  id: string; name: string; email: string; role: string; status: string;
  school: School | null; permissions: string; createdAt: string;
}

const ROLES = ['admin', 'school_admin', 'principal', 'coach', 'teacher'] as const;

const MODULE_LABELS: Record<ModuleKey, string> = {
  schools:        'Schools',
  teachers:       'Teachers',
  classes:        'Classes',
  coaches:        'Coaches',
  programmes:     'Programmes',
  bookings:       'Bookings',
  assessments:    'Assessments',
  placements:     'Placements',
  nutrition:      'Nutrition',
  lessonPlans:    'Lesson Plans',
  fmsLibrary:     'FMS Library',
  users:          'Team / Users',
  movementBreaks: 'Movement Breaks',
};

const ALL_MODULES = Object.keys(MODULE_LABELS) as ModuleKey[];

function parsePerms(raw: string): Partial<Permissions> {
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

// Toggle switch component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [pending, setPending] = useState<UserRecord[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', schoolId: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      api.get<UserRecord[]>('/users'),
      api.get<UserRecord[]>('/users/pending'),
      api.get<School[]>('/schools'),
    ]).then(([u, p, s]) => {
      setUsers(u);
      setPending(p);
      setSchools(s);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    setFormError('');
    if (!form.name || !form.email || !form.password) { setFormError('Name, email, and password are required.'); return; }
    setSaving(true);
    try {
      await api.post('/users', form);
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'teacher', schoolId: '' });
      load();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await api.put(`/users/${id}/approve`, {});
      load();
    } catch {}
    finally { setApproving(null); }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Reject and remove ${name}'s account request?`)) return;
    try {
      await api.delete(`/users/${id}/reject`);
      load();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  if (loading) return <div className="p-8 text-slate-400">Loading team…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} active account{users.length !== 1 ? 's' : ''}{pending.length > 0 ? ` · ${pending.length} pending` : ''}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => { setShowAdd(true); setFormError(''); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4"/></svg>
            Add User
          </button>
        )}
      </div>

      {/* Pending approvals */}
      {currentUser?.role === 'admin' && pending.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-semibold text-amber-800">Pending Approval ({pending.length})</p>
          </div>
          <div className="divide-y divide-amber-100">
            {pending.map(u => {
              const colours = ROLE_COLOURS[u.role];
              return (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-8 h-8 ${colours?.bg ?? 'bg-slate-400'} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email} · {ROLE_LABELS[u.role] ?? u.role}{u.school ? ` · ${u.school.name}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(u.id)}
                      disabled={approving === u.id}
                      className="text-xs font-medium px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition"
                    >
                      {approving === u.id ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(u.id, u.name)}
                      className="text-xs font-medium px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">School</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Email</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => {
              const colours = ROLE_COLOURS[u.role];
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${colours?.bg ?? 'bg-slate-400'} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colours?.bg ?? 'bg-slate-100'} text-white`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{u.school?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {currentUser?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => setEditUser(u)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                          >
                            Edit
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                            >
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Team Member" size="md">
          <div className="space-y-4">
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School (optional)</label>
              <select value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">No school</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
                {saving ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal (role + school + permissions combined) */}
      {editUser && (
        <EditUserModal
          user={editUser}
          schools={schools}
          onSave={async (updates, permOverrides) => {
            await api.put(`/users/${editUser.id}`, updates);
            await api.put(`/users/${editUser.id}/permissions`, { permissions: permOverrides });
            setEditUser(null);
            load();
          }}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, schools, onSave, onClose }: {
  user: UserRecord;
  schools: School[];
  onSave: (updates: { role: string; schoolId: string | null; name: string }, permOverrides: Partial<Permissions>) => Promise<void>;
  onClose: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [schoolId, setSchoolId] = useState(user.school?.id ?? '');
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'profile' | 'permissions'>('profile');

  const overrides = parsePerms(user.permissions);
  const defaults = DEFAULT_PERMISSIONS[role] ?? DEFAULT_PERMISSIONS['teacher'];
  const resolved = resolvePermissions(role, overrides);
  const [perms, setPerms] = useState<Permissions>({ ...resolved });

  // Reset perms when role changes
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    const newDefaults = DEFAULT_PERMISSIONS[newRole] ?? DEFAULT_PERMISSIONS['teacher'];
    setPerms({ ...newDefaults });
  };

  const togglePerm = (mod: ModuleKey, action: string, val: boolean) => {
    setPerms(p => ({ ...p, [mod]: { ...p[mod], [action]: val } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed: Partial<Permissions> = {};
      for (const mod of ALL_MODULES) {
        const def = defaults[mod];
        const cur = perms[mod];
        if (!def || !cur) continue;
        const keys = Object.keys(def) as (keyof typeof def)[];
        if (keys.some(k => def[k] !== cur[k])) changed[mod] = cur;
      }
      await onSave({ role, schoolId: schoolId || null, name }, changed);
    } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title={`Edit — ${user.name}`} size="lg">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1">
        {(['profile', 'permissions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition ${tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'profile' ? 'Profile & Role' : 'Permissions'}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <p className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={role} onChange={e => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No school</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500">Base: <span className="font-medium text-slate-700">{ROLE_LABELS[role] ?? role}</span>. Toggling resets to defaults when role changes.</p>
            <button onClick={() => setPerms({ ...defaults })} className="text-xs text-blue-600 hover:underline">Reset</button>
          </div>
          <div className="space-y-1 max-h-[42vh] overflow-y-auto pr-1">
            {ALL_MODULES.map(mod => {
              const cur = perms[mod];
              const def = defaults[mod];
              if (!cur) return null;
              const actions = Object.keys(def) as (keyof typeof def)[];
              const ACTION_LABELS: Record<string, string> = { view: 'View', edit: 'Edit', assign: 'Assign', assess: 'Assess' };
              return (
                <div key={mod} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition">
                  <p className="text-sm font-medium text-slate-700 w-36 flex-shrink-0">{MODULE_LABELS[mod]}</p>
                  <div className="flex gap-4 flex-wrap">
                    {actions.map(action => (
                      <label key={action} className="flex items-center gap-2 cursor-pointer select-none">
                        <Toggle checked={!!cur[action]} onChange={v => togglePerm(mod, action, v)} />
                        <span className="text-xs text-slate-600">{ACTION_LABELS[action]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}
