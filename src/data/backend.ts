// Small document-store interface the app uses. Paths follow Firestore: odd segments = collection, even = document.
// Implementations: Firestore (production) and an in-memory mock (tests, `vite --mode mock`).

export interface DocSnap { id: string; data: Record<string, any> }
export type Unsub = () => void;
export type ErrCode = "permission-denied" | "unavailable" | "other";

export interface Backend {
  watchCollection(path: string, cb: (docs: DocSnap[], fromCache: boolean) => void, err: (code: ErrCode) => void): Unsub;
  watchDoc(path: string, cb: (data: Record<string, any> | null, fromCache: boolean) => void, err: (code: ErrCode) => void): Unsub;
  set(path: string, data: Record<string, any>): Promise<void>;
  update(path: string, data: Record<string, any>): Promise<void>;
  remove(path: string): Promise<void>;
  add(collection: string, data: Record<string, any>): Promise<string>;
}

export interface AuthUser { uid: string; name: string; photo: string | null }

export interface AuthProvider {
  onChange(cb: (u: AuthUser | null) => void): Unsub;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export interface Connection { backend: Backend; auth: AuthProvider }
