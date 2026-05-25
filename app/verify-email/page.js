'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { resendVerificationEmail, deleteUnverifiedAccount } from '../../lib/auth';

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState('');

  const [needsPassword, setNeedsPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace('/welcome');
    }
  }, [user, loading, router]);

  const handleResend = async () => {
    setError('');
    if (user) {
      try {
        await resendVerificationEmail(user);
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      } catch {
        setError('Could not resend email. Please try again in a minute.');
      }
    }
  };

  const handleUseNewEmail = async () => {
    setError('');
    let password = sessionStorage.getItem('_cx_tmp_pw') || confirmPassword;

    if (!password) {
      setNeedsPassword(true);
      return;
    }

    setDiscarding(true);
    try {
      await deleteUnverifiedAccount(password);
      sessionStorage.removeItem('_cx_tmp_pw'); 
      router.replace('/login');
    } catch (err) {
      sessionStorage.removeItem('_cx_tmp_pw');
      setDiscarding(false);

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
        setConfirmPassword('');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError('Could not remove the account. Please try again or contact support.');
      }
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-paper)] p-6">
      <div className="max-w-md w-full text-center glass-card p-12 rounded-3xl">
        <div className="text-6xl mb-8">📧</div>

        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Verify Your Email
        </h1>

        <p className="text-[var(--brand-muted)] mb-4 leading-relaxed">
          We sent a verification link to
          <br />
          <strong className="text-white">{user?.email}</strong>
        </p>

        <p className="text-sm text-[var(--brand-muted)] mb-10">
          Please check your inbox (and spam folder) and click the link to
          continue. The email comes from{' '}
          <span className="text-white">noreply@campusxchange-20e4c.firebaseapp.com</span>.
        </p>

        {error && (
          <div className="p-4 rounded-2xl text-red-400 bg-red-950/50 border border-red-500/30 mb-6 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resent}
          className="btn-secondary w-full py-4 mb-4"
        >
          {resent ? 'Verification Email Resent ✓' : 'Resend Verification Email'}
        </button>

        {/* ── Discard & start over ── */}
        {needsPassword ? (
          <div className="mb-6 text-left">
            <p className="text-sm text-[var(--brand-muted)] mb-3 text-center">
              Enter your password to confirm account removal:
            </p>
            <input
              type="password"
              placeholder="Your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field w-full py-3 text-sm mb-3"
            />
            <button
              onClick={handleUseNewEmail}
              disabled={discarding || !confirmPassword}
              className="w-full py-3 rounded-2xl border border-red-500/50 text-red-400 hover:bg-red-950/30 transition-colors text-sm disabled:opacity-50"
            >
              {discarding ? 'Removing account…' : 'Confirm — delete this account'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleUseNewEmail}
            disabled={discarding}
            className="w-full py-4 mb-6 rounded-2xl border border-[var(--brand-border)] text-[var(--brand-muted)] hover:text-white hover:border-white transition-colors text-sm"
          >
            {discarding ? 'Removing account…' : '✕ Use a different email address'}
          </button>
        )}

        <button
          onClick={() => router.push('/login')}
          className="text-sm text-[var(--brand-muted)] hover:text-white"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
