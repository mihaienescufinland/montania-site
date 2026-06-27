/* =====================================================================
   MONTANIA — DATE EDITABILE / EDITABLE DATA
   ---------------------------------------------------------------------
   Acesta este SINGURUL fișier pe care trebuie să-l modifici pentru a
   actualiza prețuri și disponibilitate (ca pe Booking.com).
   This is the ONLY file you need to edit to update prices & availability.

   • Datele "booked" sunt zilele OCUPATE (nopți), format AAAA-LL-ZZ.
   • "price" este prețul pe noapte, în RON.
   ===================================================================== */

const SITE = {
  brand: "Montania",

  // Data fotografiei de pe prima pagină (poza cu flori a vilei).
  // Folosită pentru a afișa "când a fost făcută poza" sub imagine. Format AAAA-LL-ZZ.
  heroPhoto: { date: "2026-06-27" },

  // Orizont de preț: pentru nopțile ÎNCEPÂND cu această dată, prețurile nu sunt
  // încă publicate. Calendarul rămâne deschis, dar invităm oaspetele să ceară
  // o ofertă (nu spunem că nu avem locuri). Format AAAA-LL-ZZ.
  booking: { pricingUntil: "2026-09-01" },

  // Cloudflare Web Analytics (gratuit, fără cookie-uri). Lasă gol pentru a dezactiva.
  // Token-ul îl iei din: Cloudflare → Analytics & Logs → Web Analytics → Add a site →
  // copiezi valoarea "token" din snippet (data-cf-beacon='{"token":"XXXX"}').
  analytics: { cfToken: "" },

  contact: {
    phone: "0722 427 636",
    // WhatsApp: număr internațional fără + și fără spații
    whatsapp: "40722427636",
    email: "mihai.enescu@gmail.com",
    addressRo: "Str. Aosta nr. 5, Sinaia, jud. Prahova",
    addressEn: "5 Aosta St., Sinaia, Prahova county",
    mapsUrl: "https://maps.google.com/?q=Pensiunea+Tui+Str.+Aosta+5+Sinaia",
    bookingUrl: "https://www.booking.com/hotel/ro/pensiunea-tui.html",
    bookingScore: "9.7",
    bookingReviews: 71
  },

  // ====================  RECENZII BOOKING.COM  =======================
  // Recenzii preluate de pe Booking.com. Editează / adaugă liber.
  // rating: număr (10, 9 …); cats: subnote opționale (Booking).
  seedReviews: [
    {
      author: "Miriam", country: "Germania", cc: "de", rating: 9, date: "2026-05-30",
      source: "booking", text: "",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Hooi Leng", country: "Malaysia", cc: "my", rating: 10, date: "2026-05-14",
      source: "booking", text: "",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Sorin", country: "România", cc: "ro", rating: 10, date: "2026-04-14",
      source: "booking", text: "",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Andrii", country: "Ucraina", cc: "ua", rating: 9, date: "2026-03-18",
      source: "booking",
      text: "Totul e bun la acest apartament. Locație frumoasă. Camere confortabile și spațioase. Nu avem nimic de reproșat.",
      cats: { curatenie: 7.5, confort: 7.5, locatie: 10 }
    },
    {
      author: "Ilie", country: "România", cc: "ro", rating: 10, date: "2026-02-25",
      source: "booking",
      text: "A fost un sejur de 3 nopți perfect! Personal amabil, doamna blondă de la recepție merită 10 stele, este un om minunat. Foarte curată camera, renovată, personal la dispoziția clientului. Cald în cameră, te așteaptă cu cafea, lapte, ceai, ciocolată caldă din partea lor. În primăvară, voi reveni cu drag tot la această locație. Pensiunea este în centrul Sinaiei.",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Daniela-Camelia", country: "România", cc: "ro", rating: 10, date: "2026-01-11",
      source: "booking", text: "",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Rodica", country: "România", cc: "ro", rating: 10, date: "2026-01-11",
      source: "booking", text: "",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    },
    {
      author: "Sorin", country: "România", cc: "ro", rating: 10, date: "2026-01-05",
      source: "booking",
      text: "Felicitări și respect pentru profesionalism. Vila este foarte frumoasă, camerele foarte curate, confortabile și cochete. Doamna Oana este foarte drăguță și ajută cu drag pe toți turiștii. Curățenie de nota 10. Patronii și tot personalul sunt oameni deosebiți și se vede cum au grijă de vilă și de turiștii care le calcă pragul. Mi-a plăcut totul. Recomand cu căldură. Vom reveni cu siguranță, cu mare drag!",
      cats: { curatenie: 10, confort: 10, locatie: 10 }
    }
  ],

  // ====================  VILA TUI — CAMERE  ==========================
  // Editează: price (RON/noapte) și booked (zile ocupate).
  rooms: [
    {
      id: "dubla-balcon",
      name: { ro: "Cameră dublă cu balcon", en: "Double room with balcony", fr: "Chambre double avec balcon", it: "Camera doppia con balcone", de: "Doppelzimmer mit Balkon" },
      capacity: 2,
      size: 15,
      price: 373,
      units: 2,
      img: "assets/img/villa/rooms/dubla-balcon.jpg",
      bed: "double",
      features: ["balcony", "view", "bath", "tv", "sound", "wifi"],
      gallery: [
        "assets/img/villa/rooms/g/b1.jpg",
        "assets/img/villa/rooms/g/b2.jpg",
        "assets/img/villa/rooms/g/b3.jpg",
        "assets/img/villa/rooms/g/b4.jpg",
        "assets/img/villa/rooms/g/b5.jpg",
        "assets/img/villa/rooms/g/b6.jpg"
      ],
      amenities: {
        ro: ["Pat dublu mare", "Balcon & vedere", "Baie proprie (duș)", "TV cu cablu", "Frigider", "Ceai/cafea", "Izolare fonică", "Wi-Fi gratuit"],
        en: ["Large double bed", "Balcony & view", "Private bathroom (shower)", "Cable TV", "Fridge", "Tea/coffee", "Soundproofing", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "queen",
      name: { ro: "Cameră Queen", en: "Queen room", fr: "Chambre Queen", it: "Camera Queen", de: "Queen-Zimmer" },
      capacity: 2,
      size: 15,
      price: 350,
      units: 1,
      img: "assets/img/villa/rooms/queen.jpg",
      bed: "double",
      features: ["bath", "tv", "sound", "wifi", "coffee", "heating"],
      gallery: [
        "assets/img/villa/rooms/g/q1.jpg",
        "assets/img/villa/rooms/g/q2.jpg",
        "assets/img/villa/rooms/g/q3.jpg",
        "assets/img/villa/rooms/g/q4.jpg",
        "assets/img/villa/rooms/g/q5.jpg",
        "assets/img/villa/rooms/g/q6.jpg",
        "assets/img/villa/rooms/g/q7.jpg",
        "assets/img/villa/rooms/g/q8.jpg",
        "assets/img/villa/rooms/g/q9.jpg",
        "assets/img/villa/rooms/g/q10.jpg",
        "assets/img/villa/rooms/g/q11.jpg",
        "assets/img/villa/rooms/g/q12.jpg",
        "assets/img/villa/rooms/g/q13.jpg",
        "assets/img/villa/rooms/g/q14.jpg"
      ],
      amenities: {
        ro: ["Pat dublu mare", "Baie proprie (duș/cadă)", "TV cu cablu", "Dulap", "Ceai/cafea", "Încălzire", "Izolare fonică", "Wi-Fi gratuit"],
        en: ["Large double bed", "Private bathroom (shower/tub)", "Cable TV", "Wardrobe", "Tea/coffee", "Heating", "Soundproofing", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "deluxe",
      name: { ro: "Cameră deluxe", en: "Deluxe room", fr: "Chambre deluxe", it: "Camera deluxe", de: "Deluxe-Zimmer" },
      capacity: 2,
      size: 16,
      price: 390,
      units: 1,
      img: "assets/img/villa/rooms/deluxe.jpg",
      bed: "double",
      features: ["bath", "tv", "sound", "wifi", "coffee", "heating"],
      gallery: [
        "assets/img/villa/rooms/deluxe.jpg",
        "assets/img/villa/rooms/g/deluxe-2.jpg",
        "assets/img/villa/rooms/g/deluxe-3.jpg",
        "assets/img/villa/rooms/g/deluxe-4.jpg",
        "assets/img/villa/rooms/g/deluxe-bath1.jpg",
        "assets/img/villa/rooms/g/deluxe-bath2.jpg"
      ],
      amenities: {
        ro: ["Pat dublu mare", "Baie proprie (duș sau cadă)", "TV cu cablu", "Dulap", "Ceai/cafea", "Încălzire", "Izolare fonică", "Wi-Fi gratuit"],
        en: ["Large double bed", "Private bathroom (shower or tub)", "Cable TV", "Wardrobe", "Tea/coffee", "Heating", "Soundproofing", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "tripla",
      name: { ro: "Cameră triplă", en: "Triple room", fr: "Chambre triple", it: "Camera tripla", de: "Dreibettzimmer" },
      capacity: 3,
      size: 22,
      price: 352,
      units: 2,
      img: "assets/img/villa/rooms/tripla.jpg",
      bed: "triple",
      features: ["courtyard_view", "bath", "tv", "sound", "wifi", "coffee"],
      gallery: [
        "assets/img/villa/rooms/g/t1.jpg",
        "assets/img/villa/rooms/g/t2.jpg",
        "assets/img/villa/rooms/g/t3.jpg",
        "assets/img/villa/rooms/g/t4.jpg",
        "assets/img/villa/rooms/g/t5.jpg",
        "assets/img/villa/rooms/g/t6.jpg",
        "assets/img/villa/rooms/g/t7.jpg",
        "assets/img/villa/rooms/g/t8.jpg",
        "assets/img/villa/rooms/g/t9.jpg",
        "assets/img/villa/rooms/g/t10.jpg",
        "assets/img/villa/rooms/g/t11.jpg",
        "assets/img/villa/rooms/g/t12.jpg",
        "assets/img/villa/rooms/g/t13.jpg",
        "assets/img/villa/rooms/g/t14.jpg",
        "assets/img/villa/rooms/g/t15.jpg",
        "assets/img/villa/rooms/g/t16.jpg",
        "assets/img/villa/rooms/g/t17.jpg",
        "assets/img/villa/rooms/g/t18.jpg",
        "assets/img/villa/rooms/g/t19.jpg",
        "assets/img/villa/rooms/g/t20.jpg"
      ],
      amenities: {
        ro: ["Pat dublu + pat single / canapea extensibilă", "Vedere la curtea interioară", "Baie proprie", "TV cu cablu", "Ceai/cafea", "Izolare fonică", "Wi-Fi gratuit"],
        en: ["Double bed + single / sofa bed", "Inner courtyard view", "Private bathroom", "Cable TV", "Tea/coffee", "Soundproofing", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "apartament",
      name: { ro: "Apartament cu balcon (45 m²)", en: "Apartment with balcony (45 m²)", fr: "Appartement avec balcon (45 m²)", it: "Appartamento con balcone (45 m²)", de: "Apartment mit Balkon (45 m²)" },
      capacity: 4,
      size: 45,
      price: 579,
      units: 1,
      img: "assets/img/villa/rooms/apartament.jpg",
      bed: "two_double",
      features: ["kitchenette", "bath", "balcony", "garden_view", "tv", "wifi"],
      gallery: [
        "assets/img/villa/rooms/g/a1.jpg",
        "assets/img/villa/rooms/g/a2.jpg",
        "assets/img/villa/rooms/g/a3.jpg",
        "assets/img/villa/rooms/g/a4.jpg",
        "assets/img/villa/rooms/g/a5.jpg",
        "assets/img/villa/rooms/g/a6.jpg",
        "assets/img/villa/rooms/g/a7.jpg",
        "assets/img/villa/rooms/g/a8.jpg",
        "assets/img/villa/rooms/g/a9.jpg",
        "assets/img/villa/rooms/g/a10.jpg",
        "assets/img/villa/rooms/g/a11.jpg",
        "assets/img/villa/rooms/g/a12.jpg",
        "assets/img/villa/rooms/g/a13.jpg"
      ],
      amenities: {
        ro: ["2 dormitoare (paturi duble)", "2 băi (duș & cadă)", "Chicinetă privată utilată", "Balcon & vedere la grădină", "Intrare privată", "TV cu cablu", "Wi-Fi gratuit"],
        en: ["2 bedrooms (double beds)", "2 bathrooms (shower & tub)", "Private equipped kitchenette", "Balcony & garden view", "Private entrance", "Cable TV", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "accesibila",
      name: { ro: "Cameră accesibilă la parter", en: "Accessible ground-floor room", fr: "Chambre accessible au rez-de-chaussée", it: "Camera accessibile al piano terra", de: "Barrierefreies Erdgeschosszimmer" },
      capacity: 2,
      size: 16,
      price: 350,
      units: 1,
      img: "assets/img/villa/rooms/accesibila.jpg",
      bed: "double",
      features: ["accessible", "bath", "tv", "wifi", "coffee"],
      gallery: [
        "assets/img/villa/rooms/accesibila.jpg",
        "assets/img/villa/rooms/g/acc-2.jpg",
        "assets/img/villa/rooms/g/acc-3.jpg",
        "assets/img/villa/rooms/g/acc-bath.jpg"
      ],
      amenities: {
        ro: ["Acces la parter, fără trepte", "Pat dublu", "Baie proprie", "TV cu cablu", "Ceai/cafea", "Wi-Fi gratuit"],
        en: ["Step-free, ground floor", "Double bed", "Private bathroom", "Cable TV", "Tea/coffee", "Free Wi-Fi"]
      },
      booked: []
    }
  ],

  // Disponibilitate & prețuri pe zile — gestionate din /admin.
  // availability[roomId]["AAAA-LL-ZZ"] = { p: preț RON, a: camere disponibile }
  availability: {},

  // ====================  BIO DE MARAMU' — BRÂNZETURI  ================
  // Făcute manual la ferma noastră. Doar prezentare (fără vânzare online deocamdată).
  bioProducts: [
    {
      name: { ro: "Brânză maturată 3 ani", en: "3-year matured cheese", fr: "Fromage affiné 3 ans", it: "Formaggio stagionato 3 anni", de: "3 Jahre gereifter Käse" },
      desc: { ro: "Maturată natural în pivniță, timp de 3 ani. Crustă naturală, gust intens și complex — făcută manual, la ferma noastră.", en: "Naturally cellar-aged for 3 years. Natural rind, deep and complex flavour — handmade at our farm.", fr: "Affiné naturellement en cave pendant 3 ans. Croûte naturelle, goût intense et complexe — fait main à notre ferme.", it: "Stagionato naturalmente in cantina per 3 anni. Crosta naturale, gusto intenso e complesso — fatto a mano nella nostra fattoria.", de: "Natürlich 3 Jahre im Keller gereift. Natürliche Rinde, intensiver und komplexer Geschmack — handgemacht auf unserem Hof." },
      img: "assets/img/bio/cheese-matured.jpg"
    },
    {
      name: { ro: "Cașcaval Tomme maturat 2,5 ani", en: "Tomme cașcaval, matured 2.5 years", fr: "Cașcaval Tomme affiné 2,5 ans", it: "Cașcaval Tomme stagionato 2,5 anni", de: "Tomme-cașcaval, 2,5 Jahre gereift" },
      desc: { ro: "Tomme cu crustă naturală și vinișoare de mucegai nobil, maturat 2,5 ani. Aromă complexă, de pivniță.", en: "Natural-rind Tomme with noble blue veining, matured 2.5 years. Complex, cellar aroma.", fr: "Tomme à croûte naturelle et veines de moisissure noble, affinée 2,5 ans. Arôme complexe de cave.", it: "Tomme a crosta naturale con venature di muffa nobile, stagionata 2,5 anni. Aroma complesso di cantina.", de: "Tomme mit Naturrinde und edler Blauschimmel-Äderung, 2,5 Jahre gereift. Komplexes Kelleraroma." },
      img: "assets/img/bio/cheese-tomme.jpg"
    },
    {
      name: { ro: "Cheddar maturat 2 ani", en: "Cheddar, matured 2 years", fr: "Cheddar affiné 2 ans", it: "Cheddar stagionato 2 anni", de: "Cheddar, 2 Jahre gereift" },
      desc: { ro: "Cheddar de casă, maturat 2 ani. Pastă fermă și fină, gust plin — făcut manual, la fermă.", en: "Farmhouse cheddar, matured 2 years. Firm, fine paste and full flavour — handmade at the farm.", fr: "Cheddar fermier, affiné 2 ans. Pâte ferme et fine, goût généreux — fait main à la ferme.", it: "Cheddar di fattoria, stagionato 2 anni. Pasta soda e fine, gusto pieno — fatto a mano in fattoria.", de: "Bauernhof-Cheddar, 2 Jahre gereift. Feste, feine Textur und voller Geschmack — handgemacht auf dem Hof." },
      img: "assets/img/bio/cheese-cedar.jpg"
    },
    {
      name: { ro: "Cașcaval de casă, maturat", en: "Matured farmhouse cașcaval", fr: "Cașcaval fermier affiné", it: "Cașcaval di fattoria stagionato", de: "Gereifter Bauernhof-cașcaval" },
      desc: { ro: "Cașcaval copt și maturat, cu pastă fină și gust plin. Făcut manual, fără adaosuri.", en: "Ripened and matured cașcaval, fine paste and full flavour. Handmade, no additives.", fr: "Cașcaval affiné, pâte fine et goût généreux. Fait main, sans additifs.", it: "Cașcaval maturato, pasta fine e gusto pieno. Fatto a mano, senza additivi.", de: "Gereifter cașcaval, feine Textur und voller Geschmack. Handgemacht, ohne Zusätze." },
      img: "assets/img/bio/cheese-cascaval.jpg"
    }
  ],

  // ====================  BIO DE MARAMU' — CARNE MATURATĂ  ============
  // Carne de porc sărată și maturată natural, la ferma noastră.
  bioMeats: [
    {
      name: { ro: "Jambon maturat", en: "Matured ham", fr: "Jambon affiné", it: "Prosciutto stagionato", de: "Gereifter Schinken" },
      desc: { ro: "Pulpă întreagă, sărată și maturată natural la aer rece de munte. Feliată subțire, e desăvârșită.", en: "Whole leg, salted and naturally matured in cold mountain air. Sublime sliced thin.", fr: "Cuisse entière, salée et affinée naturellement à l'air froid de la montagne. Sublime en fines tranches.", it: "Coscia intera, salata e stagionata naturalmente all'aria fredda di montagna. Sublime affettata sottile.", de: "Ganze Keule, gesalzen und natürlich in kalter Bergluft gereift. Dünn geschnitten ein Genuss." },
      img: "assets/img/bio/meat-ham.jpg"
    },
    {
      name: { ro: "Mușchiuleț maturat", en: "Matured pork tenderloin", fr: "Filet mignon affiné", it: "Filetto di maiale stagionato", de: "Gereiftes Schweinefilet" },
      desc: { ro: "Mușchiuleț de porc legat manual și maturat lent. Fraged, aromat, fără conservanți.", en: "Pork tenderloin tied by hand and slowly matured. Tender, aromatic, no preservatives.", fr: "Filet de porc ficelé à la main et affiné lentement. Tendre, aromatique, sans conservateurs.", it: "Filetto di maiale legato a mano e stagionato lentamente. Tenero, aromatico, senza conservanti.", de: "Handgebundenes Schweinefilet, langsam gereift. Zart, aromatisch, ohne Konservierungsstoffe." },
      img: "assets/img/bio/meat-muschi.jpg"
    },
    {
      name: { ro: "Ceafă maturată", en: "Matured pork neck", fr: "Échine de porc affinée", it: "Coppa di maiale stagionata", de: "Gereifter Schweinenacken" },
      desc: { ro: "Ceafă de porc maturată, cu marmorare frumoasă și aromă profundă.", en: "Matured pork neck, beautifully marbled with deep flavour.", fr: "Échine de porc affinée, joliment persillée et au goût profond.", it: "Coppa di maiale stagionata, ben marezzata e dal gusto profondo.", de: "Gereifter Schweinenacken, schön marmoriert mit tiefem Aroma." },
      img: "assets/img/bio/meat-ceafa.jpg"
    },
    {
      name: { ro: "Antricot maturat", en: "Matured pork loin", fr: "Carré de porc affiné", it: "Lonza di maiale stagionata", de: "Gereiftes Schweinekotelett" },
      desc: { ro: "Antricot cu os, maturat natural — felii cu marmorare fină și gust bogat.", en: "Bone-in loin, naturally matured — finely marbled slices, rich flavour.", fr: "Carré avec os, affiné naturellement — tranches finement persillées, goût riche.", it: "Lonza con osso, stagionata naturalmente — fette finemente marezzate, gusto ricco.", de: "Kotelett mit Knochen, natürlich gereift — fein marmorierte Scheiben, reicher Geschmack." },
      img: "assets/img/bio/meat-antricot.jpg"
    },
    {
      name: { ro: "Coaste maturate", en: "Matured pork ribs", fr: "Côtes de porc affinées", it: "Costine di maiale stagionate", de: "Gereifte Schweinerippchen" },
      desc: { ro: "Coaste de porc sărate și maturate, numai bune pentru un platou rustic.", en: "Salted, matured pork ribs — perfect for a rustic platter.", fr: "Côtes de porc salées et affinées — parfaites pour un plateau rustique.", it: "Costine di maiale salate e stagionate — perfette per un tagliere rustico.", de: "Gesalzene, gereifte Schweinerippchen — perfekt für eine rustikale Platte." },
      img: "assets/img/bio/meat-coaste.jpg"
    },
    {
      name: { ro: "Cotlet maturat", en: "Matured pork chops", fr: "Côtelettes de porc affinées", it: "Braciole di maiale stagionate", de: "Gereifte Schweinekoteletts" },
      desc: { ro: "Cotlet cu os, maturat natural — gust autentic de altădată.", en: "Bone-in chops, naturally matured — authentic old-time taste.", fr: "Côtelettes avec os, affinées naturellement — goût authentique d'autrefois.", it: "Braciole con osso, stagionate naturalmente — autentico sapore di una volta.", de: "Koteletts mit Knochen, natürlich gereift — authentischer Geschmack von früher." },
      img: "assets/img/bio/meat-cotlet.jpg"
    }
  ],

  // ====================  BV — PRODUSE DE LA CUMNAT  ==================
  // Secțiune secundară: cartofi și legume din zona Brașov.
  bv: {
    sellerName: { ro: "Legume & cartofi din zona Brașov", en: "Vegetables & potatoes, Brașov area", fr: "Légumes & pommes de terre de la région de Brașov", it: "Verdure & patate della zona di Brașov", de: "Gemüse & Kartoffeln aus der Region Brașov" },
    phone: "0750 742 928",
    products: [
      { name: { ro: "Cartofi de munte", en: "Mountain potatoes", fr: "Pommes de terre de montagne", it: "Patate di montagna", de: "Bergkartoffeln" }, price: "3 lei/kg",
        img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80" },
      { name: { ro: "Ceapă", en: "Onions", fr: "Oignons", it: "Cipolle", de: "Zwiebeln" }, price: "4 lei/kg",
        img: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=700&q=80" },
      { name: { ro: "Varză", en: "Cabbage", fr: "Chou", it: "Cavolo", de: "Kohl" }, price: "3 lei/buc",
        img: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=700&q=80" }
    ]
  }
};
