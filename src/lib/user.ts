import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './types';

/**
 * Henter en brukers fulle profil fra Firestore basert på deres UID.
 * @param {string} uid - Brukerens unike ID fra Firebase Authentication.
 * @returns {Promise<User | null>} Et løfte som resolver til det fulle brukerobjektet, eller null hvis det ikke finnes.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    // Returner dataene, castet til vår User-type fra types.ts
    return userDoc.data() as User;
  }
  
  return null;
}
