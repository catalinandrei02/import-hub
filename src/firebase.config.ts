import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web config (Firebase console → Project settings → Your apps → Web app).
 * These values identify the project and are not secrets; access is enforced by firestore.rules + Google sign-in.
 * Leave null until the project exists: the site then runs read-only with a banner.
 * A VITE_FIREBASE_CONFIG build variable (JSON) overrides this.
 */
export const firebaseConfig: FirebaseOptions | null = null;
