'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../lib/auth';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!user.emailVerified) {
        router.replace('/verify-email');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-paper)]">
        <div className="flex gap-2">
          <span className="dot-1 w-2 h-2 rounded-full bg-[var(--brand-accent)]" />
          <span className="dot-2 w-2 h-2 rounded-full bg-[var(--brand-accent2)]" />
          <span className="dot-3 w-2 h-2 rounded-full bg-[var(--brand-warm)]" />
        </div>
      </div>
    );
  }

  if (!user || !user.emailVerified) return null;

  return children;
}
