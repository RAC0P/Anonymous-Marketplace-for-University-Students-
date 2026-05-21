'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  addDoc, collection, doc, getDoc,
  onSnapshot, query, serverTimestamp,
  updateDoc, orderBy,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import AuthGuard from '../../../components/auth/AuthGuard';
import { useAuth } from '../../../hooks/useAuth';

/* ── Date grouping ───────────────────────────────────────────────────────────── */
function groupByDate(messages) {
  const groups = [];
  let current  = null;
  for (const msg of messages) {
    const date = msg.createdAt?.toDate ? formatDate(msg.createdAt.toDate()) : 'Today';
    if (!current || current.date !== date) { current = { date, msgs: [] }; groups.push(current); }
    current.msgs.push(msg);
  }
  return groups;
}

function formatDate(d) {
  const diff = new Date().setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0);
  if (diff === 0)        return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMsgTime(ts) {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ── Loading dots ────────────────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="loading-screen" aria-label="Loading">
      <div className="flex gap-2">
        <span className="dot-1 w-2 h-2 rounded-full inline-block" style={{ background: 'var(--brand-accent)' }} />
        <span className="dot-2 w-2 h-2 rounded-full inline-block" style={{ background: 'var(--brand-accent2)' }} />
        <span className="dot-3 w-2 h-2 rounded-full inline-block" style={{ background: 'var(--brand-warm)' }} />
      </div>
    </div>
  );
}

