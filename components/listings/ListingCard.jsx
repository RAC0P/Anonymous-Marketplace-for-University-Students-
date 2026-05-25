'use client';

import Link from 'next/link';

const CATEGORY_CONFIG = {
  books:       { emoji: '📚', accent: '#60a5fa', bg: 'rgba(96,165,250,0.08)'   },
  notes:       { emoji: '📝', accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  electronics: { emoji: '💻', accent: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  lab:         { emoji: '🔬', accent: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  hostel:      { emoji: '🛋️', accent: '#fb923c', bg: 'rgba(251,146,60,0.08)'  },
  other:       { emoji: '📦', accent: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

const CONDITION_MAP = {
  new:  { label: 'New',  cls: 'badge-green' },
  good: { label: 'Good', cls: 'badge-accent' },
  fair: { label: 'Fair', cls: 'badge-amber' },
  poor: { label: 'Poor', cls: 'badge-red'   },
};

export default function ListingCard({ listing, handleDelete }) {
  const cat = CATEGORY_CONFIG[listing.category] || CATEGORY_CONFIG.other;
  const condition = CONDITION_MAP[listing.condition] || CONDITION_MAP.good;

  return (
    <div className="listing-card group relative flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Delete button — only rendered when handleDelete is provided (owner) */}
      {handleDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(listing.id);
          }}
          aria-label="Delete listing"
          title="Delete listing"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(248,113,113,0.4)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.18s, transform 0.18s',
            boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.95)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.85)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      )}

      {/* Owner badge */}
      {handleDelete && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 20,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '999px',
            background: 'rgba(124,106,247,0.85)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            border: '1px solid rgba(167,139,250,0.4)',
          }}
        >
          Your listing
        </span>
      )}

      <Link href={`/marketplace/${listing.id}`} className="flex flex-col flex-1">
        <div className="relative h-[170px] overflow-hidden">
          {listing.imageUrls?.[0] ? (
            <img
              src={listing.imageUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex items-end h-full p-6" style={{ background: `linear-gradient(135deg, ${cat.bg}, var(--brand-surface))` }}>
              <span className="text-6xl">{cat.emoji}</span>
            </div>
          )}

          {/* Only show condition badge in bottom-right when NOT owner (to avoid overlap with "Your listing" badge) */}
          {!handleDelete && (
            <span className={`badge ${condition.cls} absolute top-4 right-4 z-10`}>
              {condition.label}
            </span>
          )}
          {handleDelete && (
            <span className={`badge ${condition.cls} absolute bottom-3 right-3 z-10`}>
              {condition.label}
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span className="section-label" style={{ color: cat.accent }}>{listing.category}</span>
          <h3 className="listing-title text-base font-semibold clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
            {listing.title}
          </h3>
          <p className="text-sm clamp-2 flex-1" style={{ color: 'var(--brand-muted)' }}>
            {listing.description}
          </p>
          <div className="flex justify-between items-center pt-3 border-t border-[var(--brand-border)]">
            <p className="text-xl font-bold" style={{ color: cat.accent }}>৳{listing.price?.toLocaleString()}</p>
            <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>View →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
