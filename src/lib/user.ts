import { doc, getDoc, updateDoc, PartialWithFieldValue } from 'firebase/firestore';
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
    return userDoc.data() as User;
  }
  
  return null;
}

/**
 * Oppdaterer en brukerprofil i Firestore.
 * @param {string} uid - Brukerens unike ID.
 * @param {Partial<User>} data - Et objekt som inneholder feltene som skal oppdateres.
 * @returns {Promise<void>} Et løfte som resolver når oppdateringen er fullført.
 */
export async function updateUserProfile(uid: string, data: PartialWithFieldValue<User>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  return await updateDoc(userDocRef, data);
}
