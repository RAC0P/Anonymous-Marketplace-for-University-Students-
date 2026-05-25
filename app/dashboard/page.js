'use client';

import { useState } from 'react';
import Link from 'next/link';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { useRequests } from '../../hooks/useRequests';

const STATUS = {
  pending:  { label: 'Pending',  dotCls: 'status-dot-amber',  cardCls: 'pending',  badgeCls: 'badge-amber'  },
  accepted: { label: 'Accepted', dotCls: 'status-dot-green',  cardCls: 'accepted', badgeCls: 'badge-green'  },
  rejected: { label: 'Rejected', dotCls: 'status-dot-red',    cardCls: 'rejected', badgeCls: 'badge-red'    },
};

function StatCard({ label, value, accent, loading }) {
  return (
    <div className="stat-card" role="status" aria-label={`${label}: ${value}`}>
      <p className="section-label mb-3">{label}</p>
      <p
        className="text-4xl font-bold"
        style={{
          fontFamily:    'var(--font-display)',
          color:         loading ? 'var(--brand-muted)' : accent,
          letterSpacing: '-0.04em',
          lineHeight:    1,
        }}
      >
        {loading ? '—' : value}
      </p>
    </div>
  );
}

function RequestCard({ request, processing, onAccept, onReject }) {
  const s           = STATUS[request.status] || STATUS.pending;
  const isProcessing = processing === request.id;
  const isPending   = request.status === 'pending';

  return (
    <article
      className={`request-card ${s.cardCls}`}
      aria-label={`Request ${request.id.slice(0,8)} — ${s.label}`}
    >
      <div className="flex items-start justify-between gap-5 flex-wrap">

        {/* Left: meta */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Status badge + dot */}
          <div className="flex items-center gap-2.5">
            <span className={`status-dot ${s.dotCls}`} aria-hidden="true" />
            <span className={`badge ${s.badgeCls}`}>{s.label}</span>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--brand-muted)' }}
            >
              #{request.listingId?.slice(0, 8)}
            </span>
          </div>

          {/* Buyer info */}
          <p style={{ color: 'var(--brand-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Buyer{' '}
            <code
              style={{
                background:   'rgba(124,106,247,0.12)',
                color:        '#a78bfa',
                padding:      '2px 7px',
                borderRadius: '6px',
                fontSize:     '12px',
                fontFamily:   'monospace',
              }}
            >
              {request.buyerId?.slice(0, 10)}…
            </code>{' '}
            is interested in your listing.
          </p>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isPending && (
            <>
              <button
                onClick={onReject}
                disabled={isProcessing}
                className="btn-danger"
                style={{ fontSize: '13px', padding: '8px 16px' }}
                aria-label="Decline request"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                disabled={isProcessing}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 20px' }}
                aria-label="Accept request and open chat"
              >
                {isProcessing ? (
                  <>
                    <span className="dot-1 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="dot-2 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="dot-3 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  </>
                ) : 'Accept & chat'}
              </button>
            </>
          )}

          {request.status === 'accepted' && (
            <Link href="/chat" className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Open chat →
            </Link>
          )}

          {request.status === 'rejected' && (
            <span style={{ fontSize: '13px', color: 'var(--brand-muted)' }}>Declined</span>
          )}
        </div>
      </div>
    </article>
  );
}

function RequestSkeleton() {
  return (
    <div
      className="rounded-3xl p-6"
      style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-2 h-2 rounded-full" />
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-3 w-24 rounded-full" />
      </div>
      <div className="skeleton h-3.5 w-3/4 rounded-lg" />
    </div>
  );
}

