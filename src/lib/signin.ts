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
