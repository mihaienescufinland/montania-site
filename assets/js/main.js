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
  renderBV();
  initBooking();

  document.addEventListener("langchange", () => {
    injectContact();
    renderRooms();
    if (document.getElementById("calendar")) { renderCalendar(); updateSummary(); renderRateTable(); }
  });
});

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
  document.querySelectorAll("[data-contact='address']").forEach(e => { e.textContent = getLang() === "en" ? c.addressEn : c.addressRo; });
  document.querySelectorAll("[data-contact='maps']").forEach(e => { e.href = c.mapsUrl; });
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
      <img src="${r.img}" alt="${L(r.name)}" loading="lazy">
      <div class="card-body">
        <h3>${L(r.name)}</h3>
        <div class="pills">${featurePills(r)}</div>
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

/* ---------------- BV produce (secondary) ---------------- */
function renderBV() {
  const grid = document.getElementById("bv-grid");
  if (!grid) return;
  const phoneEl = document.getElementById("bv-phone");
  if (phoneEl) phoneEl.textContent = SITE.bv.phone;
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
  balcony: { ro: "Balcon", en: "Balcony" },
  view: { ro: "Vedere", en: "View" },
  garden_view: { ro: "Vedere la grădină", en: "Garden view" },
  courtyard_view: { ro: "Vedere la curtea interioară", en: "Inner courtyard view" },
  bath: { ro: "Baie privată", en: "Private bathroom" },
  tv: { ro: "TV cu ecran plat", en: "Flat-screen TV" },
  sound: { ro: "Izolare fonică", en: "Soundproofing" },
  wifi: { ro: "WiFi gratuit", en: "Free WiFi" },
  kitchenette: { ro: "Chicinetă privată", en: "Private kitchenette" },
  coffee: { ro: "Ceai/cafea", en: "Tea/coffee" },
  heating: { ro: "Încălzire", en: "Heating" },
  accessible: { ro: "Acces la parter", en: "Step-free access" }
};
const BEDLABEL = {
  double: { ro: "1 pat dublu mare", en: "1 large double bed" },
  triple: { ro: "Pat dublu + 1 loc / canapea", en: "Double bed + 1 / sofa" },
  two_double: { ro: "2 dormitoare · 2 paturi duble", en: "2 bedrooms · 2 double beds" }
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
  document.getElementById("f-guests")?.addEventListener("change", renderRateTable);
  renderCalendar();
  updateSummary();
  renderRateTable();
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

  for (let i = 0; i < firstDow; i++) html += `<div class="cal-day empty"></div>`;

  const ci = booking.state.checkIn, co = booking.state.checkOut;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const key = ymd(date);
    let cls = "cal-day", clickable = true;
    if (date < today) { cls += " past"; clickable = false; }
    else cls += " available";
    if (ci && key === ymd(ci)) cls += " selected";
    else if (co && key === ymd(co)) cls += " selected";
    else if (ci && co && date > ci && date < co) cls += " in-range";
    html += `<div class="${cls}" ${clickable ? `data-day="${key}"` : ""}><span class="cal-num">${day}</span></div>`;
  }
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

/* Price + availability of a room for the selected range */
function roomRangeInfo(room) {
  const s = booking.state;
  if (!s.checkIn || !s.checkOut) return { complete: false, available: true, perNight: room.price };
  let total = 0, available = true;
  const booked = new Set(room.booked || []);
  const d = new Date(s.checkIn);
  while (d < s.checkOut) {
    const key = ymd(d);
    const info = dayInfo(room, key);
    if (info.a <= 0 || booked.has(key)) available = false;
    total += info.p;
    d.setDate(d.getDate() + 1);
  }
  const n = nightsBetween(s.checkIn, s.checkOut);
  return { complete: true, available, nights: n, total, perNight: Math.round(total / n) };
}

/* All-rooms rate table for the selected period (Booking-style) */
function renderRateTable() {
  const wrap = document.getElementById("rate-table");
  if (!wrap) return;
  const night = t("vila.book.night");
  const rows = SITE.rooms.map(room => {
    const ri = roomRangeInfo(room);
    let priceHtml, availHtml, btn;
    if (ri.complete && ri.available) {
      priceHtml = `<div class="rate-price">${ri.total} <small>RON</small></div><div class="rate-sub">${ri.nights} ${ri.nights === 1 ? night : t("vila.book.nights")} · ${ri.perNight} RON/${night}</div>`;
      availHtml = `<span class="badge-ok">${t("rate.available")}</span>`;
      btn = `<button class="btn btn-primary" type="button" data-reserve="${room.id}">${t("vila.book.whatsapp")}</button>`;
    } else if (ri.complete && !ri.available) {
      priceHtml = `<div class="rate-sub">${t("rate.from")} ${room.price} RON/${night}</div>`;
      availHtml = `<span class="badge-no">${t("rate.sold")}</span>`;
      btn = `<button class="btn btn-outline" type="button" disabled>${t("rate.sold")}</button>`;
    } else {
      priceHtml = `<div class="rate-price">${t("rate.from")} ${room.price} <small>RON/${night}</small></div>`;
      availHtml = "";
      btn = `<button class="btn btn-primary" type="button" data-reserve="${room.id}">${t("vila.book.whatsapp")}</button>`;
    }
    return `<div class="rate-row">
      <img class="rate-thumb" src="${room.img}" alt="${L(room.name)}" loading="lazy">
      <div class="rate-main">
        <h3>${L(room.name)}</h3>
        <div class="pills">${featurePills(room)}</div>
        ${availHtml}
      </div>
      <div class="rate-side">${priceHtml}${btn}</div>
    </div>`;
  }).join("");
  wrap.innerHTML = rows;
  wrap.querySelectorAll("[data-reserve]").forEach(b => b.addEventListener("click", () => reserveRoom(b.dataset.reserve)));
}

function reserveRoom(id) {
  const room = SITE.rooms.find(r => r.id === id);
  if (!room) return;
  const s = booking.state;
  const guests = document.getElementById("f-guests")?.value || "";
  const lang = getLang();
  const lines = [
    lang === "en" ? "Booking request — TUI Villa" : "Cerere rezervare — Vila TUI",
    `${t("vila.book.room")}: ${L(room.name)}`,
    `${t("vila.book.checkin")}: ${s.checkIn ? ymd(s.checkIn) : "-"}`,
    `${t("vila.book.checkout")}: ${s.checkOut ? ymd(s.checkOut) : "-"}`,
    `${t("vila.book.guests")}: ${guests}`
  ];
  if (s.checkIn && s.checkOut) {
    const ri = roomRangeInfo(room);
    lines.push(`${t("vila.book.total")}: ${ri.total} RON (${ri.nights} ${ri.nights === 1 ? t("vila.book.night") : t("vila.book.nights")})`);
  }
  window.open(`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
}
