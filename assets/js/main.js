/* =====================================================================
   MONTANIA — main.js
   Navigație, camere, produse + calendar de disponibilitate (rezervare directă)
   ===================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  // ---- Live prices & availability (managed from /admin); falls back to data.js ----
  await loadLiveData();

  // ---- Language init ----
  setLang(getLang());
  document.querySelectorAll(".lang-toggle button").forEach(btn => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  // ---- Mobile nav ----
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) burger.addEventListener("click", () => links.classList.toggle("open"));

  // ---- Inject shared contact details ----
  injectContact();

  // ---- Page-specific renders ----
  renderRooms();
  renderBioProducts();
  renderBioMeats();
  renderBV();
  initBooking();
  initReviews();
  initFeed();
  renderHeroPhotoDate();
  trackVisit();
  injectAnalytics();

  document.addEventListener("langchange", () => {
    injectContact();
    renderRooms();
    renderBioProducts();
    renderBioMeats();
    renderBV();
    renderHeroPhotoDate();
    if (document.getElementById("calendar")) { renderCalendar(); updateSummary(); renderRateTable(); }
  });
});

/* ---------------- Cloudflare Web Analytics (optional) ---------------- */
function injectAnalytics() {
  try {
    const token = (typeof SITE !== "undefined" && SITE.analytics && SITE.analytics.cfToken) || "";
    if (!token) return;                                  // not configured yet
    if (location.pathname.startsWith("/admin")) return;  // don't track the admin area
    if (document.getElementById("cf-beacon")) return;    // avoid double injection
    const s = document.createElement("script");
    s.id = "cf-beacon";
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token }));
    document.head.appendChild(s);
  } catch (e) { /* analytics must never break the page */ }
}

/* ---------------- Private visit counter (beacon) ---------------- */
function trackVisit() {
  try {
    const p = location.pathname || "/";
    if (p.startsWith("/admin")) return;                 // never count the admin area
    if (localStorage.getItem("montania_owner") === "1") return; // don't count the owner
    const body = JSON.stringify({ path: p });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/hit", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/hit", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
    }
  } catch (e) { /* analytics must never break the page */ }
}

/* ---------------- Hero photo date (timeline stamp) ---------------- */
const MONTHS_FULL = {
  ro: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  it: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
};
function fmtPhotoDate(iso, lang) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  const months = MONTHS_FULL[lang] || MONTHS_FULL.ro;
  const day = +m[3], mon = months[+m[2] - 1], y = m[1];
  if (lang === "en") return `${mon} ${day}, ${y}`;
  if (lang === "de") return `${day}. ${mon} ${y}`;
  return `${day} ${mon} ${y}`;
}
function renderHeroPhotoDate() {
  const el = document.getElementById("hero-photo-date");
  if (!el) return;
  const d = (typeof SITE !== "undefined" && SITE.heroPhoto) ? SITE.heroPhoto.date : "";
  el.textContent = d ? `\u{1F4F7} ${fmtPhotoDate(d, getLang())}` : "";
}

/* Pull live rooms/prices/availability from the API (Cloudflare Function).
   On local preview or if the API is unavailable, we keep the static data.js values. */
async function loadLiveData() {
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) return;
    const live = await res.json();
    // Room structure (names, photos, amenities) stays in data.js;
    // only base price / units / availability are overridden from the DB.
    if (live && live.prices) {
      SITE.rooms.forEach(r => {
        const o = live.prices[r.id];
        if (o) {
          if (o.price != null) r.price = o.price;
          if (o.units != null) r.units = o.units;
        }
      });
    }
    if (live && live.availability) SITE.availability = live.availability;
  } catch (e) { /* offline / local preview — use static data.js */ }
}

