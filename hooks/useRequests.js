'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useRequests(userId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;

    // No orderBy — avoids needing a composite index on Spark plan
    // We sort client-side instead
    const q = query(
      collection(db, 'interests'),
      where('sellerId', '==', userId)
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // Sort pending first, then by createdAt desc
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (b.status === 'pending' && a.status !== 'pending') return 1;
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      setRequests(data);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return { requests, loading };
}
