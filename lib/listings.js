import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadToImgBB } from './imgbb';

export async function createListing(data, imageFiles = []) {
  let imageUrls = [];

  for (const file of imageFiles) {
    try {
      const url = await uploadToImgBB(file);
      imageUrls.push(url);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  }

  const docRef = await addDoc(collection(db, 'listings'), {
    ...data,
    imageUrls,
    status: 'active',
    isDeleted: false,
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