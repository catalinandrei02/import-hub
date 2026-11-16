/// <reference types="vite/client" />
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_FIREBASE_CONFIG?: string;
  readonly VITE_DATA?: "mock" | "firebase";
}
declare module "*.svg?raw" { const s: string; export default s; }
