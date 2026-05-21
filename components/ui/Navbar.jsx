'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logout } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  {
    href:  '/marketplace',
    label: 'Marketplace',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
      </svg>
    ),
  },
  {
    href:  '/chat',
    label: 'Messages',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname      = usePathname();
  const router        = useRouter();
  const { user }      = useAuth();
  const [profile, setProfile]     = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(s => {
      if (s.exists()) setProfile(s.data());
    });
  }, [user]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <>
      {/* ── Desktop nav ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 hidden sm:block"
        style={{
          background:   'rgba(13, 12, 21, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--brand-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          {/* Logo - Bigger & Stylish */}
          <Link href="/marketplace" className="flex items-center gap-3 mr-8 shrink-0">
            <span className="text-4xl">🦊</span>
            <span 
              className="text-2xl font-black tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}
            >
              Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-2 flex-1">
            {NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-base font-semibold py-3 px-6"
                  style={active ? { color: '#f4f2ff', background: 'var(--brand-surface2)' } : {}}
                  aria-current={active ? 'page' : undefined}
                >
                  <span style={{ color: active ? 'var(--brand-accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: identity + actions */}
          <div className="flex items-center gap-3 shrink-0">
            {profile && (
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full"
                style={{
                  background:   'rgba(124,106,247,0.08)',
                  border:       '1px solid rgba(124,106,247,0.2)',
                }}
              >
                <span className="text-base leading-none">{profile.anonAvatar || '🦊'}</span>
                <span
                  className="text-xs font-semibold anon-tag"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {profile.anonName || 'Anonymous'}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav ──────────────────────────────────────────────────────── */}
      {/* Top bar */}
      <header
        className="sm:hidden sticky top-0 z-50"
        style={{
          background:   'rgba(13,12,21,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--brand-border)',
        }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
       {/* Mobile Top Bar Logo */}
<Link href="/marketplace" className="flex items-center gap-2">
  <span className="text-2xl">🦊</span>
  <span className="text-xl font-bold tracking-tight" 
        style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
    Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
  </span>
</Link>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="p-2 rounded-xl"
            style={{ color: 'var(--brand-muted)' }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Dropdown */}
        {mobileOpen && (
          <div
            className="px-4 pb-4 space-y-1 anim-fade-in"
            style={{ borderTop: '1px solid var(--brand-border)' }}
          >
            {profile && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
                style={{ background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.15)' }}
              >
                <span className="text-lg">{profile.anonAvatar || '🦊'}</span>
                <span className="text-sm font-semibold anon-tag" style={{ fontFamily: 'var(--font-display)' }}>
                  {profile.anonName || 'Anonymous'}
                </span>
              </div>
            )}

            {NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium"
                  style={{
                    color:      active ? '#f4f2ff' : 'var(--brand-muted)',
                    background: active ? 'var(--brand-surface2)' : 'transparent',
                  }}
                >
                  <span style={{ color: active ? 'var(--brand-accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm"
              style={{ color: 'var(--brand-muted)' }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
        style={{
          background:   'rgba(13,12,21,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop:    '1px solid var(--brand-border)',
          paddingTop:   '10px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        }}
        aria-label="Main navigation"
      >
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-5 py-1 rounded-xl"
              style={{ color: active ? 'var(--brand-accent)' : 'var(--brand-muted)' }}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom padding so content clears the tab bar on mobile */}
      <div className="sm:hidden h-20" aria-hidden="true" />
    </>
  );
}
