'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { createInterest } from '../../../lib/interests';
import { useAuth } from '../../../hooks/useAuth';
import AuthGuard from '../../../components/auth/AuthGuard';
import Navbar from '../../../components/ui/Navbar';

const CONDITION_CONFIG = {
  new:  { cls: 'cond-new',  icon: '✦', label: 'New' },
  good: { cls: 'cond-good', icon: '●', label: 'Good' },
  fair: { cls: 'cond-fair', icon: '◐', label: 'Fair' },
  poor: { cls: 'cond-poor', icon: '○', label: 'Poor' },
};

export default function ListingDetailPage() {
  const params = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDoc(doc(db, 'listings', params.id));
        if (!snap.exists()) return;
        const data = { id: snap.id, ...snap.data() };
        setListing(data);
        if (data.sellerId) {
          const sellerSnap = await getDoc(doc(db, 'users', data.sellerId));
          if (sellerSnap.exists()) setSeller(sellerSnap.data());
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  useEffect(() => {
    if (!listing?.imageUrls || listing.imageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage(prev =>
        prev === listing.imageUrls.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [listing]);

  async function handleInterest() {
    if (user?.uid === listing?.sellerId) {
      setError("You can't show interest in your own listing.");
      return;
    }
    setSending(true);
    try {
      await createInterest({
        listingId: listing.id,
        buyerId: user.uid,
        sellerId: listing.sellerId,
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // ── DARK THEME COLORS (from screenshot) ──────────────────────────
  const C = {
    bg:        '#0d0b14',   // deep dark purple-black (page bg)
    surface:   '#16131f',   // slightly lighter surface
    card:      '#1a1626',   // card background
    imgPanel:  '#120f1e',   // image panel bg
    border:    'rgba(255,255,255,0.08)',
    borderHov: 'rgba(124,92,252,0.4)',
    accent:    '#7c5cfc',   // bright purple (matches screenshot)
    accentHov: '#9a7ffe',
    textPri:   '#ffffff',
    textSec:   'rgba(255,255,255,0.55)',
    textMut:   'rgba(255,255,255,0.35)',
    chip:      'rgba(255,255,255,0.06)',
    success:   { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.25)' },
    error:     { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(248,113,113,0.25)' },
    neutral:   { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' },
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: C.textSec, fontFamily: "'Outfit', sans-serif" }}>Loading listing...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontSize: '40px' }}>🔍</span>
      <p style={{ fontSize: '16px', color: C.textSec, fontFamily: "'Outfit', sans-serif" }}>Listing not found</p>
      <Link href="/marketplace" style={{ fontSize: '14px', color: C.accent }}>← Back to Marketplace</Link>
    </div>
  );

  const condition = CONDITION_CONFIG[listing.condition] || CONDITION_CONFIG.good;
  const images = listing.imageUrls || [];

  // Condition chip styles for dark theme
  const condChipStyles = {
    new:  { background: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399' },
    good: { background: 'rgba(124,92,252,0.15)',  border: 'rgba(124,92,252,0.35)', color: '#a78bfa' },
    fair: { background: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24' },
    poor: { background: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
  };
  const condStyle = condChipStyles[listing.condition] || condChipStyles.good;

  const styles = {
    page: {
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
    },
    main: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 4rem' },
    back: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '13px', color: C.textSec, marginBottom: '2rem',
      textDecoration: 'none', fontWeight: 500, letterSpacing: '0.2px',
      transition: 'color 0.2s',
    },
    card: {
      background: C.card,
      borderRadius: '24px',
      border: `0.5px solid ${C.border}`,
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '45% 55%',
    },
    imgPanel: {
      background: C.imgPanel,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '3rem 2rem', position: 'relative', minHeight: '560px',
      borderRight: `0.5px solid ${C.border}`,
    },
    navBtn: {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.07)', border: `0.5px solid ${C.border}`,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '18px', color: C.textPri,
    },
    contentPanel: {
      padding: '3rem 3.5rem',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    },
    categoryTag: {
      fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px',
      textTransform: 'uppercase', color: C.accent,
      marginBottom: '0.75rem', display: 'block',
    },
    title: {
      fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
      fontSize: '2rem', fontWeight: 700,
      lineHeight: 1.15, margin: '0 0 1.25rem',
      letterSpacing: '-0.5px', color: C.textPri,
    },
    desc: {
      fontSize: '14px', lineHeight: 1.9, color: C.textSec,
      marginBottom: '2rem',
      borderLeft: `2px solid ${C.border}`,
      paddingLeft: '1rem',
    },
    priceRow: {
      display: 'flex', alignItems: 'baseline',
      gap: '4px', marginBottom: '1.75rem',
    },
    priceCurrency: { fontSize: '1.1rem', color: C.accent, fontWeight: 600 },
    priceValue: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '2.4rem', fontWeight: 700,
      color: C.accent, letterSpacing: '-1.5px',
    },
    metaRow: {
      display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap',
    },
    chip: (extra = {}) => ({
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '12px', fontWeight: 500, padding: '5px 13px',
      borderRadius: '100px',
      background: C.chip, border: `0.5px solid ${C.border}`,
      color: C.textSec, ...extra,
    }),
    divider: {
      height: '0.5px', background: C.border, margin: '0 0 1.5rem',
    },
    sellerBox: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.04)',
      border: `0.5px solid ${C.border}`,
      marginBottom: '1.75rem',
    },
    sellerAvatar: {
      width: '40px', height: '40px', borderRadius: '50%',
      background: 'rgba(124,92,252,0.2)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '20px', flexShrink: 0,
    },
    btnRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    btnPrimary: {
      height: '48px', borderRadius: '12px',
      fontSize: '14px', fontWeight: 600,
      background: C.accent, color: '#fff',
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '6px',
      fontFamily: 'inherit', letterSpacing: '0.2px',
    },
    btnSecondary: {
      height: '48px', borderRadius: '12px',
      fontSize: '14px', fontWeight: 500,
      background: 'rgba(255,255,255,0.05)',
      color: C.textSec,
      border: `0.5px solid ${C.border}`,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '6px',
      fontFamily: 'inherit',
    },
    statusBox: (bg, color) => ({
      gridColumn: '1/-1', height: '48px', borderRadius: '12px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '8px',
      fontSize: '14px', fontWeight: 500,
      background: bg, color,
    }),
    errorBox: {
      fontSize: '13px', color: C.error.color,
      padding: '10px 14px',
      background: C.error.bg,
      border: `0.5px solid ${C.error.border}`,
      borderRadius: '10px', marginBottom: '1rem',
    },
  };

  return (
    <AuthGuard>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>

          <Link href="/marketplace" style={styles.back}>
            ← Back to Marketplace
          </Link>

          <div style={styles.card}>

            {/* Image Panel */}
            <div style={styles.imgPanel}>
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImage]}
                    alt={listing.title}
                    style={{
                      maxHeight: '380px', maxWidth: '100%',
                      objectFit: 'contain', borderRadius: '14px',
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        style={{ ...styles.navBtn, left: '1rem' }}
                        onClick={() => setCurrentImage(currentImage === 0 ? images.length - 1 : currentImage - 1)}
                      >‹</button>
                      <button
                        style={{ ...styles.navBtn, right: '1rem' }}
                        onClick={() => setCurrentImage(currentImage === images.length - 1 ? 0 : currentImage + 1)}
                      >›</button>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem' }}>
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImage(i)}
                            style={{
                              width: i === currentImage ? '18px' : '6px',
                              height: '6px',
                              borderRadius: i === currentImage ? '3px' : '50%',
                              background: i === currentImage ? C.accent : 'rgba(255,255,255,0.2)',
                              border: 'none', cursor: 'pointer',
                              transition: 'all 0.25s', padding: 0,
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: C.textMut }}>
                  <div style={{ fontSize: '64px' }}>📷</div>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>No images</p>
                </div>
              )}
            </div>

            {/* Content Panel */}
            <div style={styles.contentPanel}>
              <span style={styles.categoryTag}>{listing.category}</span>
              <h1 style={styles.title}>{listing.title}</h1>
              <p style={styles.desc}>{listing.description}</p>

              <div style={styles.priceRow}>
                <span style={styles.priceCurrency}>৳</span>
                <span style={styles.priceValue}>{listing.price?.toLocaleString()}</span>
                <span style={{ fontSize: '12px', color: C.textMut, marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fixed</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.chip({ background: condStyle.background, borderColor: condStyle.border, color: condStyle.color })}>
                  {condition.icon} {condition.label}
                </span>
                <span style={styles.chip()}>📦 {listing.category}</span>
              </div>

              <div style={styles.divider} />

              {seller && (
                <div style={styles.sellerBox}>
                  <div style={styles.sellerAvatar}>{seller.anonAvatar || '🦊'}</div>
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMut, marginBottom: '2px' }}>Listed by</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.textPri }}>{seller.anonName}</div>
                  </div>
                </div>
              )}

              {error && <div style={styles.errorBox}>{error}</div>}

              <div style={styles.btnRow}>
                {user?.uid === listing.sellerId ? (
                  <div style={styles.statusBox('rgba(255,255,255,0.05)', C.textSec)}>
                    Your Listing
                  </div>
                ) : sent ? (
                  <div style={styles.statusBox('rgba(52,211,153,0.12)', '#34d399')}>
                    ✓ Interest Sent
                  </div>
                ) : declined ? (
                  <div style={styles.statusBox('rgba(255,255,255,0.05)', C.textSec)}>
                    Thanks for letting us know 🙏
                  </div>
                ) : (
                  <>
                    <button onClick={handleInterest} disabled={sending} style={styles.btnPrimary}>
                      {sending ? 'Sending...' : '♡ Interested'}
                    </button>
                    <button onClick={() => setDeclined(true)} style={styles.btnSecondary}>
                      ✕ Not Interested
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </AuthGuard>
  );
}