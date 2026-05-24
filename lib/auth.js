import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './firebase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://campusxchange-dusky.vercel.app';

export const signup = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    await sendEmailVerification(userCredential.user, {
      url: `${APP_URL}/welcome`,
      handleCodeInApp: true,
    });

    console.log("✅ Verification email sent to:", email);
    return userCredential;
  } catch (error) {
    console.error("Signup Error:", error.code, error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await userCredential.user.reload();
  return userCredential;
};

export const logout = () => signOut(auth);

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await user.reload();

  if (user.emailVerified) {
    throw new Error('Email is already verified');
  }

  await sendEmailVerification(user, {
    url: `${APP_URL}/welcome`,
    handleCodeInApp: true,
  });

  console.log("✅ Resent verification email to:", user.email);
};