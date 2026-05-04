import { useEffect } from 'react';
import { getDailyLunchbox } from '../../lib/lunchboxData';
import type { LunchboxItem } from '../../lib/lunchboxData';

const SECTION_STYLE: Record<string, { badge: string; badgeText: string; accent: string; accentText: string }> = {
  Main:  { badge: '#dbeafe', badgeText: '#1d4ed8', accent: '#eff6ff', accentText: '#1e40af' },
  Side:  { badge: '#dcfce7', badgeText: '#15803d', accent: '#f0fdf4', accentText: '#166534' },
  Snack: { badge: '#ffedd5', badgeText: '#c2410c', accent: '#fff7ed', accentText: '#9a3412' },
  Drink: { badge: '#e0f2fe', badgeText: '#0369a1', accent: '#f0f9ff', accentText: '#075985' },
};

function ItemCard({ label, item }: { label: string; item: LunchboxItem }) {
  const s = SECTION_STYLE[label];
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
      padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', padding: '0.3rem 0.75rem', borderRadius: 999,
          background: s.badge, color: s.badgeText, flexShrink: 0,
        }}>
          {label}
        </span>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>{item.name}</h3>
      </div>

      {/* Teacher note */}
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem 1.1rem' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
          For you (the teacher)
        </p>
        <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.65 }}>{item.teacherNote}</p>
      </div>

      {/* Kid script — speech bubble style */}
      <div style={{ background: s.accent, borderRadius: 10, padding: '1rem 1.1rem', border: `1px solid ${s.badge}` }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: s.accentText, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
          What to say to the kids
        </p>
        <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>{item.kidScript}</p>
      </div>

      {/* Nutrients as bubbles */}
      <div>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.65rem' }}>
          What's in it
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {item.nutrients.map(n => (
            <div key={n.name} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              background: '#f8fafc', borderRadius: 8, padding: '0.6rem 0.85rem',
            }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: s.badgeText,
                background: s.badge, borderRadius: 999, padding: '0.2rem 0.65rem',
                flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {n.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.55 }}>
                <span style={{ color: '#94a3b8' }}>{n.source}</span>
                {' → '}
                <span style={{ color: '#1e293b', fontWeight: 500 }}>{n.benefit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
          Alternative
        </span>
        <span style={{
          fontSize: '0.78rem', color: '#475569', background: '#f1f5f9',
          borderRadius: 999, padding: '0.2rem 0.75rem',
        }}>
          {item.alternative}
        </span>
      </div>
    </div>
  );
}

const SECTIONS: { label: string; key: 'main' | 'side' | 'snack' | 'drink' }[] = [
  { label: 'Main',  key: 'main'  },
  { label: 'Side',  key: 'side'  },
  { label: 'Snack', key: 'snack' },
  { label: 'Drink', key: 'drink' },
];

export default function TeacherNutritionGuide() {
  const lunchbox = getDailyLunchbox();
  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    localStorage.setItem('ara_nutrition_viewed', new Date().toDateString());
  }, []);

  return (
    <div className="ara-page">
      <div className="ara-page-header">
        <div>
          <h1 className="ara-page-title">Daily Lunchbox Guide</h1>
          <p className="ara-page-sub">Today's lunchbox · {today}</p>
        </div>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          This guide is for educational purposes only. It shows an example of a balanced, child-friendly lunchbox with plain-English explanations. It is not medical or dietary advice.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {SECTIONS.map(({ label, key }) => (
          <ItemCard key={label} label={label} item={lunchbox[key]} />
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem' }}>
        This lunchbox example refreshes daily.
      </p>
    </div>
  );
}
