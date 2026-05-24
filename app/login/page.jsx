'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generateAnonName, generateAnonAvatar } from '../../lib/anonName';
import { signup, login } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.emailVerified ? '/welcome' : '/verify-email');
    }
  }, [user, loading, router]);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }
        const result = await signup(email, password);
        const newUser = result.user;
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          anonName: generateAnonName(),
          anonAvatar: generateAnonAvatar(),
          createdAt: serverTimestamp(),
        });
        sessionStorage.setItem('_cx_tmp_pw', password);
        router.replace('/verify-email');
      } else {
        await login(email, password);
        router.replace('/welcome');
      }
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : err.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  const isSignup = mode === 'signup';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Left dark panel ── */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(145deg, #0a1628 0%, #0d2151 50%, #0a1628 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '40px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,80,200,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '60px', right: '-60px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,100,220,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '20px', zIndex: 1 }}>
          CampusXchange
        </div>

        {/* Hero text */}
        <div style={{ marginTop: 'auto', marginBottom: '80px', zIndex: 1 }}>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontStyle: 'italic', fontWeight: 800,
            lineHeight: 1.1, margin: '0 0 20px',
            fontFamily: "'Syne', sans-serif",
          }}>
            Login<br />page
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 'clamp(16px, 2vw, 22px)',
            fontStyle: 'italic', lineHeight: 1.4, margin: 0,
          }}>
            Start your journey<br />now with us
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1, background: '#f0f2f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative',
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>

          {/* Back card (peek) */}
          <div style={{
            position: 'absolute',
            top: isSignup ? '30px' : '-30px',
            left: isSignup ? '40px' : '-40px',
            right: isSignup ? '-40px' : '40px',
            bottom: isSignup ? '-30px' : '30px',
            background: '#fff', borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            padding: '36px 32px',
            display: 'flex', flexDirection: 'column', gap: '16px',
            opacity: 0.55,
          }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111' }}>
              {isSignup ? 'Login to your account' : 'Create an account'}
            </h2>
            <div style={{ height: '12px', background: '#f0f2f7', borderRadius: '6px', width: '60%' }} />
            <div style={{ height: '40px', background: '#f0f2f7', borderRadius: '8px' }} />
            <div style={{ height: '12px', background: '#f0f2f7', borderRadius: '6px', width: '40%' }} />
            <div style={{ height: '40px', background: '#f0f2f7', borderRadius: '8px' }} />
            <div style={{ height: '44px', background: '#2563eb', borderRadius: '8px', opacity: 0.3 }} />
          </div>

          {/* Front card (active) */}
          <div style={{
            position: 'relative', background: '#fff',
            borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.13)',
            padding: '36px 32px', zIndex: 2,
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>
              {isSignup ? 'Create an account' : 'Login to your account'}
            </h2>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#444', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="your@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', fontSize: '14px',
                  border: '1.5px solid #dde1ea', borderRadius: '8px',
                  outline: 'none', color: '#111', background: '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#dde1ea'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>Password</label>
                {!isSignup && (
                  <a href="#" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                    Forgot ?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 40px 10px 14px', fontSize: '14px',
                    border: '1.5px solid #dde1ea', borderRadius: '8px',
                    outline: 'none', color: '#111', background: '#fff',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#dde1ea'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#888', padding: 0, fontSize: '16px',
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', color: '#dc2626', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            {/* Primary button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              style={{
                width: '100%', padding: '12px',
                background: submitting ? '#93c5fd' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                marginBottom: isSignup ? '12px' : '0',
                transition: 'background 0.2s',
              }}
            >
              {submitting
                ? (isSignup ? 'Creating...' : 'Logging in...')
                : (isSignup ? 'Create account' : 'Login now')
              }
            </button>
            {/* Switch mode */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', margin: '18px 0 0' }}>
              {isSignup ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                    Log in
                  </button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
