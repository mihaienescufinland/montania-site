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

  // ====================  BIO DE MARAMU' — PRODUSE  ===================
  // Doar prezentare (fără vânzare online deocamdată).
  bioProducts: [
    {
      name: { ro: "Caș proaspăt de vacă", en: "Fresh cow's caș", fr: "Caș frais de vache", it: "Caș fresco di mucca", de: "Frischer Kuh-caș" },
      desc: { ro: "Caș tradițional, dulce și fraged, făcut zilnic la stână.", en: "Traditional sweet, tender caș, made fresh daily at the farm.", fr: "Caș traditionnel, doux et tendre, fait chaque jour à la bergerie.", it: "Caș tradizionale, dolce e tenero, fatto ogni giorno all'alpeggio.", de: "Traditioneller, milder und zarter caș, täglich frisch auf der Alm." },
      img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: { ro: "Brânză de burduf", en: "Burduf cheese", fr: "Fromage burduf", it: "Formaggio burduf", de: "Burduf-Käse" },
      desc: { ro: "Maturată, cu aromă intensă de munte. Rețetă de familie.", en: "Matured, with an intense mountain aroma. A family recipe.", fr: "Affiné, à l'arôme intense de montagne. Recette de famille.", it: "Stagionato, con intenso aroma di montagna. Ricetta di famiglia.", de: "Gereift, mit intensivem Bergaroma. Ein Familienrezept." },
      img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: { ro: "Cașcaval de Maramureș", en: "Maramureș cașcaval", fr: "Cașcaval du Maramureș", it: "Cașcaval del Maramureș", de: "Maramureș-cașcaval" },
      desc: { ro: "Cașcaval afumat natural, perfect la grătar sau pe pâine.", en: "Naturally smoked cașcaval, perfect grilled or on bread.", fr: "Cașcaval fumé naturellement, parfait grillé ou sur du pain.", it: "Cașcaval affumicato naturalmente, perfetto alla griglia o sul pane.", de: "Natürlich geräucherter cașcaval, perfekt gegrillt oder auf Brot." },
      img: "https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&w=800&q=80"
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
