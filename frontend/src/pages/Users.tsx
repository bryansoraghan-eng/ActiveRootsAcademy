import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DEFAULT_PERMISSIONS, ROLE_LABELS, resolvePermissions } from '../lib/permissions';
import type { ModuleKey, Permissions } from '../lib/permissions';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface School { id: string; name: string; }
interface UserRecord {
  id: string; name: string; email: string; role: string; status: string;
  school: School | null; permissions: string; createdAt: string;
}

const ROLES = ['admin', 'school_admin', 'principal', 'coach', 'teacher', 'online_coach'] as const;

const ROLE_TAG: Record<string, string> = {
  admin:        'ara-tag-clay',
  school_admin: 'ara-tag-sage',
  principal:    'ara-tag-brand',
  coach:        'ara-tag-sand',
  teacher:      'ara-tag-neutral',
  online_coach: 'ara-tag-brand',
};

const ROLE_AVATAR: Record<string, string> = {
  admin:        'ara-avatar-clay',
  school_admin: 'ara-avatar-sage',
  principal:    'ara-avatar-blue',
  coach:        'ara-avatar-neutral',
  teacher:      'ara-avatar-neutral',
};

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
const ACTION_LABELS: Record<string, string> = { view: 'View', edit: 'Edit', assign: 'Assign', assess: 'Assess' };

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function parsePerms(raw: string): Partial<Permissions> {
  try { return JSON.parse(raw) || {}; } catch { return {}; }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`ara-toggle${checked ? ' ara-toggle-on' : ''}`}>
      <span className="ara-toggle-thumb" />
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
      setUsers(u); setPending(p); setSchools(s);
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
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try { await api.put(`/users/${id}/approve`, {}); load(); }
    catch { /* approval errors are non-critical; user can retry */ } finally { setApproving(null); }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Reject and remove ${name}'s account request?`)) return;
    try { await api.delete(`/users/${id}/reject`); load(); } catch { /* rejection errors are non-critical; user can retry */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  if (loading) return <div className="ara-loading">Loading team…</div>;

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Team</h1>
          <p className="ara-page-subtitle">
            {users.length} active account{users.length !== 1 ? 's' : ''}{pending.length > 0 ? ` · ${pending.length} pending` : ''}
          </p>
        </div>
        {currentUser?.role === 'admin' && (
          <div className="ara-page-header-actions">
            <button type="button" onClick={() => { setShowAdd(true); setFormError(''); }} className="ara-btn ara-btn-primary">
              + Add User
            </button>
          </div>
        )}
      </div>

      <div className="ara-page">
        {currentUser?.role === 'admin' && pending.length > 0 && (
          <div className="ara-pending-banner">
            <div className="ara-pending-banner-header">
              <span className="ara-pending-dot" />
              Pending Approval ({pending.length})
            </div>
            {pending.map(u => (
              <div key={u.id} className="ara-pending-row">
                <div className={`ara-avatar ara-avatar-md ${ROLE_AVATAR[u.role] ?? 'ara-avatar-neutral'}`}>{initials(u.name)}</div>
                <div className="ara-pending-info">
                  <div className="ara-td-strong">{u.name}</div>
                  <div className="ara-td-sub">{u.email} · {ROLE_LABELS[u.role] ?? u.role}{u.school ? ` · ${u.school.name}` : ''}</div>
                </div>
                <div className="ara-pending-actions">
                  <button type="button" onClick={() => handleApprove(u.id)} disabled={approving === u.id}
                    className="ara-btn ara-btn-primary ara-btn-sm">
                    {approving === u.id ? 'Approving…' : 'Approve'}
                  </button>
                  <button type="button" onClick={() => handleReject(u.id, u.name)}
                    className="ara-btn ara-btn-secondary ara-btn-sm ara-btn-reject">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ara-toolbar">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…" className="ara-search" />
        </div>

        <div className="ara-table-wrap">
          <table className="ara-table">
            <thead>
              <tr>
                <th className="ara-th">Name</th>
                <th className="ara-th">Role</th>
                <th className="ara-th">School</th>
                <th className="ara-th">Email</th>
                <th className="ara-th" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="ara-tr">
                  <td className="ara-td">
                    <div className="ara-name-cell">
                      <div className={`ara-avatar ara-avatar-md ${ROLE_AVATAR[u.role] ?? 'ara-avatar-neutral'}`}>{initials(u.name)}</div>
                      <span className="ara-td-strong">{u.name}</span>
                    </div>
                  </td>
                  <td className="ara-td">
                    <span className={`ara-tag ${ROLE_TAG[u.role] ?? 'ara-tag-neutral'}`}>{ROLE_LABELS[u.role] ?? u.role}</span>
                  </td>
                  <td className="ara-td">{u.school?.name ?? <span className="ara-td-sub">—</span>}</td>
                  <td className="ara-td ara-td-sub">{u.email}</td>
                  <td className="ara-td">
                    {currentUser?.role === 'admin' && (
                      <div className="ara-row-actions">
                        <button type="button" className="ara-row-action" onClick={() => setEditUser(u)}>Edit</button>
                        {u.id !== currentUser?.id && (
                          <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => handleDelete(u.id)}>Remove</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="ara-td">
                    <div className="ara-empty ara-empty-inline">No users found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Team Member" onClose={() => setShowAdd(false)}>
          <div>
            {formError && <div className="ara-error">{formError}</div>}
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="user-name">Full name</label>
              <input id="user-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="ara-field-input" placeholder="Full name" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="user-email">Email</label>
              <input id="user-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="ara-field-input" placeholder="user@activeroots.ie" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="user-password">Password</label>
              <input id="user-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="ara-field-input" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="user-role">Role</label>
              <select id="user-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="ara-form-select">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="user-school">School <span className="ara-td-sub">(optional)</span></label>
              <select id="user-school" value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} className="ara-form-select">
                <option value="">No school</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="ara-form-footer">
              <button type="button" onClick={() => setShowAdd(false)} className="ara-btn ara-btn-secondary">Cancel</button>
              <button type="button" onClick={handleAdd} disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

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

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setPerms({ ...(DEFAULT_PERMISSIONS[newRole] ?? DEFAULT_PERMISSIONS['teacher']) });
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
    <Modal title={`Edit — ${user.name}`} onClose={onClose} size="lg">
      <div className="ara-tabs">
        {(['profile', 'permissions'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`ara-tab${tab === t ? ' ara-tab-active' : ''}`}>
            {t === 'profile' ? 'Profile & Role' : 'Permissions'}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <>
          <div className="ara-form-group">
            <label className="ara-form-label" htmlFor="edit-user-name">Full name</label>
            <input id="edit-user-name" value={name} onChange={e => setName(e.target.value)} className="ara-field-input" />
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label" htmlFor="edit-user-email">Email</label>
            <div id="edit-user-email" className="ara-info-block">{user.email}</div>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label" htmlFor="edit-user-role">Role</label>
            <select id="edit-user-role" value={role} onChange={e => handleRoleChange(e.target.value)} className="ara-form-select">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="ara-form-group">
            <label className="ara-form-label" htmlFor="edit-user-school">School</label>
            <select id="edit-user-school" value={schoolId} onChange={e => setSchoolId(e.target.value)} className="ara-form-select">
              <option value="">No school</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </>
      ) : (
        <div>
          <div className="ara-perm-header">
            <span className="ara-td-sub">Base: <strong>{ROLE_LABELS[role] ?? role}</strong>. Changing role resets to defaults.</span>
            <button type="button" className="ara-card-link" onClick={() => setPerms({ ...defaults })}>Reset</button>
          </div>
          <div className="ara-perm-list">
            {ALL_MODULES.map(mod => {
              const cur = perms[mod];
              const def = defaults[mod];
              if (!cur) return null;
              const actions = Object.keys(def) as (keyof typeof def)[];
              return (
                <div key={mod} className="ara-perm-row">
                  <span className="ara-perm-module">{MODULE_LABELS[mod]}</span>
                  <div className="ara-perm-toggles">
                    {actions.map(action => (
                      <label key={action} className="ara-perm-toggle-label">
                        <Toggle checked={!!cur[action]} onChange={v => togglePerm(mod, action, v)} />
                        <span className="ara-td-sub">{ACTION_LABELS[action]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="ara-form-footer ara-form-footer-bordered">
        <button type="button" onClick={onClose} className="ara-btn ara-btn-secondary">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving} className="ara-btn ara-btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}
