import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';

interface School  { id: string; name: string; }
interface Class   { id: string; name: string; yearGroup: string; schoolId: string; }
interface Coach   { id: string; name: string; }
interface Booking {
  id: string; status: string; startDate: string; endDate: string;
  school: School; schoolId: string;
  class: { id: string; name: string; yearGroup: string }; classId: string;
  programme: { id: string; name: string }; programmeId: string;
  coach?: Coach | null; coachId?: string | null;
}

const STATUSES   = ['pending', 'confirmed', 'completed', 'cancelled'];
const PROG_TYPES = ['fms', 'pe', 'nutrition', 'movement'];

const STATUS_TAG: Record<string, string> = {
  confirmed: 'ara-tag-success',
  pending:   'ara-tag-warning',
  completed: 'ara-tag-neutral',
  cancelled: 'ara-tag-danger',
};

const emptyForm = {
  schoolId: '', classId: '', programmeName: '', programmeType: 'fms', programmeDuration: '6',
  coachId: '', startDate: '', endDate: '', status: 'pending',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Bookings() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [schools, setSchools]     = useState<School[]>([]);
  const [classes, setClasses]     = useState<Class[]>([]);
  const [coaches, setCoaches]     = useState<Coach[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Booking | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const load = async () => {
    try {
      const [bk, sc, cl, co] = await Promise.all([
        api.get<Booking[]>('/bookings'), api.get<School[]>('/schools'),
        api.get<Class[]>('/classes'),   api.get<Coach[]>('/coaches'),
      ]);
      setBookings(bk); setSchools(sc); setClasses(cl); setCoaches(co);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const schoolClasses = classes.filter(c => c.schoolId === form.schoolId);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      schoolId: b.schoolId, classId: b.classId,
      programmeName: b.programme.name, programmeType: 'fms', programmeDuration: '6',
      coachId: b.coachId ?? '', startDate: b.startDate.slice(0, 10),
      endDate: b.endDate.slice(0, 10), status: b.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/bookings/${editing.id}`, { coachId: form.coachId || undefined, startDate: form.startDate, endDate: form.endDate, status: form.status });
      } else {
        const prog = await api.post<{ id: string }>('/programmes', { name: form.programmeName, type: form.programmeType, duration: parseInt(form.programmeDuration), schoolId: form.schoolId });
        await api.post('/bookings', { schoolId: form.schoolId, classId: form.classId, programmeId: prog.id, coachId: form.coachId || undefined, startDate: form.startDate, endDate: form.endDate, status: form.status });
      }
      setShowModal(false); load();
    } catch { setError('Failed to save booking'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/bookings/${deleteId}`); setDeleteId(null); load(); }
    catch { setError('Failed to delete booking'); }
  };

  const visible = bookings.filter(b => !filterStatus || b.status === filterStatus);
  const deleteTarget = bookings.find(b => b.id === deleteId);

  return (
    <div>
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Bookings</h1>
          <p className="ara-page-subtitle">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="ara-page-header-actions">
          <button type="button" onClick={openAdd} className="ara-btn ara-btn-primary">+ New Booking</button>
        </div>
      </div>

      <div className="ara-page">
        {error && <div className="ara-error">{error}</div>}

        <div className="ara-filter-strip">
          {['', ...STATUSES].map(s => (
            <button type="button" key={s} onClick={() => setFilterStatus(s)}
              className={`ara-filter-btn${filterStatus === s ? ' ara-filter-btn-active' : ''}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ara-table-wrap"><div className="ara-loading">Loading…</div></div>
        ) : visible.length === 0 ? (
          <div className="ara-table-wrap">
            <div className="ara-empty">{filterStatus ? `No ${filterStatus} bookings.` : 'No bookings yet — create one to get started.'}</div>
          </div>
        ) : (
          <div className="ara-table-wrap">
            <table className="ara-table">
              <thead>
                <tr>
                  <th className="ara-th">Programme</th>
                  <th className="ara-th">School / Class</th>
                  <th className="ara-th">Coach</th>
                  <th className="ara-th">Dates</th>
                  <th className="ara-th">Status</th>
                  <th className="ara-th" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(b => (
                  <tr key={b.id} className="ara-tr">
                    <td className="ara-td ara-td-strong">{b.programme.name}</td>
                    <td className="ara-td">
                      <div>{b.school.name}</div>
                      <div className="ara-td-sub">{b.class.name} · {b.class.yearGroup}</div>
                    </td>
                    <td className="ara-td">
                      {b.coach?.name ?? <span className="ara-td-sub">Unassigned</span>}
                    </td>
                    <td className="ara-td">
                      <div>{fmt(b.startDate)}</div>
                      <div className="ara-td-sub">→ {fmt(b.endDate)}</div>
                    </td>
                    <td className="ara-td">
                      <span className={`ara-tag ${STATUS_TAG[b.status] ?? 'ara-tag-neutral'}`}>{b.status}</span>
                    </td>
                    <td className="ara-td">
                      <div className="ara-row-actions">
                        <button type="button" className="ara-row-action" onClick={() => openEdit(b)}>Edit</button>
                        <button type="button" className="ara-row-action ara-row-action-danger" onClick={() => setDeleteId(b.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Booking' : 'New Booking'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit}>
            {!editing && (
              <>
                <div className="ara-form-group">
                  <label className="ara-form-label" htmlFor="booking-school">School</label>
                  <select id="booking-school" required value={form.schoolId}
                    onChange={e => setForm(f => ({ ...f, schoolId: e.target.value, classId: '' }))} className="ara-form-select">
                    <option value="">Select school…</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="ara-form-group">
                  <label className="ara-form-label" htmlFor="booking-class">Class</label>
                  <select id="booking-class" required value={form.classId}
                    onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className="ara-form-select">
                    <option value="">Select class…</option>
                    {schoolClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.yearGroup})</option>)}
                  </select>
                </div>
                <div className="ara-form-row">
                  <div className="ara-form-group">
                    <label className="ara-form-label" htmlFor="booking-prog-name">Programme name</label>
                    <input id="booking-prog-name" required value={form.programmeName}
                      onChange={e => setForm(f => ({ ...f, programmeName: e.target.value }))}
                      className="ara-field-input" placeholder="e.g. FMS Block 1" />
                  </div>
                  <div className="ara-form-group">
                    <label className="ara-form-label" htmlFor="booking-prog-type">Type</label>
                    <select id="booking-prog-type" value={form.programmeType}
                      onChange={e => setForm(f => ({ ...f, programmeType: e.target.value }))} className="ara-form-select">
                      {PROG_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ara-form-group">
                  <label className="ara-form-label" htmlFor="booking-duration">Duration (weeks)</label>
                  <input id="booking-duration" type="number" min="1" max="52" value={form.programmeDuration}
                    onChange={e => setForm(f => ({ ...f, programmeDuration: e.target.value }))} className="ara-field-input" />
                </div>
              </>
            )}
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="booking-coach">Coach <span className="ara-td-sub">(optional)</span></label>
              <select id="booking-coach" value={form.coachId}
                onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))} className="ara-form-select">
                <option value="">Unassigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="ara-form-row">
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="booking-start">Start date</label>
                <input id="booking-start" required type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="ara-field-input" />
              </div>
              <div className="ara-form-group">
                <label className="ara-form-label" htmlFor="booking-end">End date</label>
                <input id="booking-end" required type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="ara-field-input" />
              </div>
            </div>
            <div className="ara-form-group">
              <label className="ara-form-label" htmlFor="booking-status">Status</label>
              <select id="booking-status" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="ara-form-select">
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="ara-form-footer">
              <button type="button" className="ara-btn ara-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="ara-btn ara-btn-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete booking?" onClose={() => setDeleteId(null)} size="sm">
          <p className="ara-confirm-text">
            <strong>{deleteTarget?.programme.name}</strong> for {deleteTarget?.class.name} will be permanently deleted.
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