/* ---------------- Helpers ---------------- */
function ymd(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function parseYmd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function L(obj) { return obj[getLang()] || obj.ro; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* Per-day price & availability for a room type.
   Falls back to the room's base price and total units when no override exists. */
function roomAvail(room) { return (SITE.availability && SITE.availability[room.id]) || {}; }
function dayInfo(room, key) {
  const ov = roomAvail(room)[key];
  const units = room.units != null ? room.units : 1;
  const a = ov && ov.a != null ? ov.a : units;
  const p = ov && ov.p != null ? ov.p : room.price;
  return { a, p };
}

/* ---------------- Contact injection ---------------- */
function injectContact() {
  const c = SITE.contact;
  document.querySelectorAll("[data-contact='phone']").forEach(e => { e.textContent = c.phone; if (e.tagName === "A") e.href = "tel:" + c.phone.replace(/\s/g, ""); });
  document.querySelectorAll("[data-contact='email']").forEach(e => { e.textContent = c.email; if (e.tagName === "A") e.href = "mailto:" + c.email; });
  document.querySelectorAll("[data-contact='address']").forEach(e => { e.textContent = getLang() === "ro" ? c.addressRo : c.addressEn; });
  document.querySelectorAll("[data-contact='maps']").forEach(e => { e.href = c.mapsUrl; });
  document.querySelectorAll("[data-contact='facebook']").forEach(e => { if (c.facebook) { e.href = c.facebook; } else { e.style.display = "none"; } });
  document.querySelectorAll("[data-contact='whatsapp']").forEach(e => { e.href = "https://wa.me/" + c.whatsapp; });
  document.querySelectorAll("[data-contact='booking']").forEach(e => { e.href = c.bookingUrl; });
  document.querySelectorAll("[data-contact='score']").forEach(e => { e.textContent = c.bookingScore; });
  document.querySelectorAll("[data-contact='reviews']").forEach(e => { e.textContent = t("home.reviews.based").replace("{n}", c.bookingReviews); });
}

/* ---------------- Rooms grid ---------------- */
function renderRooms() {
  const grid = document.getElementById("rooms-grid");
  if (!grid) return;
  const lang = getLang();
  grid.innerHTML = SITE.rooms.map(r => `
    <div class="card">
      <div class="rate-thumb-wrap" data-detail="${r.id}" style="width:100%">
        <img src="${r.img}" alt="${L(r.name)}" loading="lazy">
        <span class="thumb-badge">📷 ${(r.gallery || [r.img]).length}</span>
      </div>
      <div class="card-body">
        <h3 class="rdetail" data-detail="${r.id}">${L(r.name)}</h3>
        <div class="pills">${featurePills(r)}</div>
        <button class="link-btn" data-detail="${r.id}">${t("room.details")}</button>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px">
          <span class="price-tag">${t("rate.from")} ${r.price} <small>RON / ${t("vila.book.night")}</small></span>
          <button class="btn btn-primary" data-bookroom="${r.id}">${t("vila.rooms.book")}</button>
        </div>
      </div>
    </div>`).join("");

  grid.querySelectorAll("[data-bookroom]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    });
  });
  grid.querySelectorAll("[data-detail]").forEach(el => el.addEventListener("click", () => openRoomDetail(el.dataset.detail)));
}

/* ---------------- Bio products ---------------- */
function renderBioProducts() {
  const grid = document.getElementById("bio-grid");
  if (!grid) return;
  grid.innerHTML = SITE.bioProducts.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${L(p.name)}" loading="lazy">
      <div class="card-body">
        <h3>${L(p.name)}</h3>
        <p style="color:var(--muted)">${L(p.desc)}</p>
      </div>
    </div>`).join("");
}

/* ---------------- Bio meats ---------------- */
function renderBioMeats() {
  const grid = document.getElementById("bio-meat-grid");
  if (!grid || !SITE.bioMeats) return;
  grid.innerHTML = SITE.bioMeats.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${L(p.name)}" loading="lazy">
      <div class="card-body">
        <h3>${L(p.name)}</h3>
        <p style="color:var(--muted)">${L(p.desc)}</p>
      </div>
    </div>`).join("");
}