export default function DashboardPage() {
  const { user }                = useAuth();
  const { requests, loading }   = useRequests(user?.uid);
  const [processing, setProcessing] = useState(null);

  async function handleAccept(request) {
    setProcessing(request.id);
    try {
      await updateDoc(doc(db, 'interests', request.id), {
        status:    'accepted',
        updatedAt: serverTimestamp(),
      });

      const [buyerSnap, sellerSnap] = await Promise.all([
        getDoc(doc(db, 'users', request.buyerId)),
        getDoc(doc(db, 'users', request.sellerId)),
      ]);

      const b = buyerSnap.data()  || {};
      const s = sellerSnap.data() || {};

      await addDoc(collection(db, 'chats'), {
        interestId:    request.id,
        listingId:     request.listingId,
        participants:  [request.buyerId, request.sellerId],
        buyerName:     b.anonName   || 'Anonymous',
        sellerName:    s.anonName   || 'Anonymous',
        buyerAvatar:   b.anonAvatar || '🦊',
        sellerAvatar:  s.anonAvatar || '🦊',
        createdAt:     serverTimestamp(),
        lastMessage:   '',
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(requestId) {
    setProcessing(requestId);
    try {
      await updateDoc(doc(db, 'interests', requestId), {
        status:    'rejected',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  }

  const pending  = requests.filter(r => r.status === 'pending');
  const handled  = requests.filter(r => r.status !== 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');

  return (
    <AuthGuard>
      <div className="page-wrapper">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="mb-8 anim-fade-up">
            <p className="section-label mb-2">Seller hub</p>
            <h1
              style={{
                fontFamily:    'var(--font-display)',
                color:         '#f4f2ff',
                fontSize:      'clamp(2rem, 5vw, 3rem)',
                fontWeight:    800,
                letterSpacing: '-0.04em',
                lineHeight:    1.1,
                margin:        0,
              }}
            >
              Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--brand-muted)' }}>
              Manage interest requests from buyers
            </p>
          </div>

          {/* ── Stats row ───────────────────────────────────────────────────── */}
          <div
            className="grid gap-4 mb-10 anim-fade-up delay-1"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
          >
            <StatCard label="Total"    value={requests.length} accent="#f4f2ff"          loading={loading} />
            <StatCard label="Pending"  value={pending.length}  accent="var(--brand-warm)" loading={loading} />
            <StatCard label="Accepted" value={accepted.length} accent="var(--brand-green)" loading={loading} />
          </div>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <RequestSkeleton key={i} />)}
            </div>

          ) : requests.length === 0 ? (
            <div className="empty-state anim-scale-in">
              <span className="text-5xl mb-4 block" aria-hidden="true">📬</span>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: '#f4f2ff', fontFamily: 'var(--font-display)' }}
              >
                No requests yet
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
                When buyers show interest in your listings, they'll appear here.
              </p>
              <Link href="/marketplace/new" className="btn-primary">
                Create a listing
              </Link>
            </div>

          ) : (
            <div className="space-y-8">
              {/* Pending */}
              {pending.length > 0 && (
                <section aria-label="Pending requests">
                  <p className="section-label mb-4">Awaiting your response ({pending.length})</p>
                  <div className="space-y-3">
                    {pending.map((req, i) => (
                      <div key={req.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                        <RequestCard
                          request={req}
                          processing={processing}
                          onAccept={() => handleAccept(req)}
                          onReject={() => handleReject(req.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Handled */}
              {handled.length > 0 && (
                <section aria-label="Handled requests">
                  <p className="section-label mb-4">Handled ({handled.length})</p>
                  <div className="space-y-3">
                    {handled.map((req, i) => (
                      <div key={req.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                        <RequestCard
                          request={req}
                          processing={processing}
                          onAccept={() => handleAccept(req)}
                          onReject={() => handleReject(req.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
<div className="mt-16 pt-8 border-t border-red-900/30">
  <p className="text-sm text-[var(--brand-muted)] mb-3">Danger Zone</p>
  <Link
    href="/settings/delete"
    className="text-red-400 hover:text-red-500 flex items-center gap-2"
  >
    Delete My Account →
  </Link>
</div>
    </AuthGuard>
  );
}
