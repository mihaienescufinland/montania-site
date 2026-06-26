/* =====================================================================
   MONTANIA — main.js
   Navigație, camere, produse + calendar de disponibilitate (rezervare directă)
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
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
    renderRooms();
    if (booking.state.room) renderCalendar();
    updateSummary();
  });
});

/* ---------------- Helpers ---------------- */
function ymd(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function parseYmd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function L(obj) { return obj[getLang()] || obj.ro; }

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
        <div class="room-meta">
          <span>👤 ${r.capacity} ${r.capacity === 1 ? t("vila.rooms.person") : t("vila.rooms.persons")}</span>
          <span>📐 ${r.size} m²</span>
        </div>
        <div class="chips">${L(r.amenities).map(a => `<span class="chip">${a}</span>`).join("")}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px">
          <span class="price-tag">${r.price} <small>RON / ${t("vila.book.night")}</small></span>
          <button class="btn btn-primary" data-bookroom="${r.id}">${t("vila.rooms.book")}</button>
        </div>
      </div>
    </div>`).join("");

  grid.querySelectorAll("[data-bookroom]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = document.getElementById("room-select");
      if (sel) { sel.value = btn.dataset.bookroom; sel.dispatchEvent(new Event("change")); }
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

/* ---------------- Booking / availability ---------------- */
const booking = {
  state: { room: null, checkIn: null, checkOut: null, viewYear: 0, viewMonth: 0 }
};

function initBooking() {
  const cal = document.getElementById("calendar");
  if (!cal) return;

  const sel = document.getElementById("room-select");
  sel.innerHTML = SITE.rooms.map(r => `<option value="${r.id}">${L(r.name)} — ${r.price} RON</option>`).join("");
  booking.state.room = SITE.rooms[0];

  const now = startOfDay(new Date());
  booking.state.viewYear = now.getFullYear();
  booking.state.viewMonth = now.getMonth();

  sel.addEventListener("change", () => {
    booking.state.room = SITE.rooms.find(r => r.id === sel.value);
    booking.state.checkIn = booking.state.checkOut = null;
    renderCalendar(); updateSummary();
  });

  document.getElementById("cal-prev").addEventListener("click", () => shiftMonth(-1));
  document.getElementById("cal-next").addEventListener("click", () => shiftMonth(1));

  document.getElementById("booking-form").addEventListener("submit", submitBooking);
  document.getElementById("wa-btn")?.addEventListener("click", sendWhatsApp);

  renderCalendar();
  updateSummary();
}

function shiftMonth(delta) {
  let m = booking.state.viewMonth + delta;
  let y = booking.state.viewYear;
  if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
  booking.state.viewMonth = m; booking.state.viewYear = y;
  renderCalendar();
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  if (!cal || !booking.state.room) return;
  const lang = getLang();
  const { viewYear: y, viewMonth: m } = booking.state;
  const today = startOfDay(new Date());
  const bookedSet = new Set(booking.state.room.booked || []);

  const monthName = new Date(y, m, 1).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { month: "long", year: "numeric" });
  const dows = lang === "en" ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] : ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

  let firstDow = new Date(y, m, 1).getDay(); // 0=Sun
  firstDow = (firstDow + 6) % 7; // make Monday=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  let html = `
    <div class="cal-head">
      <button id="cal-prev2" aria-label="prev">‹</button>
      <div class="cal-title">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
      <button id="cal-next2" aria-label="next">›</button>
    </div>
    <div class="cal-grid">${dows.map(d => `<div class="cal-dow">${d}</div>`).join("")}`;

  for (let i = 0; i < firstDow; i++) html += `<div class="cal-day empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const key = ymd(date);
    let cls = "cal-day", clickable = true;
    if (date < today) { cls += " past"; clickable = false; }
    else if (bookedSet.has(key)) { cls += " booked"; clickable = false; }
    else cls += " available";

    const ci = booking.state.checkIn, co = booking.state.checkOut;
    if (ci && key === ymd(ci)) cls += " selected";
    else if (co && key === ymd(co)) cls += " selected";
    else if (ci && co && date > ci && date < co) cls += " in-range";

    html += `<div class="${cls}" ${clickable ? `data-day="${key}"` : ""}>${day}</div>`;
  }
  html += `</div>`;
  cal.innerHTML = html;

  // re-bind month nav (rendered inside)
  cal.querySelector("#cal-prev2").addEventListener("click", () => shiftMonth(-1));
  cal.querySelector("#cal-next2").addEventListener("click", () => shiftMonth(1));
  cal.querySelectorAll("[data-day]").forEach(el => el.addEventListener("click", () => onDayClick(el.dataset.day)));
}

