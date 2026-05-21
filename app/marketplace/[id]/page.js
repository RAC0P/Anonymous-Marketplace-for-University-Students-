'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { createInterest } from '../../../lib/interests';
import { useAuth } from '../../../hooks/useAuth';
import AuthGuard from '../../../components/auth/AuthGuard';
import Navbar from '../../../components/ui/Navbar';

const CONDITION_COLORS = {
  new: { bg: '#ecfdf5', text: '#059669', label: 'New' },
  good: { bg: '#eff6ff', text: '#3b82f6', label: 'Good' },
  fair: { bg: '#fffbeb', text: '#d97706', label: 'Fair' },
  poor: { bg: '#fef2f2', text: '#ef4444', label: 'Poor' },
};

export default function ListingDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  async function handleInterest() {
    if (user.uid === listing.sellerId) {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl">🦊</div></div>;

  if (!listing) return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">Listing not found</div>
    </AuthGuard>
  );

  const condition = CONDITION_COLORS[listing.condition] || CONDITION_COLORS.good;

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--brand-paper)' }}>
        <Navbar />

        <main className="max-w-3xl mx-auto px-5 py-10">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm mb-8 text-[var(--brand-muted)] hover:text-black">
            ← Back to Marketplace
          </Link>

          <div className="bg-white rounded-3xl border border-[var(--brand-border)] overflow-hidden card-hover">
            <div className="px-8 py-8 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]">
              <div className="flex gap-3">
                <span className="text-4xl">📦</span>
                <div>
                  <span className="badge px-4 py-1" style={{ background: condition.bg, color: condition.text }}>{condition.label}</span>
                  <span className="badge ml-2">{listing.category}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {listing.title}
              </h1>

              <p className="mt-6 text-[var(--brand-muted)] leading-relaxed">{listing.description}</p>

              {seller && (
                <div className="mt-8 p-5 rounded-2xl bg-[var(--brand-surface)] flex items-center gap-4">
                  <div className="text-4xl">{seller.anonAvatar || '🦊'}</div>
                  <div>
                    <p className="text-sm text-[var(--brand-muted)]">Listed by</p>
                    <p className="font-semibold text-lg">{seller.anonName}</p>
                  </div>
                </div>
              )}

              <div className="mt-10 flex items-end justify-between border-t border-[var(--brand-border)] pt-8">
                <div>
                  <p className="text-sm text-[var(--brand-muted)]">Price</p>
                  <p className="text-5xl font-bold text-[var(--brand-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
                    ৳{listing.price?.toLocaleString()}
                  </p>
                </div>

                {user?.uid === listing.sellerId ? (
                  <div className="px-6 py-3 rounded-2xl bg-[var(--brand-surface)]">Your Listing</div>
                ) : sent ? (
                  <div className="px-8 py-4 rounded-2xl bg-green-100 text-green-700 font-medium">Interest Sent ✓</div>
                ) : (
                  <button
                    onClick={handleInterest}
                    disabled={sending}
                    className="modern-btn px-10 py-4 text-lg bg-gradient-to-r from-[var(--brand-accent)] to-[#7c3aed] text-white"
                  >
                    {sending ? 'Sending...' : "I'm Interested"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
