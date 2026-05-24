import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { auth, db } from './firebase';

// Use a SINGLE stable production URL
const APP_URL = 'https://campusxchange-dusky.vercel.app';

export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await userCredential.user.reload();

  await sendEmailVerification(userCredential.user, {
    url: `${APP_URL}/welcome`,
  });

  return userCredential;
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await userCredential.user.reload();
  return userCredential;
};

export const logout = () => signOut(auth);

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user found');
  }

  await user.reload();

  try {
    await sendEmailVerification(user, {
      url: `${APP_URL}/welcome`,
    });
  } catch (err) {
    console.error('sendEmailVerification failed:', err.code, err.message);
    throw err;
  }
};
