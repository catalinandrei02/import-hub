// Domain content per language, ported unchanged from import-hub.html.
// STEPS: [phase, title, detail, who, papers]. TPL: message templates (FR/EN only).
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
    "Certificatul de înmatriculare"
   ]
  ],
  [
   "Dealer din Québec",
   [
    "Pașaport sau act de identitate al cumpărătorului (unii cer permisul, cu adresă)",
    "Datele transportatorului (Viamar / GO Transport)",
    "Formular ATAC cu scutire de QST „EXPORTATION”"
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
    "Registration certificate"
   ]
  ],
  [
   "Québec dealer",
   [
    "Buyer's passport or ID (some ask for a licence with address)",
    "Carrier details (Viamar / GO Transport)",
    "ATAC form with QST exemption “EXPORTATION”"
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
    "Certificat d'immatriculation"
   ]
  ],
  [
   "Concessionnaire du Québec",
   [
    "Passeport ou pièce d'identité de l'acheteur (certains demandent le permis avec adresse)",
    "Coordonnées du transporteur (Viamar / GO Transport)",
    "Formulaire ATAC avec exemption de TVQ « EXPORTATION »"
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
export interface Template { id: string; l: Record<Lang, string>; fr: string; en: string }
export const TPL: Template[] = [
 {
  "id": "first",
  "l": {
   "ro": "Primul contact cu un dealer",
   "en": "First contact with a dealer",
   "fr": "Premier contact avec un concessionnaire"
  },
  "fr": "Bonjour,\n\nJe suis intéressé par le [MODÈLE] [ANNÉE] (stock [STOCK], NIV [NIV]). Pourriez-vous m'envoyer le rapport Carfax et me confirmer que le véhicule est toujours disponible ?\n\nJ'achète comme particulier, pour ma famille. Le véhicule sera exporté vers l'Europe par une compagnie de transport que j'engage.\n\nMerci,\n[NOM]",
  "en": "Hello,\n\nI'm interested in the [YEAR] [MODEL] (stock [STOCK], VIN [VIN]). Could you send me the Carfax report and confirm the car is still available?\n\nI'm buying as a private individual, for my family. The car will be exported to Europe by a shipping company I hire.\n\nThank you,\n[NAME]"
 },
 {
  "id": "offer",
  "l": {
   "ro": "Ofertă + explicația exportului",
   "en": "Offer + export explanation",
   "fr": "Offre + explication de l'exportation"
  },
  "fr": "Bonjour [PRÉNOM],\n\nNous sommes toujours très intéressés par le [MODÈLE] (stock [STOCK]).\n\nNous ne sommes pas des commerçants : c'est une auto pour notre famille en Roumanie. Vous n'auriez qu'à déposer le véhicule à l'entrepôt de la compagnie de transport que nous avons engagée, Viamar Scilla (GO Transport, 180 Graveline, Saint-Laurent). Elle s'occupe de l'exportation et fournit tous les documents.\n\nSelon Revenu Québec, la TPS et la TVQ ne s'appliquent pas quand le vendeur remet le véhicule à un transporteur qui l'expédie hors du Canada :\nhttps://www.revenuquebec.ca/fr/entreprises/taxes/tpstvh-et-tvq/situations-particulieres-liees-a-la-tpstvh-et-a-la-tvq/exportations-hors-du-canada-ou-expeditions-hors-du-quebec/exportation-ou-expedition-de-biens/\n\nNous payons en entier par virement. Notre budget est de [PRIX] $, véhicule livré chez Viamar.\n\nMerci beaucoup,\n[NOM]",
  "en": "Hi [FIRST NAME],\n\nWe're still very interested in the [MODEL] (stock [STOCK]).\n\nWe're not dealers: it's a car for our family in Romania. You would only need to drop the car off at the warehouse of the shipping company we hired, Viamar Scilla (GO Transport, 180 Graveline, Saint-Laurent). They handle the export and provide all the documents.\n\nAccording to Revenu Québec, GST and QST don't apply when the seller hands the car over to a carrier that ships it outside Canada:\nhttps://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/special-cases-gsthst-and-qst/exports-outside-canada-and-shipping-outside-quebec/exports-and-shipping-of-property/\n\nWe pay in full by bank transfer. Our budget is $[PRICE], with the car delivered to Viamar.\n\nThank you so much,\n[NAME]"
 },
 {
  "id": "private",
  "l": {
   "ro": "Întrebări pentru vânzător privat",
   "en": "Questions for a private seller",
   "fr": "Questions pour un particulier"
  },
  "fr": "Bonjour,\n\nVotre [MODÈLE] m'intéresse. Avant de nous voir, quelques questions :\n\n1. Le véhicule est-il à votre nom, sans location ni prêt ?\n2. Avez-vous les factures d'entretien ?\n3. Accepteriez-vous une inspection dans un garage de mon choix ?\n4. Le véhicule sera exporté : seriez-vous d'accord pour le remettre directement à mon transporteur à Saint-Laurent, puis annuler l'immatriculation à la SAAQ ?\n\nMerci,\n[NOM]",
  "en": "Hello,\n\nI'm interested in your [MODEL]. Before we meet, a few questions:\n\n1. Is the car in your name, with no lease or loan?\n2. Do you have the service invoices?\n3. Would you agree to an inspection at a garage of my choice?\n4. The car will be exported: would you hand it over directly to my carrier in Saint-Laurent, then cancel the registration with the SAAQ?\n\nThank you,\n[NAME]"
 },
 {
  "id": "viamar",
  "l": {
   "ro": "Rezervare la Viamar",
   "en": "Booking with Viamar",
   "fr": "Réservation chez Viamar"
  },
  "fr": "Hello Bruno,\n\nI'd like to book another shared container from Montreal to Rotterdam for a [YEAR] [MODEL], VIN [VIN] (gas powered).\n\nThe buyer is [BUYER NAME]. The car will be dropped off at GO Transport by [SELLER]. Could you send me the booking forms and the insurance form for a value of [VALUE] CAD?\n\nThank you,\n[NAME]",
  "en": "Hello Bruno,\n\nI'd like to book another shared container from Montreal to Rotterdam for a [YEAR] [MODEL], VIN [VIN] (gas powered).\n\nThe buyer is [BUYER NAME]. The car will be dropped off at GO Transport by [SELLER]. Could you send me the booking forms and the insurance form for a value of [VALUE] CAD?\n\nThank you,\n[NAME]"
 },
 {
  "id": "marlog",
  "l": {
   "ro": "Documente pentru Marlog",
   "en": "Papers for Marlog",
   "fr": "Documents pour Marlog"
  },
  "fr": "Hello Martyna,\n\nThe [YEAR] [MODEL], VIN [VIN], is on its way to Rotterdam (booking [BOOKING], container [CONTAINER]). Please find attached: bill of lading, registration, bill of sale, ocean freight invoice, passport and your signed authorisation form.\n\nCould you give me an estimated release date so I can arrange the truck to Romania?\n\nThank you,\n[NAME]",
  "en": "Hello Martyna,\n\nThe [YEAR] [MODEL], VIN [VIN], is on its way to Rotterdam (booking [BOOKING], container [CONTAINER]). Please find attached: bill of lading, registration, bill of sale, ocean freight invoice, passport and your signed authorisation form.\n\nCould you give me an estimated release date so I can arrange the truck to Romania?\n\nThank you,\n[NAME]"
 },
 {
  "id": "saaq",
  "l": {
   "ro": "Reamintire SAAQ pentru vânzător",
   "en": "SAAQ reminder for the seller",
   "fr": "Rappel SAAQ pour le vendeur"
  },
  "fr": "Bonjour [PRÉNOM],\n\nLe véhicule est parti vers l'Europe. Voici le connaissement (B/L) et une copie du contrat. Vous pouvez maintenant annuler l'immatriculation avec le formulaire de la SAAQ pour un véhicule vendu hors du Québec :\nhttps://saaq.gouv.qc.ca/immatriculation/annuler-immatriculation-vehicule-emigre\n\nMerci encore,\n[NOM]",
  "en": "Hi [FIRST NAME],\n\nThe car has left for Europe. Here are the bill of lading (B/L) and a copy of the contract. You can now cancel the registration with the SAAQ form for a vehicle sold outside Québec:\nhttps://saaq.gouv.qc.ca/immatriculation/annuler-immatriculation-vehicule-emigre\n\nThanks again,\n[NAME]"
 }
];
