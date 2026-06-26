/* =====================================================================
   MONTANIA — i18n (RO / EN)
   Aplică traduceri pe orice element cu atribut data-i18n="cheie".
   ===================================================================== */
const I18N = {
  ro: {
    "nav.home": "Acasă",
    "nav.vila": "Vila TUI",
    "nav.bio": "Bio de Maramu'",
    "nav.contact": "Contact",
    "nav.sinaia": "Sinaia & Munți",
    "nav.book": "Rezervă",

    "home.hero.title": "Vacanță la munte, în inima Sinaiei.",
    "home.hero.sub": "Vila TUI — cazare ultracentrală în Sinaia, la câțiva pași de telecabină, pârtii, Castelul Peleș și traseele Bucegilor.",
    "home.hero.stay": "Verifică disponibilitatea",
    "home.hero.taste": "Descoperă Sinaia",

    "home.doors.eyebrow": "Alege experiența",
    "home.doors.stay.title": "Stai la munte",
    "home.doors.stay.text": "Vila TUI — ultracentral în Sinaia, la câțiva pași de telecabină, Peleș și trasee.",
    "home.doors.taste.title": "Gustă tradiția",
    "home.doors.taste.text": "Bio de Maramu' — brânză și caș făcute la stână, după rețete de familie.",
    "home.doors.cta": "Descoperă",

    "home.story.eyebrow": "Povestea noastră",
    "home.story.title": "De la crestele Bucegilor la stânele Maramureșului",
    "home.story.text": "Iubim muntele românesc sub toate formele lui. În Sinaia primim oaspeți de peste 20 de ani la Vila TUI, iar în Maramureș familia noastră face brânză curată, bio, exact ca pe vremuri. Două locuri, aceeași grijă pentru autentic.",

    "home.reviews.title": "Oaspeții ne recomandă",
    "home.reviews.text": "Scor excepțional pe Booking.com pentru locație, curățenie și ospitalitate.",
    "home.reviews.based": "din {n} recenzii verificate",

    "home.book.eyebrow": "Rezervare directă",
    "home.book.title": "Cazarea ta în Sinaia, la un click distanță",
    "home.book.text": "Verifică disponibilitatea camerelor și trimite cererea de rezervare direct. Fără comisioane, îți confirmăm rapid.",
    "home.book.cta": "Verifică disponibilitatea",

    "home.explore.eyebrow": "Sinaia & Bucegi",
    "home.explore.title": "Muntele, chiar la ușa ta",
    "home.explore.text": "De la Castelul Peleș la pârtii, schi de tură și mountain biking — totul pleacă din Sinaia.",
    "home.explore.cta": "Descoperă experiențele",

    "home.bio.eyebrow": "În curând",
    "home.bio.title": "Bio de Maramu' — un gust de Maramureș",
    "home.bio.text": "Pe lângă munte, familia noastră face brânză bio în Maramureș. Pregătim povestea și produsele — în curând aici.",
    "home.bio.cta": "Aruncă o privire",

    "exp.hero.title": "Sinaia & Munții Bucegi",
    "exp.hero.sub": "Tot ce iubim la muntele românesc — la câțiva pași de Vila TUI.",
    "exp.intro": "Sinaia, „Perla Carpaților”, e poarta către Munții Bucegi: castele regale, pârtii la 2000 m, schi de tură legendar și trasee de neuitat. De la Vila TUI, totul e la îndemână.",
    "exp.peles.t": "Castelul Peleș",
    "exp.peles.d": "Bijuteria neo-renascentistă a Sinaiei și fosta reședință de vară a regilor României, la doar ~2 km de Vila TUI. Alături, Castelul Pelișor și Mănăstirea Sinaia (la 600 m) completează o zi de neuitat.",
    "exp.ski.t": "Schi în Sinaia",
    "exp.ski.d": "Pârtiile Sinaiei sunt la 2000 m altitudine — cel mai bun schi de altitudine din România. Acces direct din centru cu telecabina (Cota 1400 → Cota 2000), cu posibilități off-piste și zăpadă bună până târziu în sezon. Perfect pentru schi, snowboard și telemark.",
    "exp.touring.t": "Schi de tură",
    "exp.touring.d": "Schiul de tură îmbină plăcerea tehnică a schiului alpin cu libertatea fondului. Platoul Bucegilor (2000 m) creează un mediu unic, cu coborâri spectaculoase spre Valea Prahovei — de la trasee blânde în zona Sinaia, la coborâri de ~1500 m în zona Vârfului Omu. Montania oferă singurul ghid de schi de tură al Bucegilor și, la cerere, ghizi experimentați.",
    "exp.touring.routes": "Trasee recomandate",
    "exp.route.duration": "Durată",
    "exp.route.difficulty": "Dificultate",
    "exp.route1.t": "Facing the Sun",
    "exp.route1.d": "Plecare de la telecabina Bușteni, peste Vârful Cocora, prin șaua Cocora și Laptici, până la Cota 2000 și coborâre spre Sinaia.",
    "exp.route1.dur": "4–5 ore",
    "exp.route1.dif": "Medie · 3.5/5",
    "exp.route2.t": "Vânturiș",
    "exp.route2.d": "Din Sinaia spre Cota 2000 și Vârful cu Dor (2030 m), coborâre spre Valea Vânturiș și retur prin Valea Clirului.",
    "exp.route2.dur": "4–5 ore",
    "exp.route2.dif": "Medie · 3/5",
    "exp.route3.t": "Valea Cerbului",
    "exp.route3.d": "De la Cabana Babele spre Vârful Omu și coborâre tehnică pe Valea Cerbului, sub Colții Obârșiei (2480 m). Zonă alpină, doar pentru experimentați.",
    "exp.route3.dur": "4–5 ore",
    "exp.route3.dif": "Dificilă · 5/5",
    "exp.bike.t": "Mountain biking",
    "exp.bike.d": "Vara, Bucegii devin un paradis pentru mountain biking. De la drumuri forestiere line pe platou, până la coborâri tehnice spre Sinaia. Telecabina te urcă la 2000 m, tu alegi coborârea.",
    "exp.hike.t": "Drumeții & trasee",
    "exp.hike.d": "Trasee pentru toate nivelurile pleacă chiar din Sinaia: spre Vârful cu Dor, Furnica, Piatra Arsă, Babele și Sfinxul, până la Vârful Omu (2505 m). Panorame de neuitat și o lume de relaxare și aventură.",
    "exp.safety": "Iarna, înainte de orice tură, verifică riscul de avalanșă publicat de ANM și buletinul echipei Salvamont Sinaia (afișat la Cota 2000).",
    "exp.cta.t": "Gata de munte?",
    "exp.cta.d": "Cazează-te central, la Vila TUI, și ai totul la îndemână.",

    "vila.hero.title": "Vila TUI · Sinaia",
    "vila.hero.sub": "Cazare ultracentrală pe Strada Aosta — la 5 minute de telecabină, 600 m de Mănăstirea Sinaia și 2 km de Castelul Peleș.",
    "vila.hero.book": "Verifică disponibilitatea",

    "vila.feat.eyebrow": "De ce Vila TUI",
    "vila.feat.title": "Confort în inima stațiunii",
    "vila.feat.1.t": "Poziție ultracentrală",
    "vila.feat.1.d": "La câțiva pași de telecabină, restaurante și parc.",
    "vila.feat.2.t": "Parcare supravegheată",
    "vila.feat.2.d": "Loc de parcare propriu, monitorizat video.",
    "vila.feat.3.t": "Grădină & grătar",
    "vila.feat.3.d": "Spațiu de relaxare cu BBQ, mese și bănci.",
    "vila.feat.4.t": "Tichete de vacanță",
    "vila.feat.4.d": "Acceptăm tichete de vacanță pe hârtie și pe card.",

    "vila.rooms.eyebrow": "Cazare",
    "vila.rooms.title": "Camerele noastre",
    "vila.rooms.text": "Prețuri pe noapte. Disponibilitatea se actualizează regulat.",
    "vila.rooms.book": "Rezervă camera",
    "vila.rooms.persons": "persoane",
    "vila.rooms.person": "persoană",

    "vila.book.eyebrow": "Rezervare directă",
    "vila.book.title": "Verifică disponibilitatea și cere rezervarea",
    "vila.book.text": "Alege camera și datele în calendar. Îți pregătim un rezumat, apoi trimite cererea — îți confirmăm rapid.",
    "vila.book.room": "Camera",
    "vila.book.checkin": "Check-in",
    "vila.book.checkout": "Check-out",
    "vila.book.pickdates": "Selectează datele în calendar",
    "vila.book.nights": "nopți",
    "vila.book.night": "noapte",
    "vila.book.total": "Total estimativ",
    "vila.book.name": "Nume",
    "vila.book.guests": "Număr persoane",
    "vila.book.message": "Mesaj (opțional)",
    "vila.book.send": "Trimite cererea de rezervare",
    "vila.book.whatsapp": "Cere pe WhatsApp",
    "vila.book.bookingcom": "Sau rezervă pe Booking.com",
    "vila.book.legend.avail": "Disponibil",
    "vila.book.legend.booked": "Ocupat",
    "vila.book.legend.selected": "Selectat",
    "vila.book.note": "Plata nu se face online. Cererea ajunge la noi și revenim cu confirmarea.",

    "bio.hero.title": "Bio de Maramu'",
    "bio.hero.sub": "Brânză curată, făcută cu răbdare la stână, în inima Maramureșului.",
    "bio.story.eyebrow": "Povestea",
    "bio.story.title": "Gustul de altădată, păstrat cu grijă",
    "bio.story.text": "În Maramureș, timpul curge altfel. Animalele pasc liber pe pajiști, laptele e proaspăt, iar brânza se face manual, fără grabă și fără adaosuri. Bio de Maramu' e felul nostru de a duce mai departe gustul copilăriei — autentic, curat, de munte.",
    "bio.products.eyebrow": "Produsele noastre",
    "bio.products.title": "Ce facem la stână",
    "bio.products.text": "Producție în cantități mici, în funcție de sezon. Pentru detalii, sună-ne.",
    "bio.products.note": "Momentan doar prezentare — pentru comenzi ne poți contacta direct.",
    "bio.cta": "Întreabă de produse",

    "bv.eyebrow": "Și încă ceva bun",
    "bv.title": "Legume & cartofi din zona Brașov",
    "bv.text": "Recomandăm și produsele proaspete ale familiei din zona Brașov — direct de la producător.",
    "bv.order": "Comenzi la telefon",

    "contact.hero.title": "Contact",
    "contact.hero.sub": "Suntem aici pentru rezervări și întrebări — la munte și la stână.",
    "contact.phone": "Telefon",
    "contact.email": "Email",
    "contact.address": "Adresă",
    "contact.title": "Hai să vorbim",

    "footer.tag": "O familie, doi munți, gusturi autentice din România.",
    "footer.explore": "Explorează",
    "footer.contact": "Contact",
    "footer.rights": "Toate drepturile rezervate.",
    "footer.legal": "Termeni & Confidențialitate",

    "alert.pickroom": "Te rugăm selectează o cameră și datele.",
    "alert.thanks": "Mulțumim! Cererea ta a fost pregătită pentru trimitere."
  },

  en: {
    "nav.home": "Home",
    "nav.vila": "TUI Villa",
    "nav.bio": "Bio de Maramu'",
    "nav.contact": "Contact",
    "nav.sinaia": "Sinaia & Mountains",
    "nav.book": "Book",

    "home.hero.title": "A mountain holiday in the heart of Sinaia.",
    "home.hero.sub": "TUI Villa — ultra-central accommodation in Sinaia, steps from the cable car, ski slopes, Peleș Castle and the Bucegi trails.",
    "home.hero.stay": "Check availability",
    "home.hero.taste": "Discover Sinaia",

    "home.doors.eyebrow": "Choose your experience",
    "home.doors.stay.title": "Stay in the mountains",
    "home.doors.stay.text": "TUI Villa — central in Sinaia, steps from the cable car, Peleș Castle and trails.",
    "home.doors.taste.title": "Taste tradition",
    "home.doors.taste.text": "Bio de Maramu' — cheese and caș made at the farm, from family recipes.",
    "home.doors.cta": "Discover",

    "home.story.eyebrow": "Our story",
    "home.story.title": "From the Bucegi ridges to the Maramureș sheepfolds",
    "home.story.text": "We love the Romanian mountains in every form. In Sinaia we have welcomed guests at TUI Villa for over 20 years, while in Maramureș our family makes clean, organic cheese, just like in the old days. Two places, the same care for what's authentic.",

    "home.reviews.title": "Guests recommend us",
    "home.reviews.text": "Exceptional Booking.com score for location, cleanliness and hospitality.",
    "home.reviews.based": "from {n} verified reviews",

    "home.book.eyebrow": "Direct booking",
    "home.book.title": "Your stay in Sinaia, one click away",
    "home.book.text": "Check room availability and send your booking request directly. No commissions, we confirm quickly.",
    "home.book.cta": "Check availability",

    "home.explore.eyebrow": "Sinaia & Bucegi",
    "home.explore.title": "The mountains, right at your door",
    "home.explore.text": "From Peleș Castle to ski slopes, ski touring and mountain biking — it all starts in Sinaia.",
    "home.explore.cta": "Discover the experiences",

    "home.bio.eyebrow": "Coming soon",
    "home.bio.title": "Bio de Maramu' — a taste of Maramureș",
    "home.bio.text": "Beyond the mountains, our family makes organic cheese in Maramureș. We're preparing the story and the products — coming here soon.",
    "home.bio.cta": "Take a peek",

    "exp.hero.title": "Sinaia & the Bucegi Mountains",
    "exp.hero.sub": "Everything we love about the Romanian mountains — steps from TUI Villa.",
    "exp.intro": "Sinaia, the \"Pearl of the Carpathians\", is the gateway to the Bucegi Mountains: royal castles, slopes at 2000 m, legendary ski touring and unforgettable trails. From TUI Villa, it's all within reach.",
    "exp.peles.t": "Peleș Castle",
    "exp.peles.d": "Sinaia's neo-Renaissance jewel and former summer residence of Romania's kings, just ~2 km from TUI Villa. Nearby, Pelișor Castle and Sinaia Monastery (600 m away) round off an unforgettable day.",
    "exp.ski.t": "Skiing in Sinaia",
    "exp.ski.d": "Sinaia's slopes sit at 2000 m altitude — the best high-altitude skiing in Romania. Direct access from the centre by cable car (Cota 1400 → Cota 2000), with off-piste options and good snow late into the season. Perfect for skiing, snowboarding and telemark.",
    "exp.touring.t": "Ski touring",
    "exp.touring.d": "Ski touring combines the technical pleasure of alpine skiing with the freedom of cross-country. The Bucegi plateau (2000 m) creates a unique environment, with spectacular descents toward the Prahova Valley — from mild routes around Sinaia to ~1500 m descents near Omu Peak. Montania offers the only ski touring guide of the Bucegi and, on request, experienced guides.",
    "exp.touring.routes": "Recommended routes",
    "exp.route.duration": "Duration",
    "exp.route.difficulty": "Difficulty",
    "exp.route1.t": "Facing the Sun",
    "exp.route1.d": "From the Bușteni cable car, over Cocora Peak, through the Cocora and Laptici saddles, up to Cota 2000 and down to Sinaia.",
    "exp.route1.dur": "4–5 hours",
    "exp.route1.dif": "Medium · 3.5/5",
    "exp.route2.t": "Vânturiș",
    "exp.route2.d": "From Sinaia up to Cota 2000 and Vârful cu Dor (2030 m), descending toward the Vânturiș Valley and back via the Cliru Valley.",
    "exp.route2.dur": "4–5 hours",
    "exp.route2.dif": "Medium · 3/5",
    "exp.route3.t": "Cerbului Valley",
    "exp.route3.d": "From Babele hut toward Omu Peak and a technical descent down the Cerbului Valley, below Colții Obârșiei (2480 m). Alpine terrain, experts only.",
    "exp.route3.dur": "4–5 hours",
    "exp.route3.dif": "Difficult · 5/5",
    "exp.bike.t": "Mountain biking",
    "exp.bike.d": "In summer, the Bucegi become a paradise for mountain biking. From gentle forest roads on the plateau to technical descents toward Sinaia. The cable car lifts you to 2000 m and you choose your descent.",
    "exp.hike.t": "Hiking & trails",
    "exp.hike.d": "Trails for every level start right in Sinaia: toward Vârful cu Dor, Furnica, Piatra Arsă, Babele and the Sphinx, up to Omu Peak (2505 m). Unforgettable panoramas and a world of relaxation and adventure.",
    "exp.safety": "In winter, before any tour, check the avalanche risk published by ANM and the Salvamont Sinaia bulletin (posted at Cota 2000).",
    "exp.cta.t": "Ready for the mountains?",
    "exp.cta.d": "Stay central at TUI Villa and have it all within reach.",

    "vila.hero.title": "TUI Villa · Sinaia",
    "vila.hero.sub": "Ultra-central stay on Aosta Street — 5 min to the cable car, 600 m to Sinaia Monastery and 2 km to Peleș Castle.",
    "vila.hero.book": "Check availability",

    "vila.feat.eyebrow": "Why TUI Villa",
    "vila.feat.title": "Comfort in the heart of the resort",
    "vila.feat.1.t": "Ultra-central location",
    "vila.feat.1.d": "Steps from the cable car, restaurants and the park.",
    "vila.feat.2.t": "Supervised parking",
    "vila.feat.2.d": "Private, video-monitored parking on site.",
    "vila.feat.3.t": "Garden & BBQ",
    "vila.feat.3.d": "Relaxing space with barbecue, tables and benches.",
    "vila.feat.4.t": "Holiday vouchers",
    "vila.feat.4.d": "We accept holiday vouchers, paper and card.",

    "vila.rooms.eyebrow": "Accommodation",
    "vila.rooms.title": "Our rooms",
    "vila.rooms.text": "Prices per night. Availability is updated regularly.",
    "vila.rooms.book": "Book this room",
    "vila.rooms.persons": "guests",
    "vila.rooms.person": "guest",

    "vila.book.eyebrow": "Direct booking",
    "vila.book.title": "Check availability & request your stay",
    "vila.book.text": "Pick a room and dates on the calendar. We'll prepare a summary, then send the request — we confirm quickly.",
    "vila.book.room": "Room",
    "vila.book.checkin": "Check-in",
    "vila.book.checkout": "Check-out",
    "vila.book.pickdates": "Select dates on the calendar",
    "vila.book.nights": "nights",
    "vila.book.night": "night",
    "vila.book.total": "Estimated total",
    "vila.book.name": "Name",
    "vila.book.guests": "Number of guests",
    "vila.book.message": "Message (optional)",
    "vila.book.send": "Send booking request",
    "vila.book.whatsapp": "Ask on WhatsApp",
    "vila.book.bookingcom": "Or book on Booking.com",
    "vila.book.legend.avail": "Available",
    "vila.book.legend.booked": "Booked",
    "vila.book.legend.selected": "Selected",
    "vila.book.note": "No online payment. Your request reaches us and we reply with a confirmation.",

    "bio.hero.title": "Bio de Maramu'",
    "bio.hero.sub": "Clean cheese, patiently made at the sheepfold, in the heart of Maramureș.",
    "bio.story.eyebrow": "The story",
    "bio.story.title": "The taste of old times, carefully kept",
    "bio.story.text": "In Maramureș, time flows differently. Animals graze freely on the meadows, the milk is fresh, and the cheese is made by hand, without rush and without additives. Bio de Maramu' is our way of carrying on the taste of childhood — authentic, clean, from the mountains.",
    "bio.products.eyebrow": "Our products",
    "bio.products.title": "What we make at the farm",
    "bio.products.text": "Small-batch production, depending on the season. For details, give us a call.",
    "bio.products.note": "Showcase only for now — contact us directly to order.",
    "bio.cta": "Ask about products",

    "bv.eyebrow": "And one more good thing",
    "bv.title": "Vegetables & potatoes, Brașov area",
    "bv.text": "We also recommend the fresh produce of our family in the Brașov area — straight from the grower.",
    "bv.order": "Orders by phone",

    "contact.hero.title": "Contact",
    "contact.hero.sub": "We're here for bookings and questions — in the mountains and at the farm.",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.address": "Address",
    "contact.title": "Let's talk",

    "footer.tag": "One family, two mountains, authentic Romanian flavors.",
    "footer.explore": "Explore",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.legal": "Terms & Privacy",

    "alert.pickroom": "Please select a room and dates.",
    "alert.thanks": "Thank you! Your request has been prepared to send."
  }
};

function getLang() { return localStorage.getItem("montania_lang") || "ro"; }
function setLang(lang) {
  localStorage.setItem("montania_lang", lang);
  applyI18n(lang);
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-toggle button").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}
function t(key, lang) { lang = lang || getLang(); return (I18N[lang] && I18N[lang][key]) || (I18N.ro[key]) || key; }
function applyI18n(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.setAttribute("placeholder", t(el.dataset.i18nPh, lang));
  });
}
