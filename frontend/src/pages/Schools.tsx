import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

interface School {
  id: string; name: string; address?: string; phone?: string;
  principal?: string; email?: string; schoolCode?: string;
  classes: { id: string }[]; teachers: { id: string }[];
  programmes: { id: string }[];
}

const empty = { name: '', address: '', phone: '', principal: '', email: '' };

const EQUIPMENT_LIST = [
  { id: 'cones', name: 'Cones' }, { id: 'bibs', name: 'Bibs' }, { id: 'hoops', name: 'Hoops' },
  { id: 'beanbags', name: 'Beanbags' }, { id: 'tennis', name: 'Tennis balls' }, { id: 'foam', name: 'Foam balls' },
  { id: 'basketballs', name: 'Basketballs' }, { id: 'footballs', name: 'Footballs' }, { id: 'rugby', name: 'Rugby balls' },
  { id: 'gaa', name: 'GAA sliotars + hurleys' }, { id: 'rackets', name: 'Rackets' }, { id: 'skipRope', name: 'Skipping ropes' },
  { id: 'mats', name: 'Mats' }, { id: 'agility', name: 'Agility ladder' }, { id: 'benches', name: 'Benches' },
];

export default function Schools() {
  const { user: currentUser } = useAuth();
  const [schools, setSchools]         = useState<School[]>([]);
  const [selected, setSelected]       = useState<School | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<School | null>(null);
  const [form, setForm]               = useState(empty);
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<School[]>('/schools');
      setSchools(data);
    } catch {
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };

  const openEdit = (school: School) => {
    setEditing(school);
    setForm({ name: school.name, address: school.address ?? '', phone: school.phone ?? '', principal: school.principal ?? '', email: school.email ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/schools/${editing.id}`, form); }
      else         { await api.post('/schools', form); }
      setShowModal(false);
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/schools/${deleteId}`); setDeleteId(null); await load(); }
    catch (err: any) { setError(err.message); }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRegenerateCode = async (id: string) => {
    if (!confirm('Generate a new school code? The old code will stop working immediately.')) return;
    setRegeneratingId(id);
    try { await api.post(`/schools/${id}/regenerate-code`, {}); await load(); }
    catch {}
    finally { setRegeneratingId(null); }
  };

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Partner schools</h1>
          <p className="ara-page-subtitle">{schools.length} school{schools.length !== 1 ? 's' : ''} · {schools.reduce((a, s) => a + s.classes.length, 0)} classes total</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ Add School</button>
        </div>
      </div>

      {error && <div className="ara-error ara-error-padded">{error}</div>}

      {loading ? (
        <div className="ara-split-root ara-split-root-2col">
          <div className="ara-loading">Loading…</div>
        </div>
      ) : schools.length === 0 ? (
        <div className="ara-split-root">
          <div className="ara-empty">No schools yet — add one to get started.</div>
        </div>
      ) : (
        <div className="ara-split-root ara-split-root-2col">
          {/* Left: school card list */}
          <div className="ara-panel-list">
            {schools.map(s => (
              <div
                key={s.id}
                className={`ara-panel-card${selected?.id === s.id ? ' ara-panel-card-active' : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className="ara-panel-card-name">{s.name}</div>
                {s.address && <div className="ara-panel-card-sub">{s.address}</div>}
                <div className="ara-panel-card-meta">{s.classes.length} class{s.classes.length !== 1 ? 'es' : ''} · {s.teachers.length} teacher{s.teachers.length !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>

          {/* Right: detail panel */}
          {selected ? (
            <div className="ara-detail-card">
              <div className="ara-detail-header">
                <div>
                  <div className="ara-detail-title">{selected.name}</div>
                  {selected.address && <div className="ara-detail-subtitle">{selected.address}</div>}
                </div>
                <div className="ara-row-actions">
                  <button type="button" className="ara-row-action" onClick={() => openEdit(selected)}>Edit</button>
                  <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(selected.id)}>Delete</button>
                </div>
              </div>

              <div className="ara-detail-info-grid">
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Principal</div>
                  <div className="ara-detail-info-value">{selected.principal || '—'}</div>
                </div>
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Phone</div>
                  <div className="ara-detail-info-value">{selected.phone || '—'}</div>
                </div>
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Email</div>
                  <div className="ara-detail-info-value">{selected.email || '—'}</div>
                </div>
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Staff code</div>
                  <div className="ara-detail-info-value">
                    {selected.schoolCode ? (
                      <span className="ara-code-row">
                        <span className="ara-code">{selected.schoolCode}</span>
                        <button type="button" className={`ara-icon-btn${copiedId === selected.id ? ' ara-icon-btn-ok' : ''}`}
                          title="Copy code" onClick={() => handleCopyCode(selected.id, selected.schoolCode!)}>
                          {copiedId === selected.id
                            ? <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button type="button" className="ara-icon-btn ara-icon-btn-warn"
                            title="Regenerate" disabled={regeneratingId === selected.id}
                            onClick={() => handleRegenerateCode(selected.id)}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        )}
                      </span>
                    ) : '—'}
                  </div>
                </div>
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Classes</div>
                  <div className="ara-detail-info-value"><span className="ara-tag ara-tag-brand">{selected.classes.length}</span></div>
                </div>
                <div className="ara-detail-info-item">
                  <div className="ara-detail-info-label">Teachers</div>
                  <div className="ara-detail-info-value"><span className="ara-tag ara-tag-neutral">{selected.teachers.length}</span></div>
                </div>
              </div>

              <div className="ara-detail-section-label">Equipment inventory</div>
              <p className="ara-td-sub ara-equipment-hint">Tick what the school has. The programme generator uses this to plan sessions.</p>
              <div className="ara-equipment-grid">
                {EQUIPMENT_LIST.map(eq => (
                  <label key={eq.id} className="ara-equipment-item">
                    <input type="checkbox" className="ara-equipment-checkbox" />
                    <span>{eq.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="ara-no-selection">
              <svg className="ara-no-selection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V11l3-3 3 3v10M5 21V7l7-4 7 4v14" />
              </svg>
              Select a school to view details
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit School' : 'Add School'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="school-name">School name *</label>
              <input id="school-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="ara-field-input" placeholder="e.g. St. Patrick's National School" />
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="school-principal">Principal</label>
              <input id="school-principal" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))}
                className="ara-field-input" placeholder="Principal name" />
            </div>
            <div className="ara-form-row">
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="school-email">Email</label>
                <input id="school-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="ara-field-input" placeholder="school@example.com" />
              </div>
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="school-phone">Phone</label>
                <input id="school-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="ara-field-input" placeholder="01 234 5678" />
              </div>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="school-address">Address</label>
              <input id="school-address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="ara-field-input" placeholder="Street, Town, County" />
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add school'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete school?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            This will permanently delete the school and all its associated classes, bookings, and data. This cannot be undone.
          </p>
          <div className="ara-form-footer">
            <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button type="button" className="ara-btn ara-btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