/* ---------------- BV produce (secondary) ---------------- */
function renderBV() {
  const grid = document.getElementById("bv-grid");
  if (!grid) return;
  const phoneEl = document.getElementById("bv-phone");
  if (phoneEl) phoneEl.innerHTML = `<a href="tel:${SITE.bv.phone.replace(/\s/g, "")}">${SITE.bv.phone}</a>`;
  grid.innerHTML = SITE.bv.products.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${L(p.name)}" loading="lazy">
      <div class="card-body">
        <h3 style="font-size:1.15rem">${L(p.name)}</h3>
        <span class="price-tag" style="font-size:1.2rem">${p.price}</span>
      </div>
    </div>`).join("");
}

/* ---------------- Pictograms (Booking-style) ---------------- */
function svg(paths) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
const ICONS = {
  guests: svg('<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>'),
  size: svg('<path d="M3 9V3h6"/><path d="M21 15v6h-6"/><path d="M3 3l7 7"/><path d="M21 21l-7-7"/>'),
  bed: svg('<path d="M3 18v-6h18v6"/><path d="M3 12V7h7v5"/><path d="M3 18v2M21 18v2"/>'),
  balcony: svg('<path d="M4 21V10h16v11"/><path d="M4 14h16"/><path d="M8 14v7M12 14v7M16 14v7"/><path d="M6 10V6h12v4"/>'),
  view: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>'),
  garden_view: svg('<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 7-6 10-7"/>'),
  courtyard_view: svg('<path d="M12 2c3 2 4 5 4 7a4 4 0 0 1-8 0c0-2 1-5 4-7z"/><path d="M12 13v8"/>'),
  bath: svg('<path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/>'),
  tv: svg('<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M9 21h6M12 17v4"/>'),
  sound: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9a4 4 0 0 1 0 6"/>'),
  wifi: svg('<path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5 12a11 11 0 0 1 14 0"/><path d="M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>'),
  kitchenette: svg('<path d="M6 3v8M4 3v4a2 2 0 0 0 4 0V3M6 11v10"/><path d="M16 3c-2 0-3 2-3 5s1 4 3 4 3-1 3-4-1-5-3-5zM16 12v9"/>'),
  coffee: svg('<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M17 9h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 3v2M11 3v2"/>'),
  heating: svg('<path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 0-1.5-.5-2 2 1.5 3 3.5 3 5.5a4.5 4.5 0 0 1-9 0C7.5 9 12 7 12 3z"/>'),
  accessible: svg('<circle cx="11" cy="4" r="1.6"/><path d="M11 6v6h5l3 6"/><path d="M11 12a5 5 0 1 0 4 8"/>')
};
const FLABEL = {
  balcony: { ro: "Balcon", en: "Balcony", fr: "Balcon", it: "Balcone", de: "Balkon" },
  view: { ro: "Vedere", en: "View", fr: "Vue", it: "Vista", de: "Aussicht" },
  garden_view: { ro: "Vedere la grădină", en: "Garden view", fr: "Vue sur le jardin", it: "Vista giardino", de: "Gartenblick" },
  courtyard_view: { ro: "Vedere la curtea interioară", en: "Inner courtyard view", fr: "Vue sur la cour intérieure", it: "Vista cortile interno", de: "Blick auf den Innenhof" },
  bath: { ro: "Baie privată", en: "Private bathroom", fr: "Salle de bain privée", it: "Bagno privato", de: "Eigenes Bad" },
  tv: { ro: "TV cu ecran plat", en: "Flat-screen TV", fr: "TV à écran plat", it: "TV a schermo piatto", de: "Flachbild-TV" },
  sound: { ro: "Izolare fonică", en: "Soundproofing", fr: "Insonorisation", it: "Insonorizzazione", de: "Schallisolierung" },
  wifi: { ro: "WiFi gratuit", en: "Free WiFi", fr: "WiFi gratuit", it: "WiFi gratuito", de: "Kostenloses WLAN" },
  kitchenette: { ro: "Chicinetă privată", en: "Private kitchenette", fr: "Kitchenette privée", it: "Angolo cottura privato", de: "Eigene Küchenzeile" },
  coffee: { ro: "Ceai/cafea", en: "Tea/coffee", fr: "Thé/café", it: "Tè/caffè", de: "Tee/Kaffee" },
  heating: { ro: "Încălzire", en: "Heating", fr: "Chauffage", it: "Riscaldamento", de: "Heizung" },
  accessible: { ro: "Acces la parter", en: "Step-free access", fr: "Accès de plain-pied", it: "Accesso senza gradini", de: "Stufenloser Zugang" }
};
const BEDLABEL = {
  double: { ro: "1 pat dublu mare", en: "1 large double bed", fr: "1 grand lit double", it: "1 letto matrimoniale grande", de: "1 großes Doppelbett" },
  triple: { ro: "Pat dublu + 1 loc / canapea", en: "Double bed + 1 / sofa", fr: "Lit double + 1 / canapé", it: "Letto matrimoniale + 1 / divano", de: "Doppelbett + 1 / Sofa" },
  two_double: { ro: "2 dormitoare · 2 paturi duble", en: "2 bedrooms · 2 double beds", fr: "2 chambres · 2 lits doubles", it: "2 camere · 2 letti matrimoniali", de: "2 Schlafzimmer · 2 Doppelbetten" }
};
function pill(icon, label) { return `<span class="pill">${icon || ""}<span>${label}</span></span>`; }
function featurePills(room) {
  const lang = getLang();
  const out = [];
  out.push(pill(ICONS.guests, room.capacity + " " + (room.capacity === 1 ? t("vila.rooms.person") : t("vila.rooms.persons"))));
  out.push(pill(ICONS.size, room.size + " m²"));
  if (room.bed && BEDLABEL[room.bed]) out.push(pill(ICONS.bed, BEDLABEL[room.bed][lang] || BEDLABEL[room.bed].ro));
  (room.features || []).forEach(f => { if (FLABEL[f]) out.push(pill(ICONS[f], FLABEL[f][lang] || FLABEL[f].ro)); });
  return out.join("");
}

/* ---------------- Booking / availability ---------------- */
const booking = { state: { checkIn: null, checkOut: null, viewYear: 0, viewMonth: 0 } };

function initBooking() {
  const cal = document.getElementById("calendar");
  if (!cal) return;
  const now = startOfDay(new Date());
  booking.state.viewYear = now.getFullYear();
  booking.state.viewMonth = now.getMonth();
  document.getElementById("f-adults")?.addEventListener("change", renderRateTable);
  document.getElementById("f-children")?.addEventListener("change", () => { renderChildAges(); renderRateTable(); });
  document.getElementById("child-ages")?.addEventListener("change", renderRateTable);
  renderChildAges();
  renderCalendar();
  updateSummary();
  renderRateTable();
}

/* ---------------- Occupancy (adults + children with ages) ---------------- */
const CHILD_FREE_MAX = 5; // children up to (and including) this age don't need extra capacity

function renderChildAges() {
  const wrap = document.getElementById("child-ages");
  if (!wrap) return;
  const n = parseInt(document.getElementById("f-children")?.value || "0", 10);
  const lang = getLang();
  if (!n) { wrap.innerHTML = ""; return; }
  let html = "";
  for (let i = 0; i < n; i++) {
    let opts = "";
    for (let a = 0; a <= 17; a++) {
      const label = a === 0 ? "<1 " + t("vila.book.years") : a + " " + t("vila.book.years");
      opts += `<option value="${a}">${label}</option>`;
    }
    html += `<div class="occ-ctl child-age">
      <span class="occ-lbl">${t("vila.book.childage")} ${i + 1}</span>
      <select class="f-child-age">${opts}</select>
    </div>`;
  }
  wrap.innerHTML = `<div class="occ-row occ-row-ages">${html}</div>`;
}

function occupancy() {
  const adults = parseInt(document.getElementById("f-adults")?.value || "2", 10);
  const ageEls = document.querySelectorAll("#child-ages .f-child-age");
  const childAges = Array.from(ageEls).map(el => parseInt(el.value || "0", 10));
  const childrenNeedingBed = childAges.filter(a => a > CHILD_FREE_MAX).length;
  const effective = Math.max(1, adults + childrenNeedingBed);
  return { adults, children: childAges.length, childAges, effective };
}

function shiftMonth(delta) {
  let m = booking.state.viewMonth + delta;
  let y = booking.state.viewYear;
  if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
  booking.state.viewMonth = m; booking.state.viewYear = y;
  renderCalendar();
}

/* Room-agnostic date-range calendar */
function renderCalendar() {
  const cal = document.getElementById("calendar");
  if (!cal) return;
  const lang = getLang();
  const { viewYear: y, viewMonth: m } = booking.state;
  const today = startOfDay(new Date());

  const monthName = new Date(y, m, 1).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { month: "long", year: "numeric" });
  const dows = lang === "en" ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] : ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

  let firstDow = new Date(y, m, 1).getDay();
  firstDow = (firstDow + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  let html = `
    <div class="cal-head">
      <button id="cal-prev2" type="button" aria-label="prev">‹</button>
      <div class="cal-title">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
      <button id="cal-next2" type="button" aria-label="next">›</button>
    </div>
    <div class="cal-grid">${dows.map(d => `<div class="cal-dow">${d}</div>`).join("")}`;

  const ci = booking.state.checkIn, co = booking.state.checkOut;
  const cell = (date, outside) => {
    const key = ymd(date);
    let cls = "cal-day", clickable = true;
    if (outside) cls += " outside";
    if (date < today) { cls += " past"; clickable = false; }
    else cls += " available";
    if (ci && key === ymd(ci)) cls += " selected";
    else if (co && key === ymd(co)) cls += " selected";
    else if (ci && co && date > ci && date < co) cls += " in-range";
    return `<div class="${cls}" ${clickable ? `data-day="${key}"` : ""}><span class="cal-num">${date.getDate()}</span></div>`;
  };

  // Leading days from the previous month (continuous calendar).
  for (let i = firstDow; i > 0; i--) html += cell(new Date(y, m, 1 - i), true);
  // Days of the current month.
  for (let day = 1; day <= daysInMonth; day++) html += cell(new Date(y, m, day), false);
  // Trailing days from the next month to complete the last week row.
  const trailing = (7 - ((firstDow + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= trailing; i++) html += cell(new Date(y, m, daysInMonth + i), true);
  html += `</div>`;
  cal.innerHTML = html;

  cal.querySelector("#cal-prev2").addEventListener("click", () => shiftMonth(-1));
  cal.querySelector("#cal-next2").addEventListener("click", () => shiftMonth(1));
  cal.querySelectorAll("[data-day]").forEach(el => el.addEventListener("click", () => onDayClick(el.dataset.day)));
}

function onDayClick(key) {
  const date = parseYmd(key);
  const s = booking.state;
  if (!s.checkIn || (s.checkIn && s.checkOut)) { s.checkIn = date; s.checkOut = null; }
  else if (date > s.checkIn) { s.checkOut = date; }
  else { s.checkIn = date; s.checkOut = null; }
  renderCalendar(); updateSummary(); renderRateTable();
}

function nightsBetween(a, b) { return Math.round((b - a) / 86400000); }

function updateSummary() {
  const box = document.getElementById("summary");
  if (!box) return;
  const s = booking.state;
  if (!s.checkIn) { box.innerHTML = `<span style="color:var(--muted)">${t("vila.book.pickdates")}</span>`; return; }
  if (!s.checkOut) { box.innerHTML = `<strong>${t("vila.book.checkin")}:</strong> ${ymd(s.checkIn)} — <span style="color:var(--muted)">${t("vila.book.pickout")}</span>`; return; }
  const n = nightsBetween(s.checkIn, s.checkOut);
  box.innerHTML = `<strong>${ymd(s.checkIn)} → ${ymd(s.checkOut)}</strong> · ${n} ${n === 1 ? t("vila.book.night") : t("vila.book.nights")}`;
}

/* Pricing horizon: nights ON/AFTER this date have no published price yet —
   the villa is still open, but the guest is invited to request a quote. */
function pricingHorizon() {
  const d = (typeof SITE !== "undefined" && SITE.booking && SITE.booking.pricingUntil) ? SITE.booking.pricingUntil : null;
  return d ? parseYmd(d) : null;
}
function dayNeedsQuote(date) {
  const h = pricingHorizon();
  return h ? startOfDay(date) >= h : false;
}
/* Does the current selection fall (partly) beyond the pricing horizon? */
function selectionNeedsQuote() {
  const s = booking.state;
  if (!s.checkIn) return false;
  if (s.checkOut) {
    const lastNight = new Date(s.checkOut); lastNight.setDate(lastNight.getDate() - 1);
    return dayNeedsQuote(lastNight) || dayNeedsQuote(s.checkIn);
  }
  return dayNeedsQuote(s.checkIn);
}

/* Price + availability of a room for the selected range */
function roomRangeInfo(room) {
  const s = booking.state;
  if (!s.checkIn || !s.checkOut) return { complete: false, available: true, quote: dayNeedsQuote(s.checkIn || new Date(0)), perNight: room.price };
  let total = 0, available = true, quote = false;
  const booked = new Set(room.booked || []);
  const d = new Date(s.checkIn);
  while (d < s.checkOut) {
    const key = ymd(d);
    if (dayNeedsQuote(d)) quote = true;
    const info = dayInfo(room, key);
    if (info.a <= 0 || booked.has(key)) available = false;
    total += info.p;
    d.setDate(d.getDate() + 1);
  }
  const n = nightsBetween(s.checkIn, s.checkOut);
  return { complete: true, available, quote, nights: n, total, perNight: Math.round(total / n) };
}

/* All-rooms rate table for the selected period (Booking-style) */
function renderRateTable() {
  const wrap = document.getElementById("rate-table");
  if (!wrap) return;
  const night = t("vila.book.night");
  const occ = occupancy();
  const fitting = SITE.rooms.filter(room => room.capacity >= occ.effective);
  if (!fitting.length) {
    wrap.innerHTML = `<div class="rate-empty">${t("rate.none")}</div>`;
    return;
  }
  const rows = fitting.map(room => {
    const ri = roomRangeInfo(room);
    let priceHtml, availHtml, btn;
    if (ri.quote) {
      priceHtml = `<div class="rate-quote">${t("rate.quote.price")}</div>`;
      availHtml = `<span class="badge-soon">${t("rate.quote.badge")}</span>`;
      btn = `<button class="btn btn-primary" type="button" data-reserve="${room.id}">${t("rate.quote.cta")}</button>`;
    } else if (ri.complete && ri.available) {
      priceHtml = `<div class="rate-price">${ri.total} <small>RON</small></div><div class="rate-sub">${ri.nights} ${ri.nights === 1 ? night : t("vila.book.nights")} · ${ri.perNight} RON/${night}</div>`;
      availHtml = `<span class="badge-ok">${t("rate.available")}</span>`;
      btn = `<button class="btn btn-primary" type="button" data-reserve="${room.id}">${t("vila.book.whatsapp")}</button>`;
    } else if (ri.complete && !ri.available) {
      priceHtml = `<div class="rate-sub">${t("rate.from")} ${room.price} RON/${night}</div>`;
      availHtml = `<span class="badge-no">${t("rate.sold")}</span>`;
      btn = `<button class="btn btn-outline" type="button" disabled>${t("rate.sold")}</button>`;
    } else {
      priceHtml = `<div class="rate-pickdates">${t("rate.selectdates")}</div>`;
      availHtml = "";
      btn = `<button class="btn btn-primary" type="button" data-reserve="${room.id}">${t("vila.book.whatsapp")}</button>`;
    }
    const nphotos = (room.gallery || [room.img]).length;
    return `<div class="rate-row">
      <div class="rate-thumb-wrap" data-detail="${room.id}">
        <img class="rate-thumb" src="${room.img}" alt="${L(room.name)}" loading="lazy">
        <span class="thumb-badge">📷 ${nphotos}</span>
      </div>
      <div class="rate-main">
        <h3 class="rdetail" data-detail="${room.id}">${L(room.name)}</h3>
        <div class="pills">${featurePills(room)}</div>
        <button class="link-btn" data-detail="${room.id}">${t("room.details")}</button>
        ${availHtml}
      </div>
      <div class="rate-side">${priceHtml}${btn}</div>
    </div>`;
  }).join("");
  const note = selectionNeedsQuote() ? `<div class="rate-note">${t("rate.quote.note")}</div>` : "";
  wrap.innerHTML = note + rows;
  wrap.querySelectorAll("[data-reserve]").forEach(b => b.addEventListener("click", () => reserveRoom(b.dataset.reserve)));
  wrap.querySelectorAll("[data-detail]").forEach(el => el.addEventListener("click", () => openRoomDetail(el.dataset.detail)));
}

/* ---------------- Room detail (Booking-style) ---------------- */
const roomDetail = { imgs: [], cur: 0 };
function rmShow(i) {
  const m = document.getElementById("room-modal"); if (!m) return;
  const n = roomDetail.imgs.length; if (!n) return;
  roomDetail.cur = (i + n) % n;
  m.querySelector(".rm-main").src = roomDetail.imgs[roomDetail.cur];
  m.querySelectorAll(".rm-thumbs img").forEach((th, j) => th.classList.toggle("active", j === roomDetail.cur));
}
function rmClose() { const m = document.getElementById("room-modal"); if (m) m.classList.remove("open"); }
function openRoomDetail(roomId) {
  const room = SITE.rooms.find(r => r.id === roomId); if (!room) return;
  const imgs = (room.gallery && room.gallery.length) ? room.gallery.slice() : [room.img];
  roomDetail.imgs = imgs; roomDetail.cur = 0;
  let m = document.getElementById("room-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "room-modal"; m.className = "room-modal";
    document.body.appendChild(m);
    document.addEventListener("keydown", e => {
      if (!m.classList.contains("open")) return;
      if (e.key === "Escape") rmClose();
      else if (e.key === "ArrowLeft") rmShow(roomDetail.cur - 1);
      else if (e.key === "ArrowRight") rmShow(roomDetail.cur + 1);
    });
  }
  const ri = roomRangeInfo(room);
  const night = t("vila.book.night");
  const priceLine = ri.quote
    ? `<div class="rate-quote">${t("rate.quote.price")}</div>`
    : (ri.complete && ri.available)
      ? `<div class="rate-price">${ri.total} <small>RON · ${ri.nights} ${ri.nights === 1 ? night : t("vila.book.nights")}</small></div>`
      : `<div class="rate-price">${t("rate.from")} ${room.price} <small>RON/${night}</small></div>`;
  const reserveLabel = ri.quote ? t("rate.quote.cta") : t("vila.book.whatsapp");
  m.innerHTML = `
    <div class="rm-backdrop"></div>
    <div class="rm-dialog">
      <button class="rm-close" aria-label="Close">&times;</button>
      <div class="rm-gallery">
        <button class="rm-nav rm-prev" aria-label="prev">‹</button>
        <img class="rm-main" src="${imgs[0]}" alt="${esc(L(room.name))}">
        <button class="rm-nav rm-next" aria-label="next">›</button>
      </div>
      <div class="rm-thumbs">${imgs.map((src, i) => `<img data-i="${i}" class="${i === 0 ? "active" : ""}" src="${src}" alt="" loading="lazy">`).join("")}</div>
      <div class="rm-body">
        <h2>${esc(L(room.name))}</h2>
        <div class="pills">${featurePills(room)}</div>
        <div class="rm-foot">
          ${priceLine}
          <button class="btn btn-primary" id="rm-reserve">${reserveLabel}</button>
        </div>
      </div>
    </div>`;
  m.querySelectorAll(".rm-thumbs img").forEach(th => th.addEventListener("click", () => rmShow(parseInt(th.dataset.i, 10))));
  m.querySelector(".rm-prev").addEventListener("click", () => rmShow(roomDetail.cur - 1));
  m.querySelector(".rm-next").addEventListener("click", () => rmShow(roomDetail.cur + 1));
  m.querySelector(".rm-close").addEventListener("click", rmClose);
  m.querySelector(".rm-backdrop").addEventListener("click", rmClose);
  m.querySelector("#rm-reserve").addEventListener("click", () => { rmClose(); reserveRoom(room.id); });
  m.classList.add("open");
}

function reserveRoom(id) {
  const room = SITE.rooms.find(r => r.id === id);
  if (!room) return;
  const s = booking.state;
  const o = occupancy();
  let guests = `${o.adults} ${t("vila.book.adults").toLowerCase()}`;
  if (o.children) {
    const ages = o.childAges.map(a => (a === 0 ? "<1" : a)).join(", ");
    guests += `, ${o.children} ${t("vila.book.children").toLowerCase()} (${ages} ${t("vila.book.years")})`;
  }
  let ri = null;
  if (s.checkIn && s.checkOut) ri = roomRangeInfo(room);
  const isQuote = ri ? ri.quote : selectionNeedsQuote();
  const lines = [
    isQuote ? t("msg.quote.title") : t("msg.book.title"),
    "🌐 via montania.ro",
    `${t("vila.book.room")}: ${L(room.name)}`,
    `${t("vila.book.checkin")}: ${s.checkIn ? ymd(s.checkIn) : "-"}`,
    `${t("vila.book.checkout")}: ${s.checkOut ? ymd(s.checkOut) : "-"}`,
    `${t("vila.book.guests")}: ${guests}`
  ];
  if (isQuote) {
    lines.push(t("msg.quote.ask"));
  } else if (ri) {
    lines.push(`${t("vila.book.total")}: ${ri.total} RON (${ri.nights} ${ri.nights === 1 ? t("vila.book.night") : t("vila.book.nights")})`);
  }
  // Record the request so it shows up in /admin (best-effort; never blocks WhatsApp)
  try {
    fetch("/api/booking", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roomId: room.id, roomName: L(room.name),
        checkIn: s.checkIn ? ymd(s.checkIn) : "", checkOut: s.checkOut ? ymd(s.checkOut) : "",
        nights: ri ? ri.nights : null, guests, total: (ri && !ri.quote) ? ri.total : null, quote: isQuote
      })
    }).catch(() => {});
  } catch (e) { /* ignore */ }
  window.open(`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
}

