import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { uploadToImgBB } from './imgbb';

export async function createListing(data, imageFiles = []) {
  let imageUrls = [];

  // Upload all images to ImgBB
  for (const file of imageFiles) {
    try {
      const url = await uploadToImgBB(file);
      imageUrls.push(url);
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  }

  const docRef = await addDoc(collection(db, 'listings'), {
    ...data,
    imageUrls,           // Save image URLs in Firestore
    status: 'active',
    isDeleted: false,    // Kept this from your original schema for consistency with deleteListing
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteListing(listingId) {
  const ref = doc(db, 'listings', listingId);

  await updateDoc(ref, {
    isDeleted: true,
    status: 'deleted',
    deletedAt: serverTimestamp(),
  });
}

export async function restoreListing(listingId) {
  const ref = doc(db, 'listings', listingId);

  await updateDoc(ref, {
    isDeleted: false,
    status: 'active',
    updatedAt: serverTimestamp(),
  });
}
