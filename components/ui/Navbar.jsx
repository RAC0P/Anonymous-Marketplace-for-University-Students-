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
    href: '/marketplace',
    label: 'Marketplace',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Messages',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
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
      {/* Desktop Navbar */}
      <header
        className="sticky top-0 z-50 hidden sm:block"
        style={{
          background: 'rgba(13, 12, 21, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--brand-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          
          {/* Modern CX Logo */}
          <Link href="/marketplace" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-black text-3xl tracking-[-0.05em]">CX</span>
            </div>
            <span className="text-2xl font-black tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
              Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-2 flex-1">
            {NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-base font-semibold py-3 px-6 rounded-xl"
                  style={active ? { color: '#f4f2ff', background: 'var(--brand-surface2)' } : {}}
                >
                  <span style={{ color: active ? 'var(--brand-accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full" 
                   style={{ background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.2)' }}>
                <span className="text-xl">{profile.anonAvatar || '🦊'}</span>
                <span className="text-sm font-semibold anon-tag">{profile.anonName}</span>
              </div>
            )}
            <button onClick={handleLogout} className="btn-secondary px-5 py-2 text-sm">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="sm:hidden sticky top-0 z-50" style={{
        background: 'rgba(13,12,21,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--brand-border)',
      }}>
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Mobile Logo */}
          <Link href="/marketplace" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-2xl">CX</span>
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
              CampusXchange
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-3 text-2xl"
            style={{ color: 'var(--brand-muted)' }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="px-4 pb-6 border-t border-[var(--brand-border)] bg-[rgba(13,12,21,0.98)]">
            {NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 text-base font-medium rounded-xl"
                  style={{
                    color: active ? '#f4f2ff' : 'var(--brand-muted)',
                    background: active ? 'var(--brand-surface2)' : 'transparent',
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-5 py-4 text-base text-red-400 mt-2"
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[rgba(13,12,21,0.95)] border-t border-[var(--brand-border)] py-2">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1"
              style={{ color: active ? 'var(--brand-accent)' : 'var(--brand-muted)' }}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sm:hidden h-20" />
    </>
  );
}
