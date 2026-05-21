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

  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      // Send unverified users to the verification page instead of the app
      router.replace(user.emailVerified ? '/welcome' : '/verify-email');
    }
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignup) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
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

        // Store password briefly so verify-email page can re-authenticate
        // if the user wants to discard this account. Cleared immediately after use.
        sessionStorage.setItem('_cx_tmp_pw', password);

        router.replace('/verify-email');
      } else {
        await login(email, password);
        router.replace('/welcome');
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
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

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden" 
           style={{ background: 'var(--brand-ink)' }}>
        
        <div className="relative z-10">
          <span className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-6xl font-black leading-none tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Anonymous Campus<br />Marketplace
          </h1>
          <p className="text-xl text-white/70 max-w-md">
            Buy, sell, and trade with fellow students — completely private and anonymous.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/40">Anyone with Gmail can join</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <span className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
              Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-[var(--brand-muted)] mb-10">
            {isSignup ? 'Join the anonymous campus marketplace' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full py-4 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full py-4 text-base"
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl text-red-400 bg-red-950/50 border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-lg font-semibold rounded-2xl btn-primary"
            >
              {submitting 
                ? (isSignup ? 'Creating Account...' : 'Signing In...') 
                : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-[var(--brand-accent)] hover:underline"
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--brand-muted)] mt-10">
            Your real identity stays private • Fun anonymous name provided
          </p>
        </div>
      </div>
    </div>
  );
}
