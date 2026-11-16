// Domain content per language, ported unchanged from import-hub.html.
// STEPS: [phase, title, detail, who, papers].
export type Lang = "ro" | "en" | "fr";
export const STEPS: Record<Lang, string[][]> = {
 "ro": [
  [
   "Înainte de cumpărare",
   "Verifică VIN-ul și echiparea",
   "Poziția 4 din VIN: E = Progressiv, F = Technik. Confirmă ACC și camera 360°.",
   "Tu",
   "Anunț, VIN"
  ],
  [
   "Înainte de cumpărare",
   "Carfax și rechemări",
   "Accidente, leasing („Bail”), goluri în service, rechemări deschise (22V753 cuzineți, 21V947 apă la gateway).",
   "Tu",
   "Carfax"
  ],
  [
   "Înainte de cumpărare",
   "RDPRM: fără datorii pe mașină",
   "Căutare după VIN pe rdprm.gouv.qc.ca, câțiva dolari. Obligatoriu la vânzător privat.",
   "Tu / unchiul",
   "Rezultat RDPRM"
  ],
  [
   "Înainte de cumpărare",
   "Inspecție independentă",
   "La un garaj ales de voi. Cere citire de erori cu VCDS/OBDeleven, nu doar OBD generic.",
   "Unchiul",
   "Raport inspecție"
  ],
  [
   "Cumpărare",
   "Negociere și confirmarea exportului",
   "Dealer: confirmă că acceptă export fără QST (formular ATAC cu „EXPORTATION”). Privat: confirmă predarea la transportator.",
   "Tu",
   "Email confirmare"
  ],
  [
   "Cumpărare",
   "Contract pe numele cumpărătorului",
   "Preț real, VIN, km, adrese și telefoane, clauză de predare la transportator. Dacă e pe numele socrului, totul pe numele lui.",
   "Tu",
   "Contract, pașaport"
  ],
  [
   "Cumpărare",
   "Plată prin transfer bancar",
   "Din contul cumpărătorului din contract. Dovada plății trebuie la vama din Olanda.",
   "Cumpărătorul",
   "Confirmare transfer"
  ],
  [
   "Canada",
   "Rezervare la Viamar",
   "Formulare de booking, contract de export, asigurare. Plată în avans.",
   "Tu",
   "Copie certificat, contract"
  ],
  [
   "Canada",
   "Predare la GO Transport",
   "180 Graveline, Saint-Laurent. Sună cu 24 h înainte. Dealerul sau vânzătorul predă direct.",
   "Vânzătorul",
   "Bon de predare"
  ],
  [
   "Canada",
   "Vânzătorul privat anulează înmatricularea",
   "Formularul SAAQ pentru vehicul vândut în afara Québecului, cu copia contractului, după plecare.",
   "Vânzătorul",
   "B/L, contract"
  ],
  [
   "Transport",
   "Încărcare și plecare",
   "Viamar trimite conosamentul (B/L) și factura. Plătește suprataxele apărute.",
   "Viamar",
   "B/L, factură"
  ],
  [
   "Europa",
   "Marlog: vămuire",
   "Trimite B/L, certificat, contract, factura de transport, pașaport și formularul de împuternicire.",
   "Tu",
   "Pachet Marlog"
  ],
  [
   "Europa",
   "Plată Marlog, taxă vamală și TVA",
   "Doar după plată se eliberează mașina. 5 zile gratuite, apoi 15 €/zi.",
   "Cumpărătorul",
   "Factură Marlog"
  ],
  [
   "România",
   "Transport Roosendaal → România",
   "Platformă auto. Șoferul ridică după ce actele sunt gata.",
   "Transportator",
   "Acte vamale"
  ],
  [
   "România",
   "RAR și înmatriculare",
   "Cu certificatul original, contractul și actele de vamă.",
   "Cumpărătorul",
   "Dosar complet"
  ],
  [
   "Înainte de cumpărare",
   "Verifică vânzătorul",
   "Actul de identitate al vânzătorului și certificatul de înmatriculare SAAQ trebuie să fie pe același nume. Întâlnire într-un loc sigur, ideal la bancă.",
   "Tu / unchiul",
   "Act identitate, certificat"
  ],
  [
   "Cumpărare",
   "Actele de la dealer pentru export",
   "Factura finală (verifică taxele aplicate), formularul ATAC cu „EXPORTATION” și copia certificatului de înmatriculare pentru Viamar.",
   "Dealerul",
   "Factură, ATAC, certificat"
  ]
 ],
 "en": [
  [
   "Before buying",
   "Check the VIN and trim",
   "VIN position 4: E = Progressiv, F = Technik. Confirm ACC and the 360° camera.",
   "You",
   "Listing, VIN"
  ],
  [
   "Before buying",
   "Carfax and recalls",
   "Accidents, lease (“Bail”), service gaps, open recalls (22V753 rod bearings, 21V947 gateway water).",
   "You",
   "Carfax"
  ],
  [
   "Before buying",
   "RDPRM: no lien on the car",
   "Search by VIN on rdprm.gouv.qc.ca, a few dollars. A must with a private seller.",
   "You / uncle",
   "RDPRM result"
  ],
  [
   "Before buying",
   "Independent inspection",
   "At a garage you choose. Ask for a VCDS/OBDeleven scan, not just a generic OBD read.",
   "Uncle",
   "Inspection report"
  ],
  [
   "Buying",
   "Negotiate and confirm export",
   "Dealer: confirm export without QST (ATAC form marked “EXPORTATION”). Private: confirm hand-over to the carrier.",
   "You",
   "Confirmation email"
  ],
  [
   "Buying",
   "Contract in the buyer's name",
   "Real price, VIN, km, addresses and phones, hand-over-to-carrier clause. If it's the father-in-law's, everything in his name.",
   "You",
   "Contract, passport"
  ],
  [
   "Buying",
   "Pay by bank transfer",
   "From the account of the buyer named in the contract. Dutch customs needs the proof of payment.",
   "Buyer",
   "Transfer confirmation"
  ],
  [
   "Canada",
   "Book with Viamar",
   "Booking forms, export contract, insurance. Prepaid.",
   "You",
   "Registration copy, contract"
  ],
  [
   "Canada",
   "Drop-off at GO Transport",
   "180 Graveline, Saint-Laurent. Call 24 h ahead. The dealer or seller hands the car over directly.",
   "Seller",
   "Drop-off receipt"
  ],
  [
   "Canada",
   "Private seller cancels the registration",
   "SAAQ form for a vehicle sold outside Québec, with the contract copy, after departure.",
   "Seller",
   "B/L, contract"
  ],
  [
   "Shipping",
   "Loading and departure",
   "Viamar sends the bill of lading (B/L) and invoice. Pay any surcharges that come up.",
   "Viamar",
   "B/L, invoice"
  ],
  [
   "Europe",
   "Marlog: customs clearance",
   "Send B/L, registration, contract, freight invoice, passport and the authorisation form.",
   "You",
   "Marlog pack"
  ],
  [
   "Europe",
   "Pay Marlog, duty and VAT",
   "The car is released only after payment. 5 free days, then €15/day.",
   "Buyer",
   "Marlog invoice"
  ],
  [
   "Romania",
   "Truck Roosendaal → Romania",
   "Car carrier. The driver collects once the papers are ready.",
   "Carrier",
   "Customs papers"
  ],
  [
   "Romania",
   "RAR and registration",
   "With the original registration, the contract and the customs papers.",
   "Buyer",
   "Full file"
  ],
  [
   "Before buying",
   "Check the seller",
   "The seller's ID and the SAAQ registration certificate must be in the same name. Meet somewhere safe, ideally at a bank.",
   "You / uncle",
   "ID, registration"
  ],
  [
   "Buying",
   "Papers from the dealer for export",
   "Final invoice (check which taxes were applied), the ATAC form with “EXPORTATION” and a copy of the registration certificate for Viamar.",
   "Dealer",
   "Invoice, ATAC, registration"
  ]
 ],
 "fr": [
  [
   "Avant l'achat",
   "Vérifier le NIV et la version",
   "4e position du NIV : E = Progressiv, F = Technik. Confirmer l'ACC et la caméra 360°.",
   "Vous",
   "Annonce, NIV"
  ],
  [
   "Avant l'achat",
   "Carfax et rappels",
   "Accidents, location (« Bail »), trous d'entretien, rappels ouverts (22V753 coussinets, 21V947 eau sur le gateway).",
   "Vous",
   "Carfax"
  ],
  [
   "Avant l'achat",
   "RDPRM : aucune dette sur le véhicule",
   "Recherche par NIV sur rdprm.gouv.qc.ca, quelques dollars. Indispensable avec un particulier.",
   "Vous / l'oncle",
   "Résultat RDPRM"
  ],
  [
   "Avant l'achat",
   "Inspection indépendante",
   "Dans un garage de votre choix. Demandez un balayage VCDS/OBDeleven, pas seulement un lecteur OBD générique.",
   "L'oncle",
   "Rapport d'inspection"
  ],
  [
   "Achat",
   "Négocier et confirmer l'exportation",
   "Concessionnaire : exportation sans TVQ (formulaire ATAC « EXPORTATION »). Particulier : remise au transporteur.",
   "Vous",
   "Courriel de confirmation"
  ],
  [
   "Achat",
   "Contrat au nom de l'acheteur",
   "Prix réel, NIV, km, adresses et téléphones, clause de remise au transporteur. Si c'est au nom du beau-père, tout à son nom.",
   "Vous",
   "Contrat, passeport"
  ],
  [
   "Achat",
   "Paiement par virement",
   "Depuis le compte de l'acheteur du contrat. La douane néerlandaise demande la preuve de paiement.",
   "Acheteur",
   "Confirmation de virement"
  ],
  [
   "Canada",
   "Réservation chez Viamar",
   "Formulaires, contrat d'exportation, assurance. Payé d'avance.",
   "Vous",
   "Copie du certificat, contrat"
  ],
  [
   "Canada",
   "Dépôt chez GO Transport",
   "180 Graveline, Saint-Laurent. Appeler 24 h avant. Le concessionnaire ou le vendeur remet le véhicule directement.",
   "Vendeur",
   "Reçu de dépôt"
  ],
  [
   "Canada",
   "Le particulier annule l'immatriculation",
   "Formulaire SAAQ pour véhicule vendu hors Québec, avec copie du contrat, après le départ.",
   "Vendeur",
   "B/L, contrat"
  ],
  [
   "Transport",
   "Chargement et départ",
   "Viamar envoie le connaissement (B/L) et la facture. Payer les suppléments éventuels.",
   "Viamar",
   "B/L, facture"
  ],
  [
   "Europe",
   "Marlog : dédouanement",
   "Envoyer B/L, certificat, contrat, facture de fret, passeport et le formulaire d'autorisation.",
   "Vous",
   "Dossier Marlog"
  ],
  [
   "Europe",
   "Payer Marlog, droits et TVA",
   "Le véhicule n'est libéré qu'après paiement. 5 jours gratuits, puis 15 €/jour.",
   "Acheteur",
   "Facture Marlog"
  ],
  [
   "Roumanie",
   "Camion Roosendaal → Roumanie",
   "Porte-voitures. Le chauffeur récupère quand les papiers sont prêts.",
   "Transporteur",
   "Papiers de douane"
  ],
  [
   "Roumanie",
   "RAR et immatriculation",
   "Avec le certificat original, le contrat et les papiers de douane.",
   "Acheteur",
   "Dossier complet"
  ],
  [
   "Avant l'achat",
   "Vérifier le vendeur",
   "La pièce d'identité du vendeur et le certificat d'immatriculation SAAQ doivent être au même nom. Rencontre dans un lieu sûr, idéalement à la banque.",
   "Vous / l'oncle",
   "Pièce d'identité, certificat"
  ],
  [
   "Achat",
   "Documents du concessionnaire pour l'export",
   "Facture finale (vérifiez les taxes appliquées), le formulaire ATAC avec « EXPORTATION » et une copie du certificat d'immatriculation pour Viamar.",
   "Concessionnaire",
   "Facture, ATAC, certificat"
  ]
 ]
};
export const DOCS: Record<Lang, [string, string[]][]> = {
 "ro": [
  [
   "Viamar (Canada)",
   [
    "Copie a certificatului de înmatriculare (ține loc de titlu în Québec)",
    "Copie a contractului sau confirmare de plată integrală, fără leasing sau credit",
    "Datele complete ale expeditorului și destinatarului",
    "Lista obiectelor din mașină, dacă e cazul",
    "Originalele nu sunt necesare"
   ]
  ],
  [
   "Marlog (Olanda)",
   [
    "Conosamentul (B/L)",
    "Certificatul / titlul mașinii",
    "Contractul de vânzare (bill of sale)",
    "Factura de transport maritim",
    "Copie pașaport și adresa",
    "Formularul lor de împuternicire pentru persoane fizice (art. 5.1 gol)"
   ]
  ],
  [
   "SAAQ (vânzătorul privat)",
   [
    "Formularul de anulare pentru vehicul vândut în afara Québecului",
    "Copie a contractului de vânzare",
    "Certificatul de înmatriculare",
    "Rezultatul căutării RDPRM (fără datorii)",
    "Copie a actului de identitate al vânzătorului"
   ]
  ],
  [
   "Dealer din Québec",
   [
    "Pașaport sau act de identitate al cumpărătorului (unii cer permisul, cu adresă)",
    "Datele transportatorului (Viamar / GO Transport)",
    "Formular ATAC cu scutire de QST „EXPORTATION”",
    "Factura finală a dealerului (cu taxele aplicate)",
    "Raportul Carfax de la dealer"
   ]
  ],
  [
   "RAR / România",
   [
    "Certificatul original din Québec",
    "Contractul",
    "Actele vamale de la Marlog",
    "Ce s-a cerut la Q7 e reperul cel mai sigur"
   ]
  ]
 ],
 "en": [
  [
   "Viamar (Canada)",
   [
    "Copy of the registration certificate (counts as the title in Québec)",
    "Copy of the bill of sale or full-payment letter, no lease or loan",
    "Full shipper and consignee details",
    "Packing list of items inside, if any",
    "Originals are not needed"
   ]
  ],
  [
   "Marlog (Netherlands)",
   [
    "Bill of lading (B/L)",
    "Car's registration / title",
    "Bill of sale",
    "Ocean freight invoice",
    "Passport copy and address",
    "Their authorisation form for private persons (leave art. 5.1 blank)"
   ]
  ],
  [
   "SAAQ (private seller)",
   [
    "Cancellation form for a vehicle sold outside Québec",
    "Copy of the bill of sale",
    "Registration certificate",
    "RDPRM search result (no liens)",
    "Copy of the seller's ID"
   ]
  ],
  [
   "Québec dealer",
   [
    "Buyer's passport or ID (some ask for a licence with address)",
    "Carrier details (Viamar / GO Transport)",
    "ATAC form with QST exemption “EXPORTATION”",
    "Dealer's final invoice (showing the taxes applied)",
    "Carfax report from the dealer"
   ]
  ],
  [
   "RAR / Romania",
   [
    "Original Québec registration",
    "The contract",
    "Customs papers from Marlog",
    "What was asked for the Q7 is the safest guide"
   ]
  ]
 ],
 "fr": [
  [
   "Viamar (Canada)",
   [
    "Copie du certificat d'immatriculation (tient lieu de titre au Québec)",
    "Copie du contrat ou lettre de paiement complet, sans location ni prêt",
    "Coordonnées complètes de l'expéditeur et du destinataire",
    "Liste des objets dans le véhicule, s'il y a lieu",
    "Les originaux ne sont pas nécessaires"
   ]
  ],
  [
   "Marlog (Pays-Bas)",
   [
    "Connaissement (B/L)",
    "Certificat / titre du véhicule",
    "Contrat de vente",
    "Facture de fret maritime",
    "Copie du passeport et adresse",
    "Leur formulaire d'autorisation pour particuliers (art. 5.1 vide)"
   ]
  ],
  [
   "SAAQ (vendeur particulier)",
   [
    "Formulaire d'annulation pour véhicule vendu hors Québec",
    "Copie du contrat de vente",
    "Certificat d'immatriculation",
    "Résultat de la recherche RDPRM (aucune dette)",
    "Copie de la pièce d'identité du vendeur"
   ]
  ],
  [
   "Concessionnaire du Québec",
   [
    "Passeport ou pièce d'identité de l'acheteur (certains demandent le permis avec adresse)",
    "Coordonnées du transporteur (Viamar / GO Transport)",
    "Formulaire ATAC avec exemption de TVQ « EXPORTATION »",
    "Facture finale du concessionnaire (taxes appliquées visibles)",
    "Rapport Carfax du concessionnaire"
   ]
  ],
  [
   "RAR / Roumanie",
   [
    "Certificat original du Québec",
    "Le contrat",
    "Papiers de douane de Marlog",
    "Ce qui a été demandé pour le Q7 est le meilleur repère"
   ]
  ]
 ]
} as any;
export const LINKS: [string, string][] = [
 [
  "Revenu Québec – Exports of property (zero-rated)",
  "https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/special-cases-gsthst-and-qst/exports-outside-canada-and-shipping-outside-quebec/exports-and-shipping-of-property/"
 ],
 [
  "Revenu Québec – Used vehicle from an individual",
  "https://www.revenuquebec.ca/en/citizens/consumption-taxes/gst-and-qst/transport-and-road-vehicles/road-vehicles/purchase-of-a-road-vehicle/purchase-of-a-used-road-vehicle-from-an-individual/"
 ],
 [
  "SAAQ – Annuler l'immatriculation d'un véhicule émigré",
  "https://saaq.gouv.qc.ca/immatriculation/annuler-immatriculation-vehicule-emigre"
 ],
 [
  "SAAQ – Formulaire 4815A (EN)",
  "https://saaq.gouv.qc.ca/blob/saaq/documents/formulaires/cancellation-registration-vehicule-licensed-sold-outside-quebec.pdf"
 ],
 [
  "SAAQ – Transférer un véhicule entre particuliers",
  "https://saaq.gouv.qc.ca/blob/saaq/documents/publications/transferer-vehicule-entre-particulier.pdf"
 ],
 [
  "RDPRM – Registre des droits",
  "https://www.rdprm.gouv.qc.ca/"
 ],
 [
  "CBSA – Memorandum D20-1-1 (exports)",
  "https://www.cbsa-asfc.gc.ca/publications/dm-md/d20/d20-1-1-eng.pdf"
 ],
 [
  "NHTSA – Recall 21V947 (gateway water)",
  "https://vehicleflaws.com/recall/21V947000"
 ]
] as any;

