import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Send verification email immediately
  await sendEmailVerification(userCredential.user, {
    url: `${window.location.origin}/welcome`, // User will be redirected here after clicking link
    handleCodeInApp: true,
  });

  return userCredential;
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Optional: Force refresh to get latest emailVerified status
  await userCredential.user.reload();
  return userCredential;
};

export const logout = () => signOut(auth);

export const resendVerificationEmail = async (user) => {
  if (user) {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/welcome`,
    });
  }
};

// ==========================================
// Account Deletion
// ==========================================

// Delete user account + all their data
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  try {
    // 1. Delete user document
    await deleteDoc(doc(db, 'users', user.uid));

    // 2. Delete all their listings
    const listingsQuery = query(
      collection(db, 'listings'),
      where('sellerId', '==', user.uid)
    );
    const listingsSnap = await getDocs(listingsQuery);
    listingsSnap.forEach(async (listing) => {
      await deleteDoc(doc(db, 'listings', listing.id));
    });

    // 3. Delete all interests (requests)
    const interestsQuery = query(
      collection(db, 'interests'),
      where('sellerId', '==', user.uid)
    );
    const interestsSnap = await getDocs(interestsQuery);
    interestsSnap.forEach(async (interest) => {
      await deleteDoc(doc(db, 'interests', interest.id));
    });

    // 4. Delete user from Firebase Auth
    await deleteUser(user);

    return true;
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
};
