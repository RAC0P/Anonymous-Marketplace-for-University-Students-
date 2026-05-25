import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await sendEmailVerification(userCredential.user, {
    url: `${window.location.origin}/welcome`,
  });

  return userCredential;
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
export const deleteUnverifiedAccount = async (password) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  if (user.emailVerified) {
    throw new Error('Cannot discard a verified account this way. Use deleteAccount instead.');
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});
  await deleteUser(user);
};

export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  try {
    await deleteDoc(doc(db, 'users', user.uid));

    const listingsQuery = query(
      collection(db, 'listings'),
      where('sellerId', '==', user.uid)
    );
    const listingsSnap = await getDocs(listingsQuery);
    listingsSnap.forEach(async (listing) => {
      await deleteDoc(doc(db, 'listings', listing.id));
    });

    const interestsQuery = query(
      collection(db, 'interests'),
      where('sellerId', '==', user.uid)
    );
    const interestsSnap = await getDocs(interestsQuery);
    interestsSnap.forEach(async (interest) => {
      await deleteDoc(doc(db, 'interests', interest.id));
    });

    await deleteUser(user);
    return true;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};