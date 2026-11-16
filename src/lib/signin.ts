import { signIn } from "../data/store";
import { t } from "../i18n";
import { toast } from "../ui";

/** Starts Google sign-in and explains common Firebase setup problems in the viewer's language. */
export async function signInWithHelp() {
  try { await signIn(); } catch (e: any) {
    const code = String(e?.code || "");
    const A = t.value.auth;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
    if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") toast(A.notEnabled);
    else if (code === "auth/unauthorized-domain") toast(A.badDomain);
    else if (code === "auth/popup-blocked") toast(A.popup);
    else toast(A.error + (code ? ` (${code})` : ""));
  }
}

/** Explains an email sign-in / sign-up / reset error; returns the message (shown under the form). */
export function emailError(e: any): string {
  const code = String(e?.code || ""), G = t.value.gate;
  if (code === "auth/email-already-in-use") return G.eUsed;
  if (code === "auth/invalid-email" || code === "auth/missing-email") return G.eEmail;
  if (code === "auth/weak-password" || code === "auth/missing-password") return G.eWeak;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-login-credentials") return G.eWrong;
  if (code === "auth/too-many-requests") return G.eMany;
  if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") return G.eOff;
  if (code === "auth/network-request-failed") return G.eNet;
  return t.value.auth.error + (code ? ` (${code})` : "");
}
