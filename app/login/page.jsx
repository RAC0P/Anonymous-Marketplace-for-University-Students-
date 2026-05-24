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
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/welcome');
    }
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Only require disclaimer for signup
    if (isSignup && !acceptedDisclaimer) {
      setError("You must accept the disclaimer to create an account.");
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

        alert("Account created successfully! Please check your email to verify.");
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
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14" style={{ background: 'var(--brand-ink)' }}>
        <div>
          <span className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Campus<span style={{ color: 'var(--brand-accent)' }}>X</span>change
          </span>
        </div>
        <div className="space-y-6">
          <h1 className="text-6xl font-black leading-none tracking-tighter text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Anonymous Campus Marketplace
          </h1>
          <p className="text-xl text-white/70">Trade safely with fellow students.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
            {isSignup ? 'Create Account' : 'Sign In'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full py-4"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full py-4"
              />
            </div>

            {/* Disclaimer - Only for Signup */}
            {isSignup && (
              <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-2xl p-5 text-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-[var(--brand-muted)] leading-relaxed">
                    I understand that my email may be visible to admins for moderation purposes. 
                    Although the platform is anonymous, <strong>illegal items, inappropriate content,
                    or prohibited trading is strictly forbidden</strong>. I agree to follow the rules.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="text-red-400 bg-red-950/50 p-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (isSignup && !acceptedDisclaimer)}
              className="w-full py-4 text-lg font-semibold rounded-2xl btn-primary disabled:opacity-50"
            >
              {submitting
                ? (isSignup ? 'Creating Account...' : 'Signing In...')
                : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { 
                setIsSignup(!isSignup); 
                setError(''); 
                setAcceptedDisclaimer(false); 
              }}
              className="text-[var(--brand-accent)] hover:underline"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