// ---- Dealer vs private seller (owner's request). Indices are stable: ticks are stored as s<i> / d<g>_<i>. ----
export type Seller = "dealer" | "private";
/** Steps that apply to one kind of seller only (the rest apply to both). 15 and 16 were added for this. */
const STEP_ONLY: Record<number, Seller> = { 9: "private", 15: "private", 16: "dealer" };
/** Document groups that apply to one kind of seller only: 2 = SAAQ (private seller), 3 = Québec dealer. */
const DOC_ONLY: Record<number, Seller> = { 2: "private", 3: "dealer" };
/** Wording that differs by seller: [lang][step] = { dealer, private } descriptions (from PROJECT_BRIEF §3–4). */
const STEP_TEXT: Record<Lang, Record<number, Record<Seller, string>>> = {
  ro: {
    1: { dealer: "Cere raportul Carfax de la dealer (de obicei îl dă gratuit). Caută accidente, leasing („Bail”), goluri în service, rechemări deschise (22V753, 21V947).", private: "Cumpără tu raportul Carfax după VIN (carfax.ca). Caută accidente, leasing („Bail”), goluri în service, rechemări deschise (22V753, 21V947)." },
    2: { dealer: "Dealerul garantează că mașina e fără datorii; o căutare RDPRM după VIN (câțiva dolari) e totuși o verificare ieftină.", private: "Obligatoriu: căutare după VIN pe rdprm.gouv.qc.ca (câțiva dolari). Fără credit sau leasing pe mașină, altfel Viamar n-o ia." },
    4: { dealer: "Confirmă în scris vânzarea pentru export: dealerul predă mașina direct transportatorului și trece scutirea „EXPORTATION” pe formularul ATAC, ca să nu plătești QST (ideal nici GST).", private: "Confirmă că vânzătorul predă mașina la transportator. Între persoane fizice nu se plătește QST dacă înmatricularea nu se transferă (mașina pleacă din Canada)." },
    5: { dealer: "Contractul / factura dealerului pe numele cumpărătorului: preț, VIN, km, mențiunea de export și scutirea de taxe.", private: "Contract scris, semnat de amândoi: nume, adrese, telefoane, acte de identitate, VIN, km, preț real, dată, „vândut ca atare” și clauza de predare la transportator. Plata cu cardul singură nu ajunge." },
    6: { dealer: "Transfer bancar către dealer, din contul cumpărătorului din contract. Dovada plății trebuie la vama din Olanda.", private: "Transfer bancar din contul cumpărătorului din contract, nu numerar. Dovada plății trebuie la vama din Olanda." },
    8: { dealer: "Dealerul duce mașina la GO Transport (180 Graveline, Saint-Laurent). E condiția pentru vânzarea fără taxe.", private: "Vânzătorul duce mașina la GO Transport (180 Graveline, Saint-Laurent) sau Viamar o ridică (~185 USD în Montréal). Sună cu 24 h înainte." },
  },
  en: {
    1: { dealer: "Ask the dealer for the Carfax report (usually free). Look for accidents, lease (“Bail”), service gaps, open recalls (22V753, 21V947).", private: "Buy the Carfax report yourself by VIN (carfax.ca). Look for accidents, lease (“Bail”), service gaps, open recalls (22V753, 21V947)." },
    2: { dealer: "The dealer guarantees the car is free of liens; an RDPRM search by VIN (a few dollars) is still a cheap check.", private: "Required: search by VIN at rdprm.gouv.qc.ca (a few dollars). No loan or lease on the car, or Viamar won't take it." },
    4: { dealer: "Confirm in writing that it's an export sale: the dealer hands the car straight to the carrier and enters the “EXPORTATION” exemption on the ATAC form, so you don't pay QST (ideally not GST either).", private: "Confirm the seller will hand the car to the carrier. Between individuals there's no QST if the registration isn't transferred (the car leaves Canada)." },
    5: { dealer: "Dealer's contract / invoice in the buyer's name: price, VIN, km, the export mention and the tax exemption.", private: "Written contract signed by both: names, addresses, phones, IDs, VIN, km, real price, date, “sold as is” and the hand-over-to-carrier clause. A card payment alone isn't enough." },
    6: { dealer: "Bank transfer to the dealer from the account of the buyer named in the contract. Dutch customs need the proof of payment.", private: "Bank transfer from the account of the buyer named in the contract, no cash. Dutch customs need the proof of payment." },
    8: { dealer: "The dealer takes the car to GO Transport (180 Graveline, Saint-Laurent). That's the condition for the tax-free sale.", private: "The seller takes the car to GO Transport (180 Graveline, Saint-Laurent), or Viamar picks it up (~185 USD in Montréal). Call 24 h ahead." },
  },
  fr: {
    1: { dealer: "Demandez le rapport Carfax au concessionnaire (souvent gratuit). Cherchez accidents, location (« Bail »), trous dans l'entretien, rappels ouverts (22V753, 21V947).", private: "Achetez vous-même le rapport Carfax par NIV (carfax.ca). Cherchez accidents, location (« Bail »), trous dans l'entretien, rappels ouverts (22V753, 21V947)." },
    2: { dealer: "Le concessionnaire garantit que le véhicule est libre de dettes ; une recherche RDPRM par NIV (quelques dollars) reste une vérification peu coûteuse.", private: "Obligatoire : recherche par NIV sur rdprm.gouv.qc.ca (quelques dollars). Aucun prêt ni location sur le véhicule, sinon Viamar le refuse." },
    4: { dealer: "Confirmez par écrit la vente pour l'export : le concessionnaire remet le véhicule directement au transporteur et inscrit l'exemption « EXPORTATION » sur le formulaire ATAC, pour ne pas payer la TVQ (idéalement ni la TPS).", private: "Confirmez que le vendeur remet le véhicule au transporteur. Entre particuliers, pas de TVQ si l'immatriculation n'est pas transférée (le véhicule quitte le Canada)." },
    5: { dealer: "Contrat / facture du concessionnaire au nom de l'acheteur : prix, NIV, km, la mention d'export et l'exemption de taxes.", private: "Contrat écrit signé par les deux : noms, adresses, téléphones, pièces d'identité, NIV, km, prix réel, date, « vendu tel quel » et la clause de remise au transporteur. Un paiement par carte seul ne suffit pas." },
    6: { dealer: "Virement au concessionnaire depuis le compte de l'acheteur nommé au contrat. La douane néerlandaise demande la preuve de paiement.", private: "Virement depuis le compte de l'acheteur nommé au contrat, pas d'argent comptant. La douane néerlandaise demande la preuve de paiement." },
    8: { dealer: "Le concessionnaire apporte le véhicule chez GO Transport (180 Graveline, Saint-Laurent). C'est la condition de la vente sans taxes.", private: "Le vendeur apporte le véhicule chez GO Transport (180 Graveline, Saint-Laurent) ou Viamar le ramasse (~185 USD à Montréal). Appelez 24 h avant." },
  },
};
export const sellerOf = (c?: { sellerType?: string } | null): Seller => (c?.sellerType === "private" ? "private" : "dealer");

export interface StepView { i: number; key: string; phase: string; title: string; desc: string; who: string; docs: string }
/** The steps for one kind of seller, in phase order (new steps slot into their phase), with the right wording. */
export function stepsFor(lang: Lang, seller: Seller): StepView[] {
  const all = STEPS[lang];
  const phases: string[] = [];
  all.forEach(s => { if (!phases.includes(s[0])) phases.push(s[0]); });
  return all.map((s, i) => ({ i, key: "s" + i, phase: s[0], title: s[1], desc: STEP_TEXT[lang][i]?.[seller] || s[2], who: s[3], docs: s[4] }))
    .filter(v => !STEP_ONLY[v.i] || STEP_ONLY[v.i] === seller)
    .sort((a, b) => phases.indexOf(a.phase) - phases.indexOf(b.phase) || a.i - b.i);
}
/** Document groups for one kind of seller: [{ gi, title, items: [{ key, text }] }]. */
export function docsFor(lang: Lang, seller: Seller) {
  return DOCS[lang].map((g, gi) => ({ gi, title: g[0], items: g[1].map((text, i) => ({ key: `d${gi}_${i}`, text })) }))
    .filter(g => !DOC_ONLY[g.gi] || DOC_ONLY[g.gi] === seller);
}
