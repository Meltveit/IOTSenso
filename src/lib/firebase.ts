'use client';

/**
 * @deprecated Import from '@/firebase' instead for better Firebase App Hosting support
 * This file remains for backward compatibility
 */

import { initializeFirebase } from '@/firebase';

const { firebaseApp: app, auth, firestore: db } = initializeFirebase();

export { app, auth, db };
