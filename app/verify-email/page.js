'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { resendVerificationEmail } from '../../lib/auth';

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace('/welcome');
    }
  }, [user, loading, router]);

  const handleResend = async () => {
    if (user) {
      await resendVerificationEmail(user);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-paper)] p-6">
      <div className="max-w-md w-full text-center glass-card p-12 rounded-3xl">
        <div className="text-6xl mb-8">📧</div>
        
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Verify Your Email
        </h1>
        
        <p className="text-[var(--brand-muted)] mb-8 leading-relaxed">
          We sent a verification link to<br />
          <strong className="text-white">{user?.email}</strong>
        </p>

        <p className="text-sm text-[var(--brand-muted)] mb-10">
          Please check your inbox (and spam folder) and click the link to continue.
        </p>

        <button
          onClick={handleResend}
          disabled={resent}
          className="btn-secondary w-full py-4 mb-6"
        >
          {resent ? "Verification Email Resent ✓" : "Resend Verification Email"}
        </button>

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