/* ---------------- Reviews (public) ---------------- */
function initReviews() {
  const list = document.getElementById("reviews-list");
  if (!list) return;
  loadReviews();
  const form = document.getElementById("review-form");
  if (form) form.addEventListener("submit", submitReview);
}
async function loadReviews() {
  const list = document.getElementById("reviews-list");
  if (!list) return;
  let apiReviews = [];
  try {
    const res = await fetch("/api/reviews", { cache: "no-store" });
    const data = await res.json();
    apiReviews = data.reviews || [];
  } catch (e) { /* offline / local preview */ }
  const seed = (typeof SITE !== "undefined" && SITE.seedReviews) ? SITE.seedReviews : [];
  const all = seed.concat(apiReviews).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  renderReviews(all);
}

const RO_MON = ["ian.", "feb.", "mart.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
function fmtReviewDate(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ""));
  if (!m) return esc(d || "");
  return `${+m[3]} ${RO_MON[+m[2] - 1]} ${m[1]}`;
}
function fmtScore(n) {
  const v = Number(n);
  if (!isFinite(v)) return esc(String(n));
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
}
function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return "";
  return cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
function reviewCats(r) {
  if (!r.cats) return "";
  const lang = getLang();
  const L = {
    ro: { curatenie: "Curățenie", confort: "Confort", locatie: "Locație" },
    en: { curatenie: "Cleanliness", confort: "Comfort", locatie: "Location" },
    fr: { curatenie: "Propreté", confort: "Confort", locatie: "Emplacement" },
    it: { curatenie: "Pulizia", confort: "Comfort", locatie: "Posizione" },
    de: { curatenie: "Sauberkeit", confort: "Komfort", locatie: "Lage" }
  };
  const lbl = L[lang] || L.ro;
  const items = ["curatenie", "confort", "locatie"]
    .filter(k => r.cats[k] != null)
    .map(k => `<span class="rev-cat">${lbl[k]} <strong>${fmtScore(r.cats[k])}</strong></span>`);
  return items.length ? `<div class="rev-cats">${items.join("")}</div>` : "";
}
function renderReviews(reviews) {
  const list = document.getElementById("reviews-list");
  if (!list) return;
  const countEl = document.getElementById("reviews-count");
  if (countEl) countEl.textContent = reviews.length;
  if (!reviews.length) { list.innerHTML = `<p style="color:var(--muted)">${t("rev.none")}</p>`; return; }
  list.innerHTML = reviews.map(r => {
    const booking = r.source === "booking";
    const flag = flagEmoji(r.cc);
    return `
    <div class="review${booking ? " review--booking" : ""}">
      <div class="review-top">
        <span class="review-score">${fmtScore(r.rating)}</span>
        <div class="review-meta">
          <strong>${esc(r.author)}</strong>${flag ? ` <span class="rev-flag">${flag}</span>` : ""}${r.country ? ` <span class="rev-country">${esc(r.country)}</span>` : ""}
          <div class="review-date">${fmtReviewDate(r.date)}${booking ? ` <span class="rev-source">Booking.com</span>` : ""}</div>
        </div>
      </div>
      ${r.text ? `<p class="review-text">${esc(r.text)}</p>` : ""}
      ${booking ? reviewCats(r) : ""}
      ${r.reply ? `<div class="review-reply"><strong>${t("rev.reply")}:</strong> ${esc(r.reply)}</div>` : ""}
    </div>`;
  }).join("");
}
async function submitReview(e) {
  e.preventDefault();
  const author = document.getElementById("rv-name")?.value.trim() || "";
  const country = document.getElementById("rv-country")?.value.trim() || "";
  const rating = document.getElementById("rv-rating")?.value || "10";
  const text = document.getElementById("rv-text")?.value.trim() || "";
  const msg = document.getElementById("review-msg");
  if (!author || !text) { if (msg) { msg.textContent = t("rev.required"); msg.className = "form-msg err"; } return; }
  if (msg) { msg.textContent = t("rev.sending"); msg.className = "form-msg"; }
  try {
    const res = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ author, country, rating, text }) });
    if (res.ok) { if (msg) { msg.textContent = t("rev.thanks"); msg.className = "form-msg ok"; } e.target.reset(); }
    else { if (msg) { msg.textContent = t("rev.error"); msg.className = "form-msg err"; } }
  } catch (err) { if (msg) { msg.textContent = t("rev.error"); msg.className = "form-msg err"; } }
}

