'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading || !user) {
      if (!loading && !user) router.replace('/login');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
          setChecking(false);
          console.log("✅ Admin access confirmed");
        } else {
          console.log("❌ Not an admin");
          router.replace('/marketplace');
        }
      } catch (err) {
        console.error(err);
        router.replace('/marketplace');
      }
    };

    checkAdminStatus();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0914] text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p>Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ====================== ADMIN DASHBOARD ======================
  return (
    <div className="min-h-screen bg-[#0a0914] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-green-400 mb-10">✅ Welcome, Admin</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#111024] p-8 rounded-3xl border border-violet-500/20">
            <h3 className="text-xl font-semibold mb-4">Users</h3>
            <p className="text-4xl font-bold text-violet-400">—</p>
            <p className="text-sm text-gray-400 mt-2">Total registered users</p>
          </div>

          <div className="bg-[#111024] p-8 rounded-3xl border border-emerald-500/20">
            <h3 className="text-xl font-semibold mb-4">Listings</h3>
            <p className="text-4xl font-bold text-emerald-400">—</p>
            <p className="text-sm text-gray-400 mt-2">Active listings</p>
          </div>

          <div className="bg-[#111024] p-8 rounded-3xl border border-amber-500/20">
            <h3 className="text-xl font-semibold mb-4">Requests</h3>
            <p className="text-4xl font-bold text-amber-400">—</p>
            <p className="text-sm text-gray-400 mt-2">Pending buy requests</p>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          Full Admin Panel features coming soon...
        </div>
      </div>
    </div>
  );
}
