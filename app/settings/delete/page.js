'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { deleteAccount } from '../../../lib/auth';
import Navbar from '../../../components/ui/Navbar';
import AuthGuard from '../../../components/auth/AuthGuard';

export default function DeleteAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const handleDelete = async () => {
    if (confirmedEmail !== user.email) {
      setError("Email does not match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount();
      alert("Your account has been permanently deleted.");
      router.push('/login');
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--brand-paper)' }}>
        <Navbar />

        <main className="max-w-lg mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8 text-red-400" style={{ fontFamily: 'var(--font-display)' }}>
            Delete Account
          </h1>

          {step === 1 && (
            <div className="glass-card p-10 rounded-3xl">
              <p className="text-xl mb-6 text-red-300">
                This action is <strong>permanent</strong> and cannot be undone.
              </p>
              <ul className="space-y-3 text-[var(--brand-muted)] mb-10">
                <li>• Your profile and anonymous name will be deleted</li>
                <li>• All your listings will be removed</li>
                <li>• All chats and requests will be deleted</li>
                <li>• You will be logged out immediately</li>
              </ul>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl"
              >
                I Understand, Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="glass-card p-10 rounded-3xl">
              <p className="mb-6 text-[var(--brand-muted)]">
                Type your email <strong>{user?.email}</strong> to confirm deletion:
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                value={confirmedEmail}
                onChange={(e) => setConfirmedEmail(e.target.value)}
                className="input-field w-full mb-6 py-4"
              />

              {error && <p className="text-red-400 mb-4">{error}</p>}

              <button
                onClick={handleDelete}
                disabled={loading || confirmedEmail !== user?.email}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-2xl"
              >
                {loading ? 'Deleting Account...' : 'PERMANENTLY DELETE MY ACCOUNT'}
              </button>

              <button
                onClick={() => { setStep(1); setError(''); }}
                className="w-full mt-4 py-3 text-[var(--brand-muted)]"
              >
                Cancel
              </button>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
