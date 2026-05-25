'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generateAnonName, generateAnonAvatar } from '../../lib/anonName';
import { signup, login } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && user) router.replace('/welcome');
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (isSignup && !acceptedDisclaimer) {
      setError('You must accept the disclaimer to create an account.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      if (isSignup) {
        const result = await signup(email, password);
        const newUser = result.user;
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          anonName: generateAnonName(),
          anonAvatar: generateAnonAvatar(),
          createdAt: serverTimestamp(),
        });
        alert('Account created! Check your email to verify.');
        router.replace('/welcome');
      } else {
        await login(email, password);
        router.replace('/welcome');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .lp-root {
          min-height: 100vh;
          background: #07060e;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* ── noise grain overlay ── */
        .lp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* ── left panel ── */
        .lp-left {
          flex: 1;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        @media (min-width: 900px) { .lp-left { display: flex; } }

        .lp-left-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, #0e0b1e 0%, #120d26 40%, #0a0815 100%);
          z-index: 0;
        }
        .lp-left-blob1 {
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,106,247,0.22) 0%, transparent 70%);
          top: -80px; left: -100px;
          filter: blur(40px);
          z-index: 1;
          animation: blobDrift 12s ease-in-out infinite alternate;
        }
        .lp-left-blob2 {
          position: absolute;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,78,124,0.16) 0%, transparent 70%);
          bottom: 60px; right: -60px;
          filter: blur(50px);
          z-index: 1;
          animation: blobDrift 16s ease-in-out infinite alternate-reverse;
        }
        @keyframes blobDrift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.08); }
        }

        /* decorative big number */
        .lp-deco-num {
          position: absolute;
          bottom: -20px; right: -10px;
          font-family: 'Syne', sans-serif;
          font-size: 280px;
          font-weight: 800;
          color: rgba(255,255,255,0.025);
          line-height: 1;
          letter-spacing: -0.06em;
          z-index: 1;
          pointer-events: none;
          user-select: none;
        }

        .lp-left-content { position: relative; z-index: 2; }

        .lp-wordmark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: rgba(255,255,255,0.9);
          letter-spacing: -0.02em;
        }
        .lp-wordmark span { color: #7c6af7; }

        .lp-hero-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7c6af7;
          margin-bottom: 20px;
        }

        .lp-hero-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(48px, 5vw, 72px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: #f4f2ff;
          margin-bottom: 28px;
        }
        .lp-hero-heading em {
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.35);
        }

        .lp-hero-sub {
          font-size: 16px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          max-width: 360px;
        }

        /* pill badges */
        .lp-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 48px;
        }
        .lp-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          backdrop-filter: blur(8px);
        }
        .lp-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #7c6af7;
          box-shadow: 0 0 8px rgba(124,106,247,0.8);
        }

        /* divider line */
        .lp-divider {
          position: absolute;
          top: 0; bottom: 0;
          right: 0;
          width: 1px;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(255,255,255,0.08) 20%,
            rgba(124,106,247,0.25) 50%,
            rgba(255,255,255,0.08) 80%,
            transparent 100%
          );
          z-index: 3;
        }

        /* ── right panel ── */
        .lp-right {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 900px) {
          .lp-right { width: 480px; flex-shrink: 0; margin: 0; }
        }

        /* mode toggle bar */
        .lp-mode-bar {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 5px;
          margin-bottom: 40px;
          gap: 4px;
        }
        .lp-mode-btn {
          flex: 1;
          padding: 11px;
          border: none;
          border-radius: 11px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: transparent;
          color: rgba(255,255,255,0.35);
        }
        .lp-mode-btn.active {
          background: #7c6af7;
          color: #fff;
          box-shadow: 0 4px 20px rgba(124,106,247,0.4);
        }

        /* form heading */
        .lp-form-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.95;
          color: #f4f2ff;
          margin-bottom: 8px;
        }
        .lp-form-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          margin-bottom: 36px;
        }

        /* fields */
        .lp-field {
          margin-bottom: 18px;
        }
        .lp-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .lp-input-wrap {
          position: relative;
        }
        .lp-input {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #f4f2ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .lp-input::placeholder { color: rgba(255,255,255,0.18); }
        .lp-input:focus {
          border-color: rgba(124,106,247,0.6);
          background: rgba(124,106,247,0.06);
          box-shadow: 0 0 0 3px rgba(124,106,247,0.12);
        }
        .lp-input:focus::placeholder { color: rgba(255,255,255,0.28); }

        .lp-eye-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          padding: 4px;
          transition: color 0.15s;
          line-height: 0;
        }
        .lp-eye-btn:hover { color: rgba(255,255,255,0.6); }

        /* disclaimer */
        .lp-disclaimer {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          padding: 16px 18px;
          margin-bottom: 18px;
        }
        .lp-disclaimer-inner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }
        .lp-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 1.5px solid rgba(255,255,255,0.2);
          background: transparent;
          flex-shrink: 0;
          margin-top: 2px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          position: relative;
          transition: border-color 0.2s, background 0.2s;
        }
        .lp-checkbox:checked {
          background: #7c6af7;
          border-color: #7c6af7;
        }
        .lp-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 4px; top: 1px;
          width: 6px; height: 10px;
          border: 2px solid #fff;
          border-top: none; border-left: none;
          transform: rotate(42deg);
        }
        .lp-disclaimer-text {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
        }
        .lp-disclaimer-text strong { color: rgba(255,255,255,0.6); font-weight: 600; }

        /* error */
        .lp-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #f87171;
          line-height: 1.5;
        }

        /* submit button */
        .lp-submit {
          width: 100%;
          padding: 18px 24px;
          border: none;
          border-radius: 14px;
          background: #7c6af7;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease,
                      background 0.2s ease;
          box-shadow: 0 6px 32px rgba(124,106,247,0.35);
        }
        .lp-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .lp-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 40px rgba(124,106,247,0.5);
          background: #8b7bf7;
        }
        .lp-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }
        .lp-submit:disabled {
          opacity: 0.38;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* spinner */
        .lp-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* switch link */
        .lp-switch {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
        }
        .lp-switch button {
          background: none;
          border: none;
          color: #a78bfa;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .lp-switch button:hover { color: #c4b5fd; }

        /* mount animation */
        .lp-mount {
          opacity: 0;
          transform: translateY(16px);
          animation: mountIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes mountIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="lp-root">
        {/* ── LEFT PANEL ── */}
        <div className="lp-left">
          <div className="lp-left-bg" />
          <div className="lp-left-blob1" />
          <div className="lp-left-blob2" />
          <div className="lp-deco-num">X</div>
          <div className="lp-divider" />

          {/* top: wordmark */}
          <div className="lp-left-content">
            <div className="lp-wordmark">
              Campus<span>X</span>change
            </div>
          </div>

          {/* middle: hero */}
          <div className="lp-left-content">
            <p className="lp-hero-eyebrow">Anonymous marketplace</p>
            <h1 className="lp-hero-heading">
              Buy &amp; sell<br />
              <em>without</em><br />
              the noise.
            </h1>
            <p className="lp-hero-sub">
              Trade textbooks, electronics, and more with fellow students — privately and safely.
            </p>

            <div className="lp-badges">
              <div className="lp-badge"><div className="lp-badge-dot" /> Anonymous identity</div>
              <div className="lp-badge"><div className="lp-badge-dot" style={{ background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} /> Campus-only</div>
              <div className="lp-badge"><div className="lp-badge-dot" style={{ background: '#e84e7c', boxShadow: '0 0 8px rgba(232,78,124,0.8)' }} /> Free forever</div>
            </div>
          </div>

          {/* bottom: tagline */}
          <div className="lp-left-content">
            <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
              For students, by students
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lp-right" style={{ animationDelay: '0.1s' }}>
          <div className={mounted ? 'lp-mount' : ''} style={{ animationDelay: '0.08s' }}>

            {/* mode toggle */}
            <div className="lp-mode-bar">
              <button
                className={`lp-mode-btn ${isSignup ? 'active' : ''}`}
                onClick={() => { setIsSignup(true); setError(''); setAcceptedDisclaimer(false); }}
              >
                Create account
              </button>
              <button
                className={`lp-mode-btn ${!isSignup ? 'active' : ''}`}
                onClick={() => { setIsSignup(false); setError(''); setAcceptedDisclaimer(false); }}
              >
                Sign in
              </button>
            </div>

            {/* heading */}
            <h2 className="lp-form-heading">
              {isSignup ? <>Join<br />the market.</> : <>Welcome<br />back.</>}
            </h2>
            <p className="lp-form-sub">
              {isSignup ? 'Your anonymous identity awaits.' : 'Good to see you again.'}
            </p>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-email">Email address</label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-email"
                    className="lp-input"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-password"
                    className="lp-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="lp-disclaimer">
                  <label className="lp-disclaimer-inner">
                    <input
                      type="checkbox"
                      className="lp-checkbox"
                      checked={acceptedDisclaimer}
                      onChange={e => setAcceptedDisclaimer(e.target.checked)}
                    />
                    <span className="lp-disclaimer-text">
                      I understand my email may be visible to admins for moderation.{' '}
                      <strong>Illegal items, inappropriate content, and prohibited trading are strictly forbidden.</strong>{' '}
                      I agree to follow the platform rules.
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div className="lp-error">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="lp-submit"
                disabled={submitting || (isSignup && !acceptedDisclaimer)}
              >
                {submitting && <span className="lp-spinner" />}
                {submitting
                  ? (isSignup ? 'Creating account…' : 'Signing in…')
                  : (isSignup ? 'Create my account →' : 'Sign in →')}
              </button>
            </form>

            <div className="lp-switch">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsSignup(v => !v); setError(''); setAcceptedDisclaimer(false); }}>
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