/* ---------------- Media feed (Jurnal) ---------------- */
async function initFeed() {
  const teaser = document.getElementById("feed-teaser");
  const grid = document.getElementById("feed-grid");
  if (!teaser && !grid) return;
  let posts = [];
  try { const res = await fetch("/api/feed", { cache: "no-store" }); posts = (await res.json()).posts || []; } catch (e) { /* offline */ }
  if (teaser) {
    const wrap = document.getElementById("feed-teaser-wrap");
    if (!posts.length) { if (wrap) wrap.classList.add("hidden"); }
    else { renderFeed(teaser, posts.slice(0, 3), false); if (wrap) wrap.classList.remove("hidden"); }
  }
  if (grid) {
    if (!posts.length) grid.innerHTML = `<p style="color:var(--muted)">${t("feed.none")}</p>`;
    else { renderFeed(grid, posts, true); bindFeedLightbox(grid, posts); }
  }
}
function renderFeed(container, posts, full) {
  const lang = getLang();
  container.innerHTML = posts.map(p => {
    const dateStr = (p.date || p.createdAt) ? fmtPhotoDate(p.date || p.createdAt, lang) : "";
    const dateBadge = dateStr ? `<time class="feed-date">${dateStr}</time>` : "";
    const cap = (p.caption || p.place)
      ? `<div class="feed-cap">${esc(p.caption || "")}${p.place ? `<span class="feed-place">${esc(p.place)}</span>` : ""}</div>`
      : "";
    return `
    <a class="feed-item" href="/api/feed/img?id=${encodeURIComponent(p.id)}">
      <img loading="lazy" src="/api/feed/img?id=${encodeURIComponent(p.id)}" alt="${esc(p.caption || 'Montania')}">
      ${dateBadge}
      ${cap}
    </a>`;
  }).join("");
}
function bindFeedLightbox(container, posts) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = document.getElementById("lb-img");
  const srcs = posts.map(p => `/api/feed/img?id=${encodeURIComponent(p.id)}`);
  let cur = 0;
  const show = i => { cur = (i + srcs.length) % srcs.length; img.src = srcs[cur]; };
  const open = i => { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); };
  const close = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };
  container.querySelectorAll(".feed-item").forEach((a, i) => a.addEventListener("click", e => { e.preventDefault(); open(i); }));
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = e => { e.stopPropagation(); show(cur - 1); };
  lb.querySelector(".lb-next").onclick = e => { e.stopPropagation(); show(cur + 1); };
  lb.onclick = e => { if (e.target === lb) close(); };
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });
}
