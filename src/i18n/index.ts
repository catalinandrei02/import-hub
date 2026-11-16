import { computed, ref, watch } from "vue";
import { BASE } from "./strings";
import type { Lang } from "./content";

// v3 strings (website shell, sign-in, hero). Every key exists in all three languages.
const V3 = {
  ro: {
    brand: { line1: "pentru mașini", line2: "din Québec în România" },
    langL: "Limba",
    auth: {
      signIn: "Intră cu Google", signOut: "Ieși", copyCode: "Copiază codul",
      signedOut: "Intră cu contul Google ca să vezi și să modifici mașinile familiei.",
      noAccess: "Contul tău nu e încă pe lista familiei. Trimite proprietarului acest cod ca să te adauge:",
      notConfigured: "Site-ul nu e încă legat de baza de date. Vezi doar conținutul fix; mașinile, contactele și setările apar după conectare.",
      error: "Conectarea n-a mers. Încearcă din nou.",
      notEnabled: "Conectarea cu Google nu e încă pornită în Firebase (Authentication → Sign-in method → Google).",
      badDomain: "Adresa acestui site nu e încă permisă în Firebase (Authentication → Settings → Authorized domains).",
      popup: "Browserul a blocat fereastra de conectare. Permite ferestrele pop-up pentru acest site și încearcă din nou.",
    },
    hero: { vinPh: "Lipește un VIN de 17 caractere", vinL: "VIN", priceL: "Prețul mașinii în CAD" },
    nav: { prev: "Înapoi", next: "Înainte", main: "Secțiuni" },
    chip: {
      cars: "{n} mașini active", contacts: "{n} contacte", tpl: "{n} mesaje · FR / EN",
      rate: "1 CAD = {v} €", searchOn: "Căutare pornită · {f}", searchOff: "Căutarea e oprită",
    },
    foot: { line: "Costuri orientative. Verifică întotdeauna oferta reală și cursul zilei.", data: "Datele familiei", sources: "Surse oficiale" },
  },
  en: {
    brand: { line1: "for cars", line2: "from Québec to Romania" },
    langL: "Language",
    auth: {
      signIn: "Sign in with Google", signOut: "Sign out", copyCode: "Copy code",
      signedOut: "Sign in with Google to see and change the family's cars.",
      noAccess: "Your account isn't on the family list yet. Send the owner this code so they can add you:",
      notConfigured: "The site isn't connected to the database yet. You see the fixed content only; cars, contacts and settings appear once it's connected.",
      error: "Sign-in didn't work. Try again.",
      notEnabled: "Google sign-in isn't turned on in Firebase yet (Authentication → Sign-in method → Google).",
      badDomain: "This site's address isn't allowed in Firebase yet (Authentication → Settings → Authorized domains).",
      popup: "The browser blocked the sign-in window. Allow pop-ups for this site and try again.",
    },
    hero: { vinPh: "Paste a 17-character VIN", vinL: "VIN", priceL: "Car price in CAD" },
    nav: { prev: "Previous", next: "Next", main: "Sections" },
    chip: {
      cars: "{n} active cars", contacts: "{n} contacts", tpl: "{n} messages · FR / EN",
      rate: "1 CAD = {v} €", searchOn: "Search on · {f}", searchOff: "Search is off",
    },
    foot: { line: "Costs are estimates. Always check the real quote and today's rate.", data: "Family data", sources: "Official sources" },
  },
  fr: {
    brand: { line1: "pour les véhicules", line2: "du Québec vers la Roumanie" },
    langL: "Langue",
    auth: {
      signIn: "Se connecter avec Google", signOut: "Se déconnecter", copyCode: "Copier le code",
      signedOut: "Connectez-vous avec Google pour voir et modifier les véhicules de la famille.",
      noAccess: "Votre compte n'est pas encore sur la liste de la famille. Envoyez ce code au propriétaire pour qu'il vous ajoute :",
      notConfigured: "Le site n'est pas encore relié à la base de données. Vous voyez seulement le contenu fixe ; les véhicules, contacts et réglages apparaîtront une fois connecté.",
      error: "La connexion n'a pas fonctionné. Réessayez.",
      notEnabled: "La connexion Google n'est pas encore activée dans Firebase (Authentication → Sign-in method → Google).",
      badDomain: "L'adresse de ce site n'est pas encore autorisée dans Firebase (Authentication → Settings → Authorized domains).",
      popup: "Le navigateur a bloqué la fenêtre de connexion. Autorisez les fenêtres pop-up pour ce site et réessayez.",
    },
    hero: { vinPh: "Collez un NIV de 17 caractères", vinL: "NIV", priceL: "Prix du véhicule en $ CA" },
    nav: { prev: "Précédent", next: "Suivant", main: "Sections" },
    chip: {
      cars: "{n} véhicules actifs", contacts: "{n} contacts", tpl: "{n} messages · FR / EN",
      rate: "1 $ CA = {v} €", searchOn: "Recherche activée · {f}", searchOff: "Recherche désactivée",
    },
    foot: { line: "Coûts indicatifs. Vérifiez toujours l'offre réelle et le taux du jour.", data: "Données de la famille", sources: "Sources officielles" },
  },
};

const DICT = { ro: { ...BASE.ro, ...V3.ro }, en: { ...BASE.en, ...V3.en }, fr: { ...BASE.fr, ...V3.fr } };
export type Strings = (typeof DICT)["ro"];

function stored(): Lang {
  try { const l = localStorage.getItem("hub-lang"); if (l === "ro" || l === "en" || l === "fr") return l; } catch { /* private mode */ }
  return "ro";
}

export const lang = ref<Lang>(stored());
export const t = computed<Strings>(() => DICT[lang.value] as Strings);
export const LOCALE: Record<Lang, string> = { ro: "ro-RO", en: "en-CA", fr: "fr-CA" };
watch(lang, l => { try { localStorage.setItem("hub-lang", l); } catch { /* ignore */ } document.documentElement.lang = l; }, { immediate: true });

/** "{n} cars" → "3 cars" */
export const fill = (s: string, o: Record<string, string | number>) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? String(o[k]) : m));
export type { Lang };
