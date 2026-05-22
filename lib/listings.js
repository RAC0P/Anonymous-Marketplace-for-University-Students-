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

  console.log(`Uploading ${imageFiles.length} images...`);

  for (const file of imageFiles) {
    try {
      const url = await uploadToImgBB(file);
      imageUrls.push(url);
      console.log("Uploaded:", url);
    } catch (err) {
      console.error("Failed to upload one image:", err);
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

  console.log("✅ Listing created with images:", imageUrls);
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
