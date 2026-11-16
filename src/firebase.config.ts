import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web config (Firebase console → Project settings → Your apps → Web app).
 * These values identify the project and are not secrets; access is enforced by firestore.rules + Google sign-in.
 * Set to null to run the site read-only with the "not connected" banner.
 * A VITE_FIREBASE_CONFIG build variable (JSON) overrides this.
 * Analytics (measurementId) is left out on purpose: the site doesn't track visitors.
 */
export const firebaseConfig: FirebaseOptions | null = {
  apiKey: "AIzaSyCuGKSLcDFZx0OMooJyqbdcJJXmTXlIk8g",
  authDomain: "import-hub-92421.firebaseapp.com",
  projectId: "import-hub-92421",
  storageBucket: "import-hub-92421.firebasestorage.app",
  messagingSenderId: "853879835427",
  appId: "1:853879835427:web:e8ba4e61d27fb375bf1a96",
};