/* ── Send icon ───────────────────────────────────────────────────────────────── */
function SendIcon({ color = 'white' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function ChatRoomPage() {
  const { user }   = useAuth();
  const params     = useParams();
  const chatId     = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;

  const [chat,     setChat]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  /* Fetch chat metadata */
  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, 'chats', chatId)).then(snap => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [chatId]);

  /* Real-time messages */
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap =>
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [chatId]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Send */
  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg || sending) return;
    setText('');
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId:  user.uid,
        text:      msg,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage:   msg,
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setText(msg); // restore on failure
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [text, sending, chatId, user]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  /* Identity helpers */
  const isBuyer     = chat?.participants?.[0] === user?.uid;
  const myAvatar    = isBuyer ? chat?.buyerAvatar  : chat?.sellerAvatar;
  const otherAvatar = isBuyer ? chat?.sellerAvatar : chat?.buyerAvatar;
  const otherName   = isBuyer ? chat?.sellerName   : chat?.buyerName;

  /* ── Render guards ── */
  if (loading) return <AuthGuard><LoadingDots /></AuthGuard>;

  if (!chat) return (
    <AuthGuard>
      <div className="loading-screen flex-col gap-4">
        <span className="text-4xl" aria-hidden="true">🤷</span>
        <p style={{ color: '#f4f2ff', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
          Chat not found
        </p>
        <Link href="/chat" className="btn-secondary">← Back to messages</Link>
      </div>
    </AuthGuard>
  );

  const grouped = groupByDate(messages);

  return (
    <AuthGuard>
      <div
        style={{
          height:      '100svh',
          display:     'flex',
          flexDirection: 'column',
          background:  'var(--brand-paper)',
          overflow:    'hidden',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header
          style={{
            flexShrink:   0,
            display:      'flex',
            alignItems:   'center',
            gap:          '14px',
            padding:      '0 20px',
            height:       '64px',
            background:   'rgba(13,12,21,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--brand-border)',
          }}
        >
          {/* Back */}
          <Link
            href="/chat"
            className="back-link shrink-0"
            style={{ padding: '8px', marginLeft: '-8px' }}
            aria-label="Back to messages"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Other avatar */}
          <div
            style={{
              width:         '40px',
              height:        '40px',
              borderRadius:  '12px',
              background:    'var(--brand-surface2)',
              border:        '1px solid var(--brand-border2)',
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'center',
              fontSize:      '20px',
              flexShrink:     0,
            }}
            aria-hidden="true"
          >
            {otherAvatar || '🦊'}
          </div>

          {/* Name + label */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="anon-tag"
              style={{
                fontFamily:    'var(--font-display)',
                fontWeight:    700,
                fontSize:      '14px',
                letterSpacing: '-0.01em',
                display:       'block',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
                whiteSpace:    'nowrap',
              }}
            >
              {otherName || 'Anonymous'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--brand-muted)', marginTop: '1px' }}>
              Anonymous · identities are private
            </p>
          </div>

          {/* View listing shortcut */}
          {chat.listingId && (
            <Link
              href={`/marketplace/${chat.listingId}`}
              className="btn-secondary shrink-0"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Listing
            </Link>
          )}
        </header>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div
          style={{
            flex:     '1 1 0',
            overflowY: 'auto',
            padding:  '24px 20px',
            display:  'flex',
            flexDirection: 'column',
            gap:      '2px',
          }}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            <div
              style={{
                flex:            1,
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                textAlign:       'center',
                gap:             '12px',
              }}
            >
              <span style={{ fontSize: '3rem' }} aria-hidden="true">👋</span>
              <p style={{ color: '#f4f2ff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                Chat unlocked!
              </p>
              <p style={{ color: 'var(--brand-muted)', fontSize: '14px', maxWidth: '260px', lineHeight: 1.5 }}>
                You're both anonymous here — introduce yourself and start negotiating.
              </p>
            </div>
          ) : (
            grouped.map(({ date, msgs }) => (
              <div key={date}>
                {/* Date separator */}
                <div
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '12px',
                    margin:         '20px 0 16px',
                  }}
                  role="separator"
                  aria-label={date}
                >
                  <div style={{ flex: 1, height: '1px', background: 'var(--brand-border)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--brand-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                    {date}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--brand-border)' }} />
                </div>

                {/* Messages in this date group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {msgs.map((msg, i) => {
                    const isMe     = msg.senderId === user?.uid;
                    const nextMsg  = msgs[i + 1];
                    const isLast   = !nextMsg || nextMsg.senderId !== msg.senderId;

                    return (
                      <div
                        key={msg.id}
                        className="bubble-in"
                        style={{
                          display:        'flex',
                          flexDirection:  isMe ? 'row-reverse' : 'row',
                          alignItems:     'flex-end',
                          gap:            '8px',
                          marginBottom:   isLast ? '8px' : '1px',
                        }}
                      >
                        {/* Avatar — only on last message in a run */}
                        <div
                          style={{
                            width:          '30px',
                            height:         '30px',
                            borderRadius:   '10px',
                            flexShrink:     0,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            fontSize:       '16px',
                            background:     isLast ? 'var(--brand-surface2)' : 'transparent',
                            border:         isLast ? '1px solid var(--brand-border)' : 'none',
                            visibility:     isLast ? 'visible' : 'hidden',
                          }}
                          aria-hidden="true"
                        >
                          {isLast ? (isMe ? myAvatar || '🦊' : otherAvatar || '🦊') : ''}
                        </div>

                        {/* Bubble */}
                        <div style={{ maxWidth: 'min(72%, 460px)', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <div
                            style={{
                              padding:       '10px 15px',
                              borderRadius:  isMe
                                ? isLast ? '18px 18px 4px 18px' : '18px'
                                : isLast ? '18px 18px 18px 4px' : '18px',
                              background:    isMe
                                ? 'linear-gradient(135deg, var(--brand-accent), #9d4ef7)'
                                : 'var(--brand-surface2)',
                              color:         isMe ? 'white' : '#e8e6f0',
                              fontSize:      '14px',
                              lineHeight:    1.55,
                              border:        isMe ? 'none' : '1px solid var(--brand-border2)',
                              boxShadow:     isMe
                                ? '0 2px 12px rgba(124,106,247,0.25)'
                                : '0 1px 4px rgba(0,0,0,0.2)',
                              wordBreak:     'break-word',
                            }}
                          >
                            {msg.text}
                          </div>
                          {/* Timestamp — only on last bubble of a run */}
                          {isLast && (
                            <span
                              style={{
                                fontSize:   '10px',
                                color:      'var(--brand-muted)',
                                marginTop:  '3px',
                                padding:    '0 4px',
                              }}
                              aria-label={`Sent at ${formatMsgTime(msg.createdAt)}`}
                            >
                              {formatMsgTime(msg.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink:   0,
            padding:      '12px 16px max(12px, env(safe-area-inset-bottom))',
            background:   'rgba(13,12,21,0.9)',
            backdropFilter: 'blur(20px)',
            borderTop:    '1px solid var(--brand-border)',
          }}
        >
          <form
            onSubmit={sendMessage}
            style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}
            aria-label="Send message"
          >
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message…"
              rows={1}
              aria-label="Type a message"
              style={{
                flex:          1,
                padding:       '11px 16px',
                borderRadius:  '16px',
                border:        `1px solid ${text ? 'var(--brand-accent)' : 'var(--brand-border)'}`,
                background:    'var(--brand-surface)',
                color:         '#f4f2ff',
                fontFamily:    'var(--font-body)',
                fontSize:      '14px',
                lineHeight:    1.5,
                resize:        'none',
                outline:       'none',
                maxHeight:     '120px',
                overflowY:     'auto',
                transition:    'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow:     text ? '0 0 0 3px var(--glow-accent)' : 'none',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />

            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="btn-primary"
              style={{
                width:         '44px',
                height:        '44px',
                padding:       0,
                borderRadius:  '14px',
                flexShrink:    0,
                justifyContent: 'center',
                opacity:       (!text.trim() || sending) ? 0.35 : 1,
              }}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>

          <p
            style={{
              textAlign:  'center',
              fontSize:   '10px',
              color:      'var(--brand-muted)',
              marginTop:  '7px',
              opacity:    0.6,
            }}
          >
            🔒 Anonymous — never share personal contact info
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
