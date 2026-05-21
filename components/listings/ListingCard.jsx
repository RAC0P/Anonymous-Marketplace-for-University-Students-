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
  const cat       = CATEGORY_CONFIG[listing.category] || CATEGORY_CONFIG.other;
  const condition = CONDITION_MAP[listing.condition]  || CONDITION_MAP.good;
  const firstImage = listing.imageUrls?.[0] || null;

  return (
    <Link href={`/marketplace/${listing.id}`} className="listing-card group" aria-label={listing.title}>
      {/* Visual header */}
      <div
        className="relative flex items-end overflow-hidden"
        style={{
          height:       '140px',
          background:   firstImage
            ? 'var(--brand-surface)'
            : `linear-gradient(135deg, ${cat.bg}, var(--brand-surface))`,
          borderBottom: '1px solid var(--brand-border)',
        }}
      >
        {/* ── Photo (when available) ── */}
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage}
            alt={listing.title}
            style={{
              position:   'absolute',
              inset:      0,
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              opacity:    0.85,
            }}
          />
        ) : (
          /* Big emoji fallback */
          <span
            className="text-5xl leading-none select-none p-5"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
            aria-hidden="true"
          >
            {cat.emoji}
          </span>
        )}

        {/* Condition badge — top right, always on top */}
        <span
          className={`badge ${condition.cls} absolute top-4 right-4`}
          style={{ fontSize: '10px', zIndex: 1 }}
        >
          {condition.label}
        </span>

        {/* Accent glow dot (only without a photo) */}
        {!firstImage && (
          <span
            className="absolute bottom-4 right-4 w-2 h-2 rounded-full"
            style={{
              background: cat.accent,
              boxShadow:  `0 0 8px ${cat.accent}`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category label */}
        <span
          className="section-label"
          style={{ color: cat.accent }}
        >
          {listing.category}
        </span>

        {/* Title */}
        <h3
          className="listing-title text-base font-semibold leading-snug clamp-2 transition-colors"
          style={{
            fontFamily:    'var(--font-display)',
            color:         '#f4f2ff',
            letterSpacing: '-0.01em',
          }}
        >
          {listing.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm clamp-2 flex-1"
          style={{ color: 'var(--brand-muted)', lineHeight: '1.5' }}
        >
          {listing.description}
        </p>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--brand-border)' }}
        >
          <div>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily:    'var(--font-display)',
                color:         cat.accent,
                letterSpacing: '-0.02em',
              }}
            >
              ৳{listing.price?.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {handleDelete && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(listing.id); }}
                className="btn-danger"
                style={{ padding: '5px 12px', fontSize: '12px' }}
                aria-label="Delete listing"
              >
                Delete
              </button>
            )}
            <span
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--brand-muted)' }}
            >
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
