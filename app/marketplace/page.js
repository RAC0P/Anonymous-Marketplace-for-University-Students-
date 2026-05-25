'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { deleteListing } from '../../lib/listings';
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/ui/Navbar';
import ListingCard from '../../components/listings/ListingCard';
import { useListings } from '../../hooks/useListings';
import { useAuth } from '../../hooks/useAuth';

const CATEGORIES = ['All', 'Books', 'Notes', 'Electronics', 'Lab', 'Hostel', 'Other'];

function SkeletonCard() {
  return (
    <div style={{
      background: '#13131c',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      overflow: 'hidden',
    }} aria-hidden="true">
      <div style={{ height: '155px', background: '#1a1a24', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '13px 15px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '10px', width: '60px', background: '#1a1a24', borderRadius: '20px', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '14px', width: '75%', background: '#1a1a24', borderRadius: '8px', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '10px', width: '100%', background: '#1a1a24', borderRadius: '8px', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '16px', width: '80px', background: '#1a1a24', borderRadius: '8px', marginTop: '4px', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { listings, loading } = useListings();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  async function handleDelete(id) {
    if (!confirm('Delete this listing? This action cannot be undone.')) return;
    try {
      await deleteListing(id);
    } catch (e) {
      console.error(e);
      alert('Failed to delete listing.');
    }
  }

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchCat =
        activeCategory === 'All' ||
        l.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        !search ||
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [listings, activeCategory, search]);

  return (
    <AuthGuard>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .mp-root {
          background: #0a0a0f;
          color: #f0eff8;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* HERO */
        .mp-hero {
          padding: 3.5rem 2rem 2rem;
          background: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,111,247,0.13) 0%, transparent 70%);
        }
        .mp-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(124,111,247,0.1); border: 1px solid rgba(124,111,247,0.22);
          border-radius: 20px; padding: 5px 14px; font-size: 0.7rem;
          letter-spacing: 1.8px; text-transform: uppercase; color: #7c6ff7;
          margin-bottom: 1.4rem;
        }
        .mp-pulse {
          width: 6px; height: 6px; background: #7c6ff7; border-radius: 50%;
          animation: mpPulse 2s infinite;
        }
        @keyframes mpPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.4; transform:scale(.7); }
        }
        .mp-h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(2.2rem, 4.5vw, 3.2rem); line-height: 1.06;
          letter-spacing: -1.5px; margin-bottom: .8rem; color: #f0eff8;
        }
        .mp-h1 .ghost { color: #7a7990; font-style: italic; }
        .mp-h1 .accent { color: #7c6ff7; }
        .mp-sub {
          font-size: .88rem; color: #7a7990; max-width: 400px;
          line-height: 1.65; margin-bottom: 2rem;
        }
        .mp-btns { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .mp-enter-btn {
          padding: 11px 22px; background: #7c6ff7; color: #fff; border: none;
          border-radius: 10px; font-size: .88rem; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all .2s;
          display: flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .mp-enter-btn:hover { background: #5a52e0; transform: translateY(-1px); }
        .mp-howto-btn {
          padding: 11px 18px; background: none; color: #7a7990;
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          font-size: .88rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
        }
        .mp-howto-btn:hover { border-color: rgba(255,255,255,0.18); color: #f0eff8; }

        /* TOOLBAR */
        .mp-toolbar {
          padding: 1rem 2rem;
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .mp-search {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
          background: #1a1a24; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 9px 14px;
        }
        .mp-search input {
          background: none; border: none; outline: none; color: #f0eff8;
          font-size: .84rem; width: 100%; font-family: 'DM Sans', sans-serif;
        }
        .mp-search input::placeholder { color: #7a7990; }
        .mp-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .mp-chip {
          padding: 7px 13px; border-radius: 20px; font-size: .76rem; font-weight: 500;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.07);
          background: none; color: #7a7990; font-family: 'DM Sans', sans-serif;
          transition: all .18s; white-space: nowrap;
        }
        .mp-chip.on {
          background: rgba(124,111,247,0.18);
          border-color: rgba(124,111,247,0.38); color: #7c6ff7;
        }
        .mp-chip:hover:not(.on) { background: #1a1a24; color: #f0eff8; }

        /* LIST HEADER */
        .mp-list-header {
          padding: 1.2rem 2rem .5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mp-count { font-size: .8rem; color: #7a7990; }
        .mp-count b { color: #f0eff8; font-weight: 500; }
        .mp-new-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #7c6ff7; color: #fff; border: none;
          border-radius: 9px; font-size: .82rem; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background .18s;
          text-decoration: none;
        }
        .mp-new-btn:hover { background: #5a52e0; }

        /* GRID */
        .mp-grid {
          padding: 0 2rem 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 15px;
        }

        /* EMPTY STATE */
        .mp-empty {
          padding: 4rem 2rem; text-align: center;
        }
        .mp-empty h2 {
          font-family: 'Syne', sans-serif; font-size: 1.2rem;
          color: #f0eff8; margin-bottom: .5rem;
        }
        .mp-empty p { font-size: .85rem; color: #7a7990; margin-bottom: 1.2rem; }
        .mp-clear-btn {
          padding: 9px 20px; background: none; border: 1px solid rgba(255,255,255,0.12);
          color: #f0eff8; border-radius: 9px; font-size: .82rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all .18s;
        }
        .mp-clear-btn:hover { border-color: #7c6ff7; color: #7c6ff7; }

        @keyframes skeletonPulse {
          0%,100% { opacity: 1; }
          50% { opacity: .4; }
        }
        @keyframes mpFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mp-anim { animation: mpFadeIn .4s ease both; }
      `}</style>

      <div className="mp-root">
        <Navbar />

        {/* HERO */}
        <div className="mp-hero mp-anim">
          <div className="mp-pill">
            <span className="mp-pulse" />
            Anonymous Campus Marketplace
          </div>
          <h1 className="mp-h1">
            Trade stuff.<br />
            Stay <span className="ghost">hidden.</span><br />
            <span className="accent">Save money.</span>
          </h1>
          <p className="mp-sub">
            The anonymous marketplace built for university students. Buy, sell, and chat — without revealing who you are.
          </p>
          <div className="mp-btns">
            <a href="#browse" className="mp-enter-btn">→ Enter the Marketplace</a>
            <button className="mp-howto-btn">How it works</button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mp-toolbar">
          <div className="mp-search">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7a7990" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search by title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mp-chips">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`mp-chip${activeCategory === cat ? ' on' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LIST HEADER */}
        <div id="browse" className="mp-list-header">
          <p className="mp-count">
            <b>{loading ? '…' : filtered.length}</b> listings found
          </p>
          <Link href="/marketplace/new" className="mp-new-btn">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New listing
          </Link>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="mp-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mp-empty">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🦊</span>
            <h2>{search || activeCategory !== 'All' ? 'No matches found' : 'No listings yet'}</h2>
            <p>{search || activeCategory !== 'All' ? 'Try different filters' : 'Be the first to list something!'}</p>
            {(search || activeCategory !== 'All') && (
              <button className="mp-clear-btn" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mp-grid">
            {filtered.map((listing, i) => (
              <div
                key={listing.id}
                className="mp-anim"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.35)}s` }}
              >
                <ListingCard
                  listing={listing}
                  handleDelete={user?.uid === listing.sellerId ? handleDelete : null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}