'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/welcome');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-2">
        <span className="dot-1 w-2 h-2 rounded-full bg-[var(--brand-accent)] inline-block" />
        <span className="dot-2 w-2 h-2 rounded-full bg-[var(--brand-accent2)] inline-block" />
        <span className="dot-3 w-2 h-2 rounded-full bg-[var(--brand-warm)] inline-block" />
      </div>
    </div>
  );
}
