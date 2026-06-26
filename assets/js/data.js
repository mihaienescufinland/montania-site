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

  contact: {
    phone: "0722 427 636",
    // WhatsApp: număr internațional fără + și fără spații
    whatsapp: "40722427636",
    email: "info@montania.ro",
    addressRo: "Str. Aosta nr. 5, Sinaia, jud. Prahova",
    addressEn: "5 Aosta St., Sinaia, Prahova county",
    mapsUrl: "https://maps.google.com/?q=Pensiunea+Tui+Str.+Aosta+5+Sinaia",
    bookingUrl: "https://www.booking.com/hotel/ro/pensiunea-tui.html",
    bookingScore: "9.7",
    bookingReviews: 71
  },

  // ====================  VILA TUI — CAMERE  ==========================
  // Editează: price (RON/noapte) și booked (zile ocupate).
  rooms: [
    {
      id: "dubla-superioara",
      name: { ro: "Cameră dublă superioară", en: "Superior double room" },
      capacity: 2,
      size: 16,
      price: 220,
      img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      amenities: {
        ro: ["Pat matrimonial 160/180", "Baie proprie", "TV LCD", "Frigider", "Ceai/cafea", "Wi-Fi gratuit"],
        en: ["King bed 160/180", "Private bathroom", "LCD TV", "Fridge", "Tea/coffee", "Free Wi-Fi"]
      },
      booked: ["2026-06-27", "2026-06-28", "2026-07-04", "2026-07-05"]
    },
    {
      id: "dubla-lux",
      name: { ro: "Cameră dublă de lux", en: "Deluxe double room" },
      capacity: 2,
      size: 16,
      price: 250,
      img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      amenities: {
        ro: ["Pat matrimonial 160/180", "Baie proprie", "TV LCD", "Frigider", "Produse cosmetice", "Wi-Fi gratuit"],
        en: ["King bed 160/180", "Private bathroom", "LCD TV", "Fridge", "Toiletries", "Free Wi-Fi"]
      },
      booked: ["2026-07-01", "2026-07-02", "2026-07-03"]
    },
    {
      id: "camera-balcon",
      name: { ro: "Cameră cu balcon & vedere la munte", en: "Room with balcony & mountain view" },
      capacity: 2,
      size: 16,
      price: 270,
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      amenities: {
        ro: ["Balcon", "Vedere la munte", "Baie proprie", "Uscător de păr", "Frigider", "Wi-Fi gratuit"],
        en: ["Balcony", "Mountain view", "Private bathroom", "Hair dryer", "Fridge", "Free Wi-Fi"]
      },
      booked: ["2026-06-29", "2026-06-30"]
    },
    {
      id: "tripla",
      name: { ro: "Cameră triplă", en: "Triple room" },
      capacity: 3,
      size: 18,
      price: 300,
      img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
      amenities: {
        ro: ["3 locuri", "Baie proprie", "TV cablu", "Acces bucătărie", "Frigider", "Wi-Fi gratuit"],
        en: ["Sleeps 3", "Private bathroom", "Cable TV", "Kitchen access", "Fridge", "Free Wi-Fi"]
      },
      booked: []
    },
    {
      id: "apartament",
      name: { ro: "Apartament cu bucătărie (50 m²)", en: "Apartment with kitchen (50 m²)" },
      capacity: 4,
      size: 50,
      price: 450,
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
      amenities: {
        ro: ["2 camere duble", "2 băi", "Bucătărie complet utilată", "Centrală proprie", "Clădire separată", "Wi-Fi gratuit"],
        en: ["2 double rooms", "2 bathrooms", "Fully equipped kitchen", "Own heating", "Separate building", "Free Wi-Fi"]
      },
      booked: ["2026-07-10", "2026-07-11", "2026-07-12"]
    }
  ],

  // ====================  BIO DE MARAMU' — PRODUSE  ===================
  // Doar prezentare (fără vânzare online deocamdată).
  bioProducts: [
    {
      name: { ro: "Caș proaspăt de vacă", en: "Fresh cow's caș" },
      desc: { ro: "Caș tradițional, dulce și fraged, făcut zilnic la stână.", en: "Traditional sweet, tender caș, made fresh daily at the farm." },
      img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: { ro: "Brânză de burduf", en: "Burduf cheese" },
      desc: { ro: "Maturată, cu aromă intensă de munte. Rețetă de familie.", en: "Matured, with an intense mountain aroma. A family recipe." },
      img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: { ro: "Cașcaval de Maramureș", en: "Maramureș cașcaval" },
      desc: { ro: "Cașcaval afumat natural, perfect la grătar sau pe pâine.", en: "Naturally smoked cașcaval, perfect grilled or on bread." },
      img: "https://images.unsplash.com/photo-1624806992066-5ffaa3d63e25?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: { ro: "Brânză de capră", en: "Goat cheese" },
      desc: { ro: "Cremoasă și fină, din lapte de capră crescute liber.", en: "Creamy and delicate, from free-grazing goats." },
      img: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=800&q=80"
    }
  ],

  // ====================  BV — PRODUSE DE LA CUMNAT  ==================
  // Secțiune secundară: cartofi și legume din zona Brașov.
  bv: {
    sellerName: { ro: "Legume & cartofi din zona Brașov", en: "Vegetables & potatoes, Brașov area" },
    phone: "07xx xxx xxx",
    products: [
      { name: { ro: "Cartofi de munte", en: "Mountain potatoes" }, price: "3 lei/kg",
        img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80" },
      { name: { ro: "Ceapă", en: "Onions" }, price: "4 lei/kg",
        img: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=700&q=80" },
      { name: { ro: "Varză", en: "Cabbage" }, price: "3 lei/buc",
        img: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=700&q=80" }
    ]
  }
};
