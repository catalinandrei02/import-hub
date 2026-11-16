import { computed, ref, watch } from "vue";
import { pluralForm } from "../lib/plural";
import { BASE } from "./strings";
import type { Lang } from "./content";

// v3 strings (website shell, sign-in, hero). Every key exists in all three languages.
const V3 = {
  ro: {
    brand: { line1: "pentru mașini", line2: "din Québec în România" },
    langL: "Limba",
    equip: {
      h: "Dotări", none: "Lista de dotări apare după ce anunțul e citit (din link, cu extensia, sau cu butonul ＋ Import Hub).",
      more: "Arată toate cele {n}", less: "Arată mai puține", hist: "Istoric {s}", damaged: "Daune raportate", accidents: "Mai multe accidente raportate",
      scrapped: "Declarată casată", imported: "Importată", exported: "Exportată", clean: "Fără daune sau accidente raportate",
    },
    prices: {
      h: "Verificarea zilnică", running: "Verific prețurile din anunțuri… {d} din {n}",
      details: "Detalii", searching: "Caut mașini noi pe CarGurus…", adding: "Adaug mașinile noi găsite… {d} din {n}", search: "Căutare CarGurus: {d} · rezultate: {t} · mașini noi: {n}",
      newCar: "nouă", blocked: "CarGurus a cerut o verificare anti-robot. Deschide cargurus.ca în Chrome, treci de verificare, apoi apasă Verifică acum.",
      updateExt: "Ca să caute singur mașini noi, extensia Import Hub trebuie actualizată la 1.3: descarc-o din nou, dezarhiveaz-o peste cea veche și apasă ↻ în chrome://extensions.",
      noModel: "Căutarea automată pe CarGurus știe deocamdată doar Audi Q5 și Q5 Sportback.", last: "Ultima verificare: {d}, de {n}",
      summary: "anunțuri citite: {k} · prețuri schimbate: {c} · dispărute: {g}", errors: "necitite: {n}", never: "Prețurile n-au fost verificate încă.",
      now: "Verifică acum", none: "Nimic de verificat", gone: "Anunț dispărut?", doneToast: "Gata: mașini noi {n}, prețuri schimbate {c}, anunțuri dispărute {g}.",
      needExt: "Prețurile se verifică singure o dată pe zi când cineva deschide site-ul în Chrome cu extensia Import Hub.",
    },
    carfax: {
      h: "Carfax", none: "Încă nu e niciun raport Carfax. Adaugă linkul sau încarcă PDF-ul.", linkL: "Linkul raportului Carfax", addLink: "Adaugă linkul",
      upload: "Încarcă PDF", uploading: "Se încarcă… {p}%", max: "PDF, maxim 10 MB.", opening: "Se deschide…", del: "Șterge", sure: "Sigur? Apasă din nou",
      by: "adăugat de {n}, {d}", added: "Adăugat.", badLink: "Linkul trebuie să înceapă cu https://", notPdf: "Alege un fișier PDF.", tooBig: "PDF-ul e prea mare (maxim 10 MB).", chip: "Carfax",
    },
    admin: {
      menu: "Administrare", h: "Administrare", lead: "Cine are acces la site, cererile noi și cât folosește fiecare site-ul. Doar adminii văd pagina asta.",
      reqH: "Cereri de acces", reqNone: "Nicio cerere nouă.", approve: "Aprobă", reject: "Respinge",
      memH: "Membri", admin: "Admin", member: "Membru", you: "tu", makeAdmin: "Fă admin", makeMember: "Fă membru", remove: "Scoate", sure: "Sigur? Apasă din nou",
      code: "Cod", views: "Mașini deschise", last: "Ultima dată", never: "niciodată",
      addH: "Adaugă după cod", addLead: "Dacă cineva ți-a trimis codul de pe pagina de intrare.", addCode: "Codul persoanei", addName: "Prenume", add: "Adaugă", added: "Adăugat.", badCode: "Codul pare greșit (20–40 de litere și cifre).",
      topH: "Cele mai deschise mașini", none: "Încă nimic.", only: "Doar adminii văd pagina asta.",
    },
    views: {
      h: "Vizualizări", one: "{n} vizualizare", few: "{n} vizualizări", many: "{n} de vizualizări",
      how: "Se numără de fiecare dată când cineva din familie deschide mașina.", none: "Încă n-a deschis-o nimeni.", you: "tu", last: "ultima dată",
    },
    theme: { label: "Temă", auto: "Automat", light: "Zi", dark: "Noapte", next: "Temă: {m}. Apasă ca s-o schimbi." },
    gate: {
      lead: "Site-ul privat al familiei pentru mașinile aduse din Québec în România. Intră cu Google sau cu email ca să continui.",
      checking: "Se verifică contul…", none: "Site-ul nu e încă legat de baza de date, așa că nu se poate intra.", other: "Intră cu alt cont",
      or: "sau cu email", tabIn: "Intră", tabUp: "Creează cont", name: "Prenume", email: "Email", pass: "Parolă", passH: "Cel puțin 6 caractere.",
      submitIn: "Intră", submitUp: "Creează contul", forgot: "Ai uitat parola?", resetSent: "Dacă există un cont cu acest email, ți-am trimis un link pentru o parolă nouă.",
      upNote: "După ce creezi contul, proprietarul primește cererea ta și te aprobă.", needName: "Scrie prenumele, ca familia să știe cine ești.",
      eUsed: "Există deja un cont cu acest email. Intră în el sau folosește „Ai uitat parola?”.", eEmail: "Emailul nu pare corect.", eWeak: "Parola trebuie să aibă cel puțin 6 caractere.",
      eWrong: "Email sau parolă greșită.", eMany: "Prea multe încercări. Mai încearcă peste câteva minute.", eNet: "Nu e conexiune la internet.",
      eOff: "Conturile cu email nu sunt încă pornite în Firebase (Authentication → Sign-in method → Email/Password).",
      private: "Doar membrii familiei au acces.", sent: "Am trimis o cerere proprietarului. Pagina se deschide singură după ce te aprobă, nu trebuie să faci nimic.", sending: "Se trimite cererea de acces…",
    },
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
    hero: { vinPh: "Lipește linkul anunțului sau un VIN", vinL: "Link sau VIN", priceL: "Prețul mașinii în CAD" },
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
    imp: {
      h: "Adaugă direct din anunț", lead: "Trage butonul în bara de favorite din Chrome. Pe pagina unui anunț (CarGurus, AutoTrader, Kijiji…) apasă-l: se deschide Import Hub cu prețul, kilometrii, anul, VIN-ul, vânzătorul și toate pozele deja completate. Dacă mașina e deja salvată, îi adaugă doar pozele.",
      dragOnly: "Trage butonul în bara de favorite; aici nu face nimic.", got: "Date preluate din anunț. Verifică-le înainte să salvezi.",
      linkL: "Linkul anunțului", linkH: "Lipește linkul și apasă Completează: prețul, kilometrii, anul, VIN-ul, vânzătorul și pozele se completează singure.", fill: "Completează",
      filling: "Citesc anunțul în Chrome…", filled: "Am completat din anunț. Verifică datele înainte să salvezi.", fillFail: "N-am putut citi anunțul. Completează de mână sau apasă butonul ＋ Import Hub pe pagina anunțului.",
      needExt: "Ca să se completeze singur din link, instalează o dată extensia Import Hub în Chrome.", dup: "Mașina asta e deja salvată.", openDup: "Deschide-o",
      added: "Am adăugat {n} poze la mașina deja salvată.", same: "Mașina e deja salvată, cu toate pozele din anunț.",
      photos: "Poze", photosH: "Linkuri către poze, câte unul pe rând. Prima e poza principală. Le văd doar membrii familiei.",
    },
    show: {
      label: "Pozele mașinii", prev: "Poza anterioară", next: "Poza următoare", pick: "Poza {n}", play: "Pornește prezentarea", pause: "Oprește prezentarea",
      fetching: "Iau pozele din anunț…", got: "Am luat {n} poze din anunț.", failed: "N-am putut citi anunțul. Deschide-l în Chrome și apasă butonul ＋ Import Hub din bara de favorite.",
      refresh: "Ia din nou pozele din anunț", none: "Încă nu sunt poze.", noUrl: "Adaugă linkul anunțului ca să se poată lua pozele.",
      extH: "Pozele se pot lua singure", ext: "Instalează extensia Import Hub în Chrome. Când deschizi o mașină fără poze, extensia deschide linkul anunțului în Chrome-ul tău (cu VPN) și ia pozele.",
      extSteps: ["Descarcă extensia și dezarhiveaz-o.", "Deschide chrome://extensions și pornește „Developer mode”.", "Apasă „Load unpacked” și alege dosarul import-hub-extension.", "Reîncarcă pagina asta."],
      extDl: "Descarcă extensia",
    },
    foot: { line: "Costuri orientative. Verifică întotdeauna oferta reală și cursul zilei.", data: "Datele familiei", sources: "Surse oficiale" },
  },
  en: {
    brand: { line1: "for cars", line2: "from Québec to Romania" },
    langL: "Language",
    equip: {
      h: "Equipment", none: "The equipment list appears once the listing is read (from the link, with the extension, or the ＋ Import Hub bookmark).",
      more: "Show all {n}", less: "Show fewer", hist: "{s} history", damaged: "Damage reported", accidents: "Multiple accidents reported",
      scrapped: "Reported scrapped", imported: "Imported", exported: "Exported", clean: "No damage or accidents reported",
    },
    prices: {
      h: "Daily check", running: "Checking prices on the listings… {d} of {n}",
      details: "Details", searching: "Searching CarGurus for new cars…", adding: "Adding the new cars found… {d} of {n}", search: "CarGurus search: {d} · results: {t} · new cars: {n}",
      newCar: "new", blocked: "CarGurus asked for an anti-bot check. Open cargurus.ca in Chrome, pass the check, then press Check now.",
      updateExt: "To search for new cars on its own, the Import Hub extension needs version 1.3: download it again, unzip it over the old one and press ↻ in chrome://extensions.",
      noModel: "Automatic CarGurus search only knows the Audi Q5 and Q5 Sportback for now.", last: "Last check: {d}, by {n}",
      summary: "listings read: {k} · prices changed: {c} · gone: {g}", errors: "unread: {n}", never: "Prices haven't been checked yet.",
      now: "Check now", none: "Nothing to check", gone: "Listing gone?", doneToast: "Done: {n} new cars, {c} prices changed, {g} listings gone.",
      needExt: "Prices are checked by themselves once a day when someone opens the site in Chrome with the Import Hub extension.",
    },
    carfax: {
      h: "Carfax", none: "No Carfax report yet. Add the link or upload the PDF.", linkL: "Carfax report link", addLink: "Add link",
      upload: "Upload PDF", uploading: "Uploading… {p}%", max: "PDF, up to 10 MB.", opening: "Opening…", del: "Delete", sure: "Sure? Press again",
      by: "added by {n}, {d}", added: "Added.", badLink: "The link must start with https://", notPdf: "Choose a PDF file.", tooBig: "The PDF is too large (10 MB max).", chip: "Carfax",
    },
    admin: {
      menu: "Admin", h: "Admin", lead: "Who has access, new requests and how much each person uses the site. Only admins see this page.",
      reqH: "Access requests", reqNone: "No new requests.", approve: "Approve", reject: "Reject",
      memH: "Members", admin: "Admin", member: "Member", you: "you", makeAdmin: "Make admin", makeMember: "Make member", remove: "Remove", sure: "Sure? Press again",
      code: "Code", views: "Cars opened", last: "Last seen", never: "never",
      addH: "Add by code", addLead: "If someone sent you the code from the sign-in page.", addCode: "Their code", addName: "First name", add: "Add", added: "Added.", badCode: "That code looks wrong (20–40 letters and digits).",
      topH: "Most opened cars", none: "Nothing yet.", only: "Only admins can see this page.",
    },
    views: {
      h: "Views", one: "{n} view", few: "{n} views", many: "{n} views",
      how: "Counted each time someone in the family opens this car.", none: "Nobody has opened it yet.", you: "you", last: "last",
    },
    theme: { label: "Theme", auto: "Automatic", light: "Day", dark: "Night", next: "Theme: {m}. Press to change it." },
    gate: {
      lead: "The family's private site for cars brought from Québec to Romania. Sign in with Google or with email to continue.",
      checking: "Checking your account…", none: "The site isn't connected to its database yet, so nobody can sign in.", other: "Use another account",
      or: "or with email", tabIn: "Sign in", tabUp: "Create account", name: "First name", email: "Email", pass: "Password", passH: "At least 6 characters.",
      submitIn: "Sign in", submitUp: "Create the account", forgot: "Forgot your password?", resetSent: "If there's an account with this email, we've sent it a link to set a new password.",
      upNote: "Once you create the account, the owner gets your request and approves you.", needName: "Write your first name so the family knows who you are.",
      eUsed: "There's already an account with this email. Sign in, or use “Forgot your password?”.", eEmail: "That email doesn't look right.", eWeak: "The password needs at least 6 characters.",
      eWrong: "Wrong email or password.", eMany: "Too many attempts. Try again in a few minutes.", eNet: "No internet connection.",
      eOff: "Email accounts aren't switched on in Firebase yet (Authentication → Sign-in method → Email/Password).",
      private: "Only family members have access.", sent: "A request was sent to the owner. This page opens by itself once you're approved; there's nothing else to do.", sending: "Sending your access request…",
    },
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
    hero: { vinPh: "Paste the listing link or a VIN", vinL: "Link or VIN", priceL: "Car price in CAD" },
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
    imp: {
      h: "Add straight from a listing", lead: "Drag the button to Chrome's bookmarks bar. On a listing page (CarGurus, AutoTrader, Kijiji…) press it: Import Hub opens with the price, km, year, VIN, seller and every photo already filled in. If the car is already saved, it just adds the photos.",
      dragOnly: "Drag the button to the bookmarks bar; it does nothing here.", got: "Details taken from the listing. Check them before saving.",
      linkL: "Listing link", linkH: "Paste the link and press Fill in: price, km, year, VIN, seller and photos fill in on their own.", fill: "Fill in",
      filling: "Reading the listing in Chrome…", filled: "Filled in from the listing. Check the details before saving.", fillFail: "Couldn't read the listing. Fill it in by hand, or press the ＋ Import Hub bookmark on the listing page.",
      needExt: "To fill in from a link on its own, install the Import Hub extension in Chrome once.", dup: "This car is already saved.", openDup: "Open it",
      added: "Added {n} photos to the car you already saved.", same: "This car is already saved, with all the listing's photos.",
      photos: "Photos", photosH: "Photo links, one per line. The first is the main photo. Only family members can see them.",
    },
    show: {
      label: "Car photos", prev: "Previous photo", next: "Next photo", pick: "Photo {n}", play: "Play slideshow", pause: "Pause slideshow",
      fetching: "Getting the photos from the listing…", got: "Got {n} photos from the listing.", failed: "Couldn't read the listing. Open it in Chrome and press the ＋ Import Hub bookmark.",
      refresh: "Get the photos from the listing again", none: "No photos yet.", noUrl: "Add the listing link so the photos can be fetched.",
      extH: "Photos can come in on their own", ext: "Install the Import Hub extension in Chrome. When you open a car with no photos, it opens the listing link in your own Chrome (VPN included) and takes the photos.",
      extSteps: ["Download the extension and unzip it.", "Open chrome://extensions and turn on “Developer mode”.", "Press “Load unpacked” and pick the import-hub-extension folder.", "Reload this page."],
      extDl: "Download the extension",
    },
    foot: { line: "Costs are estimates. Always check the real quote and today's rate.", data: "Family data", sources: "Official sources" },
  },
  fr: {
    brand: { line1: "pour les véhicules", line2: "du Québec vers la Roumanie" },
    langL: "Langue",
    equip: {
      h: "Équipement", none: "La liste d'équipement apparaît une fois l'annonce lue (depuis le lien, avec l'extension ou le favori ＋ Import Hub).",
      more: "Afficher les {n}", less: "Afficher moins", hist: "Historique {s}", damaged: "Dommages signalés", accidents: "Plusieurs accidents signalés",
      scrapped: "Déclaré à la casse", imported: "Importé", exported: "Exporté", clean: "Aucun dommage ni accident signalé",
    },
    prices: {
      h: "Vérification quotidienne", running: "Vérification des prix dans les annonces… {d} sur {n}",
      details: "Détails", searching: "Recherche de nouveaux véhicules sur CarGurus…", adding: "Ajout des nouveaux véhicules trouvés… {d} sur {n}", search: "Recherche CarGurus : {d} · résultats : {t} · nouveaux véhicules : {n}",
      newCar: "nouveau", blocked: "CarGurus a demandé une vérification anti-robot. Ouvrez cargurus.ca dans Chrome, passez la vérification, puis appuyez sur Vérifier maintenant.",
      updateExt: "Pour chercher seule de nouveaux véhicules, l'extension Import Hub doit être en version 1.3 : téléchargez-la à nouveau, décompressez-la par-dessus l'ancienne et appuyez sur ↻ dans chrome://extensions.",
      noModel: "La recherche automatique sur CarGurus ne connaît pour l'instant que l'Audi Q5 et le Q5 Sportback.", last: "Dernière vérification : {d}, par {n}",
      summary: "annonces lues : {k} · prix modifiés : {c} · disparues : {g}", errors: "non lues : {n}", never: "Les prix n'ont pas encore été vérifiés.",
      now: "Vérifier maintenant", none: "Rien à vérifier", gone: "Annonce disparue ?", doneToast: "Terminé : nouveaux véhicules {n}, prix modifiés {c}, annonces disparues {g}.",
      needExt: "Les prix sont vérifiés automatiquement une fois par jour quand quelqu'un ouvre le site dans Chrome avec l'extension Import Hub.",
    },
    carfax: {
      h: "Carfax", none: "Pas encore de rapport Carfax. Ajoutez le lien ou téléversez le PDF.", linkL: "Lien du rapport Carfax", addLink: "Ajouter le lien",
      upload: "Téléverser le PDF", uploading: "Téléversement… {p} %", max: "PDF, 10 Mo maximum.", opening: "Ouverture…", del: "Supprimer", sure: "Sûr ? Appuyez à nouveau",
      by: "ajouté par {n}, {d}", added: "Ajouté.", badLink: "Le lien doit commencer par https://", notPdf: "Choisissez un fichier PDF.", tooBig: "Le PDF est trop volumineux (10 Mo maximum).", chip: "Carfax",
    },
    admin: {
      menu: "Administration", h: "Administration", lead: "Qui a accès au site, les nouvelles demandes et l'utilisation de chacun. Seuls les administrateurs voient cette page.",
      reqH: "Demandes d'accès", reqNone: "Aucune nouvelle demande.", approve: "Approuver", reject: "Refuser",
      memH: "Membres", admin: "Administrateur", member: "Membre", you: "vous", makeAdmin: "Rendre administrateur", makeMember: "Rendre membre", remove: "Retirer", sure: "Sûr ? Appuyez à nouveau",
      code: "Code", views: "Véhicules ouverts", last: "Dernière visite", never: "jamais",
      addH: "Ajouter par code", addLead: "Si quelqu'un vous a envoyé le code de la page de connexion.", addCode: "Son code", addName: "Prénom", add: "Ajouter", added: "Ajouté.", badCode: "Ce code semble incorrect (20 à 40 lettres et chiffres).",
      topH: "Véhicules les plus ouverts", none: "Rien pour l'instant.", only: "Seuls les administrateurs peuvent voir cette page.",
    },
    views: {
      h: "Consultations", one: "{n} consultation", few: "{n} consultations", many: "{n} consultations",
      how: "Comptées chaque fois qu'un membre de la famille ouvre ce véhicule.", none: "Personne ne l'a encore ouvert.", you: "vous", last: "dernière fois",
    },
    theme: { label: "Thème", auto: "Automatique", light: "Jour", dark: "Nuit", next: "Thème : {m}. Appuyez pour le changer." },
    gate: {
      lead: "Le site privé de la famille pour les véhicules amenés du Québec en Roumanie. Connectez-vous avec Google ou par courriel pour continuer.",
      checking: "Vérification du compte…", none: "Le site n'est pas encore relié à sa base de données ; personne ne peut se connecter.", other: "Utiliser un autre compte",
      or: "ou avec un courriel", tabIn: "Se connecter", tabUp: "Créer un compte", name: "Prénom", email: "Courriel", pass: "Mot de passe", passH: "Au moins 6 caractères.",
      submitIn: "Se connecter", submitUp: "Créer le compte", forgot: "Mot de passe oublié ?", resetSent: "S'il existe un compte avec ce courriel, nous lui avons envoyé un lien pour un nouveau mot de passe.",
      upNote: "Une fois le compte créé, le propriétaire reçoit votre demande et vous approuve.", needName: "Écrivez votre prénom pour que la famille sache qui vous êtes.",
      eUsed: "Un compte existe déjà avec ce courriel. Connectez-vous ou utilisez « Mot de passe oublié ? ».", eEmail: "Ce courriel ne semble pas correct.", eWeak: "Le mot de passe doit comporter au moins 6 caractères.",
      eWrong: "Courriel ou mot de passe incorrect.", eMany: "Trop de tentatives. Réessayez dans quelques minutes.", eNet: "Pas de connexion Internet.",
      eOff: "Les comptes par courriel ne sont pas encore activés dans Firebase (Authentication → Sign-in method → Email/Password).",
      private: "Seuls les membres de la famille y ont accès.", sent: "Une demande a été envoyée au propriétaire. Cette page s'ouvrira d'elle-même une fois approuvée ; vous n'avez rien d'autre à faire.", sending: "Envoi de la demande d'accès…",
    },
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
    hero: { vinPh: "Collez le lien de l'annonce ou un NIV", vinL: "Lien ou NIV", priceL: "Prix du véhicule en $ CA" },
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
    imp: {
      h: "Ajouter directement depuis une annonce", lead: "Glissez le bouton dans la barre de favoris de Chrome. Sur la page d'une annonce (CarGurus, AutoTrader, Kijiji…), appuyez dessus : Import Hub s'ouvre avec le prix, le kilométrage, l'année, le NIV, le vendeur et toutes les photos déjà remplis. Si le véhicule est déjà enregistré, il ajoute seulement les photos.",
      dragOnly: "Glissez le bouton dans la barre de favoris ; ici, il ne fait rien.", got: "Données reprises de l'annonce. Vérifiez-les avant d'enregistrer.",
      linkL: "Lien de l'annonce", linkH: "Collez le lien et appuyez sur Remplir : prix, kilométrage, année, NIV, vendeur et photos se remplissent tout seuls.", fill: "Remplir",
      filling: "Lecture de l'annonce dans Chrome…", filled: "Rempli depuis l'annonce. Vérifiez les données avant d'enregistrer.", fillFail: "Impossible de lire l'annonce. Remplissez à la main ou appuyez sur le favori ＋ Import Hub sur la page de l'annonce.",
      needExt: "Pour remplir tout seul depuis un lien, installez une fois l'extension Import Hub dans Chrome.", dup: "Ce véhicule est déjà enregistré.", openDup: "L'ouvrir",
      added: "{n} photos ajoutées au véhicule déjà enregistré.", same: "Ce véhicule est déjà enregistré, avec toutes les photos de l'annonce.",
      photos: "Photos", photosH: "Liens vers les photos, un par ligne. La première est la photo principale. Seuls les membres de la famille les voient.",
    },
    show: {
      label: "Photos du véhicule", prev: "Photo précédente", next: "Photo suivante", pick: "Photo {n}", play: "Lancer le diaporama", pause: "Mettre en pause",
      fetching: "Récupération des photos de l'annonce…", got: "{n} photos récupérées de l'annonce.", failed: "Impossible de lire l'annonce. Ouvrez-la dans Chrome et appuyez sur le favori ＋ Import Hub.",
      refresh: "Récupérer à nouveau les photos de l'annonce", none: "Pas encore de photos.", noUrl: "Ajoutez le lien de l'annonce pour récupérer les photos.",
      extH: "Les photos peuvent arriver toutes seules", ext: "Installez l'extension Import Hub dans Chrome. Quand vous ouvrez un véhicule sans photos, elle ouvre le lien de l'annonce dans votre Chrome (VPN compris) et récupère les photos.",
      extSteps: ["Téléchargez l'extension et décompressez-la.", "Ouvrez chrome://extensions et activez le « Mode développeur ».", "Appuyez sur « Charger l'extension non empaquetée » et choisissez le dossier import-hub-extension.", "Rechargez cette page."],
      extDl: "Télécharger l'extension",
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

/** "1 vizualizare / 5 vizualizări / 20 de vizualizări" (RO), "1 view / 5 views" (EN), "1 consultation" (FR). */
export function countLabel(n: number, f: { one: string; few: string; many: string }): string {
  return fill(f[pluralForm(n, lang.value)], { n });
}
