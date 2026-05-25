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
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Messages',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const navLinkStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '7px 13px',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 500,
  color: active ? '#f0eff8' : '#7a7990',
  background: active ? 'rgba(124,111,247,0.18)' : 'transparent',
  border: active ? '1px solid rgba(124,111,247,0.28)' : '1px solid transparent',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'all 0.18s',
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

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

  const navBar = (
    <div style={{
      width: '100%',
      padding: '0 1.5rem',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      {/* Logo */}
      <Link href="/marketplace" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        textDecoration: 'none', flexShrink: 0,
      }}>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%', background: '#7c6ff7',
        }} />
        <span style={{
          fontFamily: 'var(--font-display, Syne, sans-serif)',
          fontWeight: 800, fontSize: '1rem',
          color: '#f0eff8', letterSpacing: '-0.03em',
        }}>
          CampusXchange
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={navLinkStyle(active)}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#f0eff8';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7a7990';
                }
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0, color: active ? '#a89cf7' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: profile + signout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '20px',
            background: 'rgba(124,106,247,0.08)',
            border: '1px solid rgba(124,106,247,0.2)',
          }}>
            <span style={{ fontSize: '0.9rem' }}>{profile.anonAvatar || '🦊'}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a89cf7' }}>
              {profile.anonName}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px', borderRadius: '8px',
            fontSize: '0.78rem', fontWeight: 500,
            background: 'none',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#7a7990', cursor: 'pointer',
            transition: 'all 0.18s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6ff7'; e.currentTarget.style.color = '#a89cf7'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#7a7990'; }}
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {navBar}
    </header>
  );
}