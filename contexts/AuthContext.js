'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Daftar email yang diizinkan (semua lowercase)
  const allowedEmails = new Set([
    'alaunasbariklana@gmail.com',
    'zelvidiana@gmail.com'
  ]);

  const isAllowed = (email) => {
    if (!email) return false;
    return allowedEmails.has(email.toLowerCase());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Jika email tidak diizinkan, langsung sign out dan jangan set user
        if (!isAllowed(user.email)) {
          console.warn('Unauthorized email attempted to sign in:', user.email);
          firebaseSignOut(auth).catch((e) => console.error('Error signing out unauthorized user:', e));
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedUser = result.user;

      if (!isAllowed(signedUser.email)) {
        // jika tidak diizinkan, sign out dan beri tahu pemanggil
        await firebaseSignOut(auth);
        throw new Error('Unauthorized email');
      }

      return signedUser;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
