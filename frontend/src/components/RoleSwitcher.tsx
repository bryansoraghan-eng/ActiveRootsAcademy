import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLE_COLOURS } from '../lib/permissions';

const SWITCHABLE_ROLES = ['school_admin', 'principal', 'coach', 'teacher'] as const;

export default function RoleSwitcher() {
  const { viewingAs, setViewingAs } = useAuth();
  const [open, setOpen] = useState(false);

  if (viewingAs) {
    const colour = ROLE_COLOURS[viewingAs];
    return (
      <div className="mx-3 mt-2 mb-1 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${colour?.dot ?? 'bg-orange-500'} flex-shrink-0`} />
          <p className="text-orange-400 text-xs font-medium flex-1 min-w-0">
            Viewing as {ROLE_LABELS[viewingAs]}
          </p>
          <button
            onClick={() => setViewingAs(null)}
            className="text-orange-400 hover:text-orange-200 text-xs font-medium flex-shrink-0"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-2 mb-1 flex-shrink-0 relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-xs text-slate-400 hover:text-slate-200"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        <span className="flex-1 text-left">View as role…</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#1e293b] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
          {SWITCHABLE_ROLES.map(role => {
            const colour = ROLE_COLOURS[role];
            return (
              <button
                key={role}
                onClick={() => { setViewingAs(role); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition text-left"
              >
                <div className={`w-2 h-2 rounded-full ${colour?.dot ?? 'bg-slate-400'} flex-shrink-0`} />
                {ROLE_LABELS[role]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
