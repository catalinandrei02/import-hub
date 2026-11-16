import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, initializeFirestore, onSnapshot, persistentLocalCache, setDoc, updateDoc, increment,
} from "firebase/firestore";
import type { Connection, ErrCode } from "./backend";

const code = (e: any): ErrCode => (e?.code === "permission-denied" ? "permission-denied" : e?.code === "unavailable" ? "unavailable" : "other");

export function connectFirebase(config: FirebaseOptions): Connection {
  const app = initializeApp(config);
  const db = initializeFirestore(app, { localCache: persistentLocalCache() });
  const auth = getAuth(app);
  const strip = (d: Record<string, any>) => JSON.parse(JSON.stringify(d)); // drop undefined
  const nest = (flat: Record<string, unknown>) => { // {"a.b": 1} → {a: {b: 1}} (setDoc merge doesn't read dotted keys)
    const o: Record<string, any> = {};
    for (const [k, v] of Object.entries(flat)) { const ks = k.split("."); let c = o; ks.slice(0, -1).forEach(x => (c = c[x] ??= {})); c[ks[ks.length - 1]] = v; }
    return o;
  };
  return {
    backend: {
      watchCollection: (p, cb, err) => onSnapshot(collection(db, p), { includeMetadataChanges: true },
        s => cb(s.docs.map(d => ({ id: d.id, data: d.data() })), s.metadata.fromCache), e => err(code(e))),
      watchDoc: (p, cb, err) => onSnapshot(doc(db, p), { includeMetadataChanges: true },
        s => cb(s.exists() ? s.data() : null, s.metadata.fromCache), e => err(code(e))),
      set: (p, d) => setDoc(doc(db, p), strip(d)),
      update: (p, d) => updateDoc(doc(db, p), strip(d)),
      remove: p => deleteDoc(doc(db, p)),
      add: async (p, d) => (await addDoc(collection(db, p), strip(d))).id,
      bump: (p, inc, set) => setDoc(doc(db, p), nest({ ...strip(set), ...Object.fromEntries(Object.entries(inc).map(([k, n]) => [k, increment(n)])) }), { merge: true }),
    },
    auth: {
      onChange: cb => onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, name: u.displayName || "", photo: u.photoURL } : null)),
      signIn: async () => { await signInWithPopup(auth, new GoogleAuthProvider()); },
      signOut: () => signOut(auth),
    },
  };
}
