import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '../lib/api';
import { resolvePermissions } from '../lib/permissions';
import type { ModuleKey, ModulePermission, Permissions } from '../lib/permissions';

interface Props {
  userId: string;
  userType: 'teacher' | 'coach';
  role: string;
  name: string;
  onClose: () => void;
}

interface ModuleConfig {
  key: ModuleKey;
  label: string;
  actions: (keyof ModulePermission)[];
}

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  edit: 'Edit',
  assess: 'Assess',
  assign: 'Assign',
};

const ROLE_MODULES: Record<string, ModuleConfig[]> = {
  teacher: [
    { key: 'classes',        label: 'Classes',         actions: ['view'] },
    { key: 'assessments',    label: 'Assessments',     actions: ['view', 'assess'] },
    { key: 'nutrition',      label: 'Nutrition',       actions: ['view', 'edit'] },
    { key: 'lessonPlans',    label: 'Lesson Plans',    actions: ['view', 'edit'] },
    { key: 'fmsLibrary',     label: 'FMS Library',     actions: ['view'] },
    { key: 'movementBreaks', label: 'Movement Breaks', actions: ['view', 'edit'] },
  ],
  coach: [
    { key: 'classes',        label: 'Classes',         actions: ['view'] },
    { key: 'bookings',       label: 'Bookings',        actions: ['view'] },
    { key: 'assessments',    label: 'Assessments',     actions: ['view', 'assess'] },
    { key: 'placements',     label: 'Placements',      actions: ['view'] },
    { key: 'nutrition',      label: 'Nutrition',       actions: ['view'] },
    { key: 'lessonPlans',    label: 'Lesson Plans',    actions: ['view', 'edit'] },
    { key: 'fmsLibrary',     label: 'FMS Library',     actions: ['view', 'edit'] },
    { key: 'movementBreaks', label: 'Movement Breaks', actions: ['view'] },
  ],
  principal: [
    { key: 'schools',        label: 'Schools',         actions: ['view'] },
    { key: 'teachers',       label: 'Teachers',        actions: ['view'] },
    { key: 'classes',        label: 'Classes',         actions: ['view'] },
    { key: 'coaches',        label: 'Coaches',         actions: ['view'] },
    { key: 'programmes',     label: 'Programmes',      actions: ['view'] },
    { key: 'bookings',       label: 'Bookings',        actions: ['view'] },
    { key: 'assessments',    label: 'Assessments',     actions: ['view'] },
    { key: 'placements',     label: 'Placements',      actions: ['view'] },
    { key: 'nutrition',      label: 'Nutrition',       actions: ['view'] },
    { key: 'lessonPlans',    label: 'Lesson Plans',    actions: ['view'] },
    { key: 'fmsLibrary',     label: 'FMS Library',     actions: ['view'] },
    { key: 'movementBreaks', label: 'Movement Breaks', actions: ['view'] },
  ],
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`ara-toggle${checked ? ' ara-toggle-on' : ''}`}
    >
      <span className="ara-toggle-thumb" />
    </button>
  );
}

export default function PermissionsModal({ userId, userType, role, name, onClose }: Props) {
  const [perms, setPerms] = useState<Permissions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const modules = ROLE_MODULES[role] ?? ROLE_MODULES['teacher'];

  useEffect(() => {
    const endpoint = userType === 'teacher'
      ? `/teachers/${userId}/permissions`
      : `/coaches/${userId}/permissions`;

    api.get<Record<string, any>>(endpoint)
      .then(overrides => setPerms(resolvePermissions(role, overrides)))
      .catch(() => setPerms(resolvePermissions(role, {})));
  }, [userId, userType, role]);

  const setAction = (mod: ModuleKey, action: keyof ModulePermission, val: boolean) => {
    setPerms(prev => {
      if (!prev) return prev;
      const modPerms = { ...prev[mod], [action]: val };
      if (action === 'view' && !val) {
        Object.keys(modPerms).forEach(k => { (modPerms as any)[k] = false; });
      }
      return { ...prev, [mod]: modPerms };
    });
  };

  const handleSave = async () => {
    if (!perms) return;
    setSaving(true);
    setError('');
    try {
      const endpoint = userType === 'teacher'
        ? `/teachers/${userId}/permissions`
        : `/coaches/${userId}/permissions`;
      await api.put(endpoint, { permissions: perms });
      onClose();
    } catch {
      setError('Failed to save permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Permissions — ${name}`} onClose={onClose}>
      <p className="text-sm text-slate-500 mb-5">
        Role: <span className="font-medium text-slate-700 capitalize">{role.replace('_', ' ')}</span>
      </p>

      {!perms ? (
        <div className="ara-loading">Loading…</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {modules.map(mod => (
            <div key={mod.key} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-700">{mod.label}</span>
              <div className="flex items-center gap-5">
                {mod.actions.map(action => (
                  <div key={action} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-10 text-right">
                      {ACTION_LABELS[action] ?? action}
                    </span>
                    <Toggle
                      checked={perms[mod.key]?.[action] ?? false}
                      onChange={val => setAction(mod.key, action, val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="ara-error mt-3">{error}</div>}

      <div className="ara-form-footer mt-5">
        <button type="button" className="ara-btn ara-btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !perms}
          className="ara-btn ara-btn-primary"
          onClick={handleSave}
        >
          {saving ? 'Saving…' : 'Save permissions'}
        </button>
      </div>
    </Modal>
  );
}
