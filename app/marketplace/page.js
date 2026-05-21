'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteListing } from '../../lib/listings';
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/ui/Navbar';
import ListingCard from '../../components/listings/ListingCard';
import { useListings } from '../../hooks/useListings';

const CATEGORIES = ['All', 'Books', 'Notes', 'Electronics', 'Lab', 'Hostel', 'Other'];

/* ── Skeleton card ──────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}
      aria-hidden="true"
    >
      <div className="skeleton" style={{ height: '140px' }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-2/3 rounded-lg" />
        <div className="skeleton h-5 w-24 rounded-lg mt-2" />
      </div>
    </div>
  );
}

/* ── Search icon ────────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg
      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
      width="16" height="16" fill="none" viewBox="0 0 24 24"
      stroke="var(--brand-muted)" strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MarketplacePage() {
  const { listings, loading } = useListings();
  const [search,          setSearch]          = useState('');
  const [activeCategory,  setActiveCategory]  = useState('All');

  async function handleDelete(id) {
    if (!confirm('Delete this listing?')) return;
    try { await deleteListing(id); } catch (e) { console.error(e); }
  }

  const filtered = listings.filter(l => {
    const matchCat    = activeCategory === 'All' ||
      l.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AuthGuard>
      <div className="page-wrapper">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 anim-fade-up"
          >
            <div>
              <p className="section-label mb-2">Campus marketplace</p>
              <h1
                className="display-heading"
                style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}
              >
                Marketplace
              </h1>
              <p
                className="mt-2 text-base"
                style={{ color: 'var(--brand-muted)' }}
              >
                {loading
                  ? 'Loading listings…'
                  : `${listings.length} listing${listings.length !== 1 ? 's' : ''} from your campus`}
              </p>
            </div>

            <Link
              href="/marketplace/new"
              className="btn-primary self-start sm:self-auto"
              aria-label="Create new listing"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New listing
            </Link>
          </div>

          {/* ── Search ──────────────────────────────────────────────────────── */}
          <div className="relative mb-5 anim-fade-up delay-1">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search by title or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-11"
              style={{ borderRadius: 'var(--r-pill)', padding: '12px 20px 12px 44px' }}
              aria-label="Search listings"
            />
          </div>

          {/* ── Category pills ───────────────────────────────────────────────── */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide anim-fade-up delay-2"
            role="group"
            aria-label="Filter by category"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`pill ${activeCategory === cat ? 'active' : ''}`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Grid ────────────────────────────────────────────────────────── */}
          {loading ? (
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
              aria-label="Loading listings"
            >
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>

          ) : filtered.length === 0 ? (
            <div className="empty-state anim-scale-in">
              <span
                className="text-5xl mb-4 block"
                style={{ filter: 'grayscale(0.3)' }}
                aria-hidden="true"
              >
                🦊
              </span>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: '#f4f2ff', fontFamily: 'var(--font-display)' }}
              >
                {search || activeCategory !== 'All' ? 'No matches found' : 'No listings yet'}
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
                {search || activeCategory !== 'All'
                  ? 'Try a different search or clear your filters'
                  : 'Be the first to list something on campus!'}
              </p>
              {(search || activeCategory !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setActiveCategory('All'); }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              )}
            </div>

          ) : (
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
              aria-label={`${filtered.length} listings`}
            >
              {filtered.map((listing, i) => (
                <div
                  key={listing.id}
                  className="anim-fade-up"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
                >
                  <ListingCard listing={listing} handleDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
