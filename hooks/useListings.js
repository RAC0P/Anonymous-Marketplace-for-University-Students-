'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => {
        const listing = { id: doc.id, ...doc.data() };
        // Ensure imageUrls is always an array
        if (!listing.imageUrls) listing.imageUrls = [];
        return listing;
      });
      setListings(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { listings, loading };
}