function rangeHasBooked(start, end, bookedSet) {
  const d = new Date(start);
  while (d < end) {
    if (bookedSet.has(ymd(d))) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

function onDayClick(key) {
  const date = parseYmd(key);
  const s = booking.state;
  const bookedSet = new Set(s.room.booked || []);

  if (!s.checkIn || (s.checkIn && s.checkOut)) {
    s.checkIn = date; s.checkOut = null;
  } else if (date > s.checkIn) {
    if (rangeHasBooked(s.checkIn, date, bookedSet)) { s.checkIn = date; s.checkOut = null; }
    else s.checkOut = date;
  } else {
    s.checkIn = date; s.checkOut = null;
  }
  renderCalendar();
  updateSummary();
}

function nightsBetween(a, b) { return Math.round((b - a) / 86400000); }

function updateSummary() {
  const box = document.getElementById("summary");
  if (!box) return;
  const s = booking.state;
  const ciField = document.getElementById("f-checkin");
  const coField = document.getElementById("f-checkout");

  if (!s.checkIn) {
    box.innerHTML = `<span style="color:var(--muted)">${t("vila.book.pickdates")}</span>`;
    if (ciField) ciField.value = ""; if (coField) coField.value = "";
    return;
  }
  if (ciField) ciField.value = ymd(s.checkIn);
  if (!s.checkOut) {
    box.innerHTML = `<strong>${t("vila.book.checkin")}:</strong> ${ymd(s.checkIn)} — <span style="color:var(--muted)">${t("vila.book.pickdates")}</span>`;
    if (coField) coField.value = "";
    return;
  }
  if (coField) coField.value = ymd(s.checkOut);
  const n = nightsBetween(s.checkIn, s.checkOut);
  const total = n * s.room.price;
  box.innerHTML = `
    <div><strong>${L(s.room.name)}</strong></div>
    <div>${ymd(s.checkIn)} → ${ymd(s.checkOut)} · ${n} ${n === 1 ? t("vila.book.night") : t("vila.book.nights")}</div>
    <div style="margin-top:6px;font-size:1.1rem"><strong>${t("vila.book.total")}: ${total} RON</strong></div>`;
}

function buildMessage() {
  const s = booking.state;
  const name = document.getElementById("f-name")?.value || "";
  const guests = document.getElementById("f-guests")?.value || "";
  const msg = document.getElementById("f-message")?.value || "";
  const lines = [
    (getLang() === "en" ? "Booking request — TUI Villa" : "Cerere rezervare — Vila TUI"),
    `${t("vila.book.room")}: ${L(s.room.name)}`,
    `${t("vila.book.checkin")}: ${s.checkIn ? ymd(s.checkIn) : "-"}`,
    `${t("vila.book.checkout")}: ${s.checkOut ? ymd(s.checkOut) : "-"}`,
    `${t("vila.book.guests")}: ${guests}`,
    `${t("vila.book.name")}: ${name}`,
    msg ? `${t("vila.book.message")}: ${msg}` : ""
  ].filter(Boolean);
  return lines.join("\n");
}

function submitBooking(e) {
  e.preventDefault();
  const s = booking.state;
  if (!s.room || !s.checkIn || !s.checkOut) { alert(t("alert.pickroom")); return; }
  const subject = encodeURIComponent(getLang() === "en" ? "Booking request — TUI Villa" : "Cerere rezervare — Vila TUI");
  const body = encodeURIComponent(buildMessage());
  window.location.href = `mailto:${SITE.contact.email}?subject=${subject}&body=${body}`;
  alert(t("alert.thanks"));
}

function sendWhatsApp(e) {
  e.preventDefault();
  const s = booking.state;
  if (!s.room || !s.checkIn || !s.checkOut) { alert(t("alert.pickroom")); return; }
  window.open(`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(buildMessage())}`, "_blank");
}
