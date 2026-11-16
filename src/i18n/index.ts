import { computed, ref, watch } from "vue";
import { BASE } from "./strings";
import type { Lang } from "./content";

// v3 strings (website shell, sign-in, hero). Every key exists in all three languages.
const V3 = {
  ro: {
    brand: { line1: "pentru mașini", line2: "din Québec în România" },
    langL: "Limba",
    auth: {
      signIn: "Intră cu Google", signOut: "Ieși din cont", account: "Contul tău", copyCode: "Copiază codul",
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
      cars: "{n} mașini active", contacts: "{n} contacte",
      rate: "1 CAD = {v} €", searchOn: "Căutare pornită · {f}", searchOff: "Căutarea e oprită",
    },
    find: {
      h: "Caută mașini", lead: "Scrie ce cauți și alege filtrele. Găsești imediat mașinile salvate care se potrivesc și linkuri cu rezultatele de pe fiecare site de anunțuri.",
      ph: "Ex.: Audi Q5 Technik", go: "Caută", filters: "Filtre",
      sitesH: "Rezultate pe site-urile de anunțuri", sitesNote: "Fiecare link deschide rezultatele cu filtrele tale. Unde site-ul nu acceptă filtre în link, căutăm prin Google, doar pe acel site.",
      direct: "filtre aplicate", viaGoogle: "prin Google", open: "Vezi rezultatele",
      foundH: "Mașinile salvate care se potrivesc", foundNone: "Nicio mașină salvată nu se potrivește. Deschide rezultatele de pe site-uri și adaugă ce îți place.",
      results: "{n} rezultate", addFound: "Adaugă o mașină găsită",
      whyNot: "Anunțurile nu pot apărea direct aici: site-urile nu permit altor pagini să le citească. Căutarea zilnică le aduce singură în lista ta.",
      dailyH: "Căutarea zilnică automată", dailyLead: "O sarcină programată rulează cu aceste filtre și adaugă singură mașinile noi în lista ta.", saveDaily: "Salvează pentru căutarea zilnică",
    },
    noCars: "Încă nu ai nicio mașină salvată. Pașii și actele se bifează pentru fiecare mașină în parte, așa că adaugă întâi una.",
    story: {
      eyebrow: "De la Québec în România", h: "Mașina potrivită, adusă acasă fără surprize",
      lead: "Urmărește anunțurile, compară prețul final în România și treci pas cu pas prin cumpărare, transport, vamă și înmatriculare.",
      sWatched: "mașini urmărite", sCheapest: "cea mai ieftină ajunsă în RO", sDays: "zile ușă la ușă, la Q7", sSteps: "pași, de la anunț la RAR",
      carsEyebrow: "Anunțuri", journeyEyebrow: "Drumul", journeyH: "Drumul unei mașini, în {n} etape", journeyLead: "Fiecare etapă are pașii ei, cu cine se ocupă și ce acte trebuie.",
      stepsN: "{n} pași", seeSteps: "Vezi toți pașii",
      costEyebrow: "Costuri", costH: "Cât costă de fapt, ajunsă în România", costLead: "Prețul din Canada e doar începutul: transport, asigurare, vamă, TVA, Marlog, camion și RAR.",
      costEx: "{p} CAD cu GST devin", openCalc: "Deschide calculatorul",
      ctaH: "Ai văzut o mașină bună?", ctaLead: "Caută pe toate site-urile din Québec cu filtrele tale sau lipește VIN-ul ca s-o adaugi.", ctaGo: "Caută anunțuri",
    },
    foot: { line: "Costuri orientative. Verifică întotdeauna oferta reală și cursul zilei.", data: "Datele familiei", sources: "Surse oficiale" },
  },
  en: {
    brand: { line1: "for cars", line2: "from Québec to Romania" },
    langL: "Language",
    auth: {
      signIn: "Sign in with Google", signOut: "Sign out", account: "Your account", copyCode: "Copy code",
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
      cars: "{n} active cars", contacts: "{n} contacts",
      rate: "1 CAD = {v} €", searchOn: "Search on · {f}", searchOff: "Search is off",
    },
    find: {
      h: "Find cars", lead: "Type what you're looking for and set the filters. You instantly get the saved cars that match and links to the results on each listing site.",
      ph: "e.g. Audi Q5 Technik", go: "Search", filters: "Filters",
      sitesH: "Results on the listing sites", sitesNote: "Each link opens the results with your filters. Where a site doesn't accept filters in the link, we search it through Google.",
      direct: "filters applied", viaGoogle: "via Google", open: "See results",
      foundH: "Saved cars that match", foundNone: "No saved car matches. Open the results on the listing sites and add the ones you like.",
      results: "{n} results", addFound: "Add a car you found",
      whyNot: "Listings can't appear here directly: the sites don't let other pages read them. The daily search brings them into your list by itself.",
      dailyH: "Daily automatic search", dailyLead: "A scheduled task runs with these filters and adds new cars to your list by itself.", saveDaily: "Save for the daily search",
    },
    noCars: "You don't have any cars saved yet. Steps and papers are ticked per car, so add one first.",
    story: {
      eyebrow: "From Québec to Romania", h: "The right car, brought home without surprises",
      lead: "Follow listings, compare the final price in Romania, and go step by step through buying, shipping, customs and registration.",
      sWatched: "cars watched", sCheapest: "cheapest landed in RO", sDays: "days door to door for the Q7", sSteps: "steps from listing to RAR",
      carsEyebrow: "Listings", journeyEyebrow: "The journey", journeyH: "A car's journey in {n} stages", journeyLead: "Each stage has its own steps, who handles them, and the papers needed.",
      stepsN: "{n} steps", seeSteps: "See every step",
      costEyebrow: "Costs", costH: "What it really costs, landed in Romania", costLead: "The Canadian price is only the start: shipping, insurance, duty, VAT, Marlog, the truck and RAR.",
      costEx: "{p} CAD with GST becomes", openCalc: "Open the calculator",
      ctaH: "Spotted a good car?", ctaLead: "Search every Québec site with your filters, or paste the VIN to add it.", ctaGo: "Search listings",
    },
    foot: { line: "Costs are estimates. Always check the real quote and today's rate.", data: "Family data", sources: "Official sources" },
  },
  fr: {
    brand: { line1: "pour les véhicules", line2: "du Québec vers la Roumanie" },
    langL: "Langue",
    auth: {
      signIn: "Se connecter avec Google", signOut: "Se déconnecter", account: "Votre compte", copyCode: "Copier le code",
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
      cars: "{n} véhicules actifs", contacts: "{n} contacts",
      rate: "1 $ CA = {v} €", searchOn: "Recherche activée · {f}", searchOff: "Recherche désactivée",
    },
    find: {
      h: "Trouver un véhicule", lead: "Écrivez ce que vous cherchez et réglez les filtres. Vous voyez tout de suite les véhicules enregistrés qui correspondent et des liens vers les résultats de chaque site d'annonces.",
      ph: "Ex. : Audi Q5 Technik", go: "Rechercher", filters: "Filtres",
      sitesH: "Résultats sur les sites d'annonces", sitesNote: "Chaque lien ouvre les résultats avec vos filtres. Quand un site n'accepte pas les filtres dans le lien, on le cherche via Google.",
      direct: "filtres appliqués", viaGoogle: "via Google", open: "Voir les résultats",
      foundH: "Véhicules enregistrés qui correspondent", foundNone: "Aucun véhicule enregistré ne correspond. Ouvrez les résultats des sites d'annonces et ajoutez ceux qui vous plaisent.",
      results: "{n} résultats", addFound: "Ajouter un véhicule trouvé",
      whyNot: "Les annonces ne peuvent pas s'afficher ici directement : les sites ne laissent pas d'autres pages les lire. La recherche quotidienne les ajoute d'elle-même à votre liste.",
      dailyH: "Recherche automatique quotidienne", dailyLead: "Une tâche planifiée s'exécute avec ces filtres et ajoute d'elle-même les nouveaux véhicules à votre liste.", saveDaily: "Enregistrer pour la recherche quotidienne",
    },
    noCars: "Aucun véhicule enregistré pour l'instant. Les étapes et les papiers se cochent par véhicule : ajoutez-en d'abord un.",
    story: {
      eyebrow: "Du Québec à la Roumanie", h: "Le bon véhicule, ramené sans surprises",
      lead: "Suivez les annonces, comparez le prix final en Roumanie et avancez étape par étape : achat, transport, douane et immatriculation.",
      sWatched: "véhicules suivis", sCheapest: "le moins cher livré en RO", sDays: "jours porte à porte pour le Q7", sSteps: "étapes de l'annonce au RAR",
      carsEyebrow: "Annonces", journeyEyebrow: "Le trajet", journeyH: "Le trajet d'un véhicule en {n} étapes", journeyLead: "Chaque étape a ses tâches, qui s'en occupe et les papiers nécessaires.",
      stepsN: "{n} tâches", seeSteps: "Voir toutes les étapes",
      costEyebrow: "Coûts", costH: "Ce que ça coûte vraiment, livré en Roumanie", costLead: "Le prix au Canada n'est qu'un début : transport, assurance, droits, TVA, Marlog, camion et RAR.",
      costEx: "{p} $ CA avec TPS deviennent", openCalc: "Ouvrir le calculateur",
      ctaH: "Vous avez repéré un bon véhicule ?", ctaLead: "Cherchez sur tous les sites du Québec avec vos filtres, ou collez le NIV pour l'ajouter.", ctaGo: "Chercher des annonces",
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
