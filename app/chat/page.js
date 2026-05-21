'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../hooks/useAuth';

/* ── Time formatter ──────────────────────────────────────────────────────────── */
function formatTime(date) {
  if (!date) return '';
  const d    = date.toDate ? date.toDate() : date;
  const diff = Date.now() - d.getTime();
  if (diff < 60_000)     return 'just now';
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
function ChatSkeleton() {
  return (
    <div
      className="flex items-center gap-4 p-5 rounded-2xl"
      style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}
      aria-hidden="true"
    >
      <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-32 rounded-full" />
        <div className="skeleton h-3 w-48 rounded-full" />
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function ChatListPage() {
  const { user }            = useAuth();
  const [chats, setChats]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (b.lastMessageAt?.toMillis?.() || 0) - (a.lastMessageAt?.toMillis?.() || 0)
        );
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  function getOther(chat, field) {
    const isBuyer = chat.participants?.[0] === user?.uid;
    return isBuyer ? chat[`seller${field}`] : chat[`buyer${field}`];
  }

  return (
    <AuthGuard>
      <div className="page-wrapper">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Header */}
          <div className="mb-8 anim-fade-up">
            <p className="section-label mb-2">Private & anonymous</p>
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff', letterSpacing: '-0.04em' }}
            >
              Messages
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--brand-muted)' }}>
              {loading ? '' : `${chats.length} active conversation${chats.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3" aria-label="Loading chats">
              {[...Array(4)].map((_, i) => <ChatSkeleton key={i} />)}
            </div>

          ) : chats.length === 0 ? (
            <div className="empty-state anim-scale-in">
              <span className="text-5xl mb-4 block" aria-hidden="true">💬</span>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: '#f4f2ff', fontFamily: 'var(--font-display)' }}
              >
                No messages yet
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
                Show interest in a listing, or accept a buyer's request to start chatting.
              </p>
              <Link href="/marketplace" className="btn-primary">
                Browse marketplace
              </Link>
            </div>

          ) : (
            <ol className="space-y-2.5" aria-label="Conversations">
              {chats.map((chat, i) => {
                const name   = getOther(chat, 'Name')   || 'Anonymous';
                const avatar = getOther(chat, 'Avatar') || '🦊';

                return (
                  <li key={chat.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <Link href={`/chat/${chat.id}`} className="chat-item group" aria-label={`Chat with ${name}`}>

                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background:  'var(--brand-surface2)',
                          border:      '1px solid var(--brand-border2)',
                          flexShrink:   0,
                        }}
                        aria-hidden="true"
                      >
                        {avatar}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-0.5">
                          <span
                            className="text-sm font-semibold anon-tag truncate"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {name}
                          </span>
                          <span
                            className="text-xs shrink-0"
                            style={{ color: 'var(--brand-muted)' }}
                            aria-label={`Last message time`}
                          >
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p
                          className="text-sm clamp-1"
                          style={{ color: 'var(--brand-muted)' }}
                        >
                          {chat.lastMessage || 'No messages yet — say hi!'}
                        </p>
                      </div>

                      {/* Chevron */}
                      <svg
                        className="shrink-0 transition-transform group-hover:translate-x-0.5"
                        width="14" height="14" fill="none" viewBox="0 0 24 24"
                        stroke="var(--brand-muted)" strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
